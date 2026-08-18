import { put, list } from '@vercel/blob';
import { kv } from '@vercel/kv';
import postgres from 'postgres';
import { VerifiedEvent } from './events';

const BLOB_PATHNAME = 'verified_events.json';

// In-memory runtime cache for serverless invocation lifecycle
let memoryEventsCache: VerifiedEvent[] = [];

// 1. Try Vercel KV Storage
async function getEventsFromKV(): Promise<VerifiedEvent[] | null> {
  try {
    const data = await kv.get<VerifiedEvent[]>('verified_events');
    if (data && Array.isArray(data)) {
      return data;
    }
  } catch (err) {
    // KV not connected or env missing, fallback silently to Vercel Blob / Postgres
  }
  return null;
}

async function saveEventsToKV(events: VerifiedEvent[]): Promise<boolean> {
  try {
    await kv.set('verified_events', events);
    return true;
  } catch (err) {
    return false;
  }
}

// 2. Vercel Blob Storage Native Storage (No external DB needed)
async function getEventsFromVercelBlob(): Promise<VerifiedEvent[] | null> {
  try {
    const token = process.env.VERCEL_BLOB_READ_WRITE_TOKEN;
    if (!token) return null;

    const { blobs } = await list({ prefix: BLOB_PATHNAME, token });
    const targetBlob = blobs.find(b => b.pathname === BLOB_PATHNAME);
    if (!targetBlob) return null;

    const res = await fetch(targetBlob.url);
    if (res.ok) {
      const data: VerifiedEvent[] = await res.json();
      return data;
    }
  } catch (err) {
    console.error('Vercel Blob read error:', err);
  }
  return null;
}

async function saveEventsToVercelBlob(events: VerifiedEvent[]): Promise<boolean> {
  try {
    const token = process.env.VERCEL_BLOB_READ_WRITE_TOKEN;
    if (!token) return false;

    await put(BLOB_PATHNAME, JSON.stringify(events, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
      token
    });
    return true;
  } catch (err) {
    console.error('Vercel Blob save error:', err);
    return false;
  }
}

// 3. Fallback PostgreSQL (Vercel Postgres or Direct Postgres)
const postgresConnStr = process.env.POSTGRES_URL || process.env.DATABASE_URL;
let sqlClient: any = null;

if (postgresConnStr) {
  try {
    sqlClient = postgres(postgresConnStr, { ssl: 'require' });
  } catch (e) {
    // Ignore if not configured
  }
}

export async function fetchPublicVerifiedEvents(): Promise<VerifiedEvent[]> {
  const todayStr = new Date().toISOString().split('T')[0];

  // Strategy A: Vercel KV
  const kvEvents = await getEventsFromKV();
  if (kvEvents) {
    memoryEventsCache = kvEvents;
    return kvEvents.filter(e => e.verified && e.start_date >= todayStr);
  }

  // Strategy B: Vercel Blob (Built-in Vercel storage)
  const blobEvents = await getEventsFromVercelBlob();
  if (blobEvents) {
    memoryEventsCache = blobEvents;
    return blobEvents.filter(e => e.verified && e.start_date >= todayStr);
  }

  // Strategy C: Vercel Postgres
  if (sqlClient) {
    try {
      const rows = await sqlClient`
        SELECT 
          id, title, category, 
          to_char(start_date, 'YYYY-MM-DD') as start_date, 
          start_time, venue_name, city, price, 
          source_urls, verification_sources, verified
        FROM verified_events
        WHERE verified = true
          AND start_date >= ${todayStr}::date
        ORDER BY start_date ASC, start_time ASC;
      `;
      const pgEvents = rows.map((r: any) => ({
        id: r.id,
        title: r.title,
        category: r.category,
        start_date: r.start_date,
        start_time: r.start_time,
        venue_name: r.venue_name,
        city: r.city,
        price: r.price,
        source_urls: r.source_urls || [],
        verification_sources: r.verification_sources || [],
        verified: r.verified
      }));
      memoryEventsCache = pgEvents;
      return pgEvents;
    } catch (err) {
      console.error('Postgres fetch error:', err);
    }
  }

  // Strategy D: Native In-Memory Runtime Cache (Pure serverless state)
  return memoryEventsCache.filter(e => e.verified && e.start_date >= todayStr);
}

export async function saveVerifiedEvents(newEvents: VerifiedEvent[]): Promise<{ inserted: number; updated: number }> {
  let inserted = 0;
  let updated = 0;

  // Merge new events into memory cache with upsert deduplication
  const mergedMap = new Map<string, VerifiedEvent>();
  
  // Existing events
  memoryEventsCache.forEach(e => mergedMap.set(e.id, e));

  // Upsert new
  for (const evt of newEvents) {
    if (mergedMap.has(evt.id)) {
      updated++;
    } else {
      inserted++;
    }
    mergedMap.set(evt.id, evt);
  }

  const allMergedEvents = Array.from(mergedMap.values());
  memoryEventsCache = allMergedEvents;

  // Save to Vercel KV if available
  await saveEventsToKV(allMergedEvents);

  // Save to Vercel Blob (Built-in Vercel storage)
  await saveEventsToVercelBlob(allMergedEvents);

  // Save to Vercel Postgres if configured
  if (sqlClient) {
    try {
      await sqlClient`
        CREATE TABLE IF NOT EXISTS verified_events (
          id VARCHAR(255) PRIMARY KEY,
          title TEXT NOT NULL,
          category VARCHAR(50) NOT NULL,
          start_date DATE NOT NULL,
          start_time VARCHAR(10) NOT NULL,
          venue_name TEXT NOT NULL,
          city VARCHAR(100) NOT NULL DEFAULT 'Tuzla',
          price TEXT,
          source_urls TEXT[] NOT NULL,
          verification_sources TEXT[] NOT NULL,
          verified BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;
      for (const evt of newEvents) {
        await sqlClient`
          INSERT INTO verified_events (
            id, title, category, start_date, start_time, venue_name, city, price, source_urls, verification_sources, verified, updated_at
          ) VALUES (
            ${evt.id}, ${evt.title}, ${evt.category}, ${evt.start_date}::date, ${evt.start_time}, ${evt.venue_name}, ${evt.city}, ${evt.price}, ${evt.source_urls}, ${evt.verification_sources}, ${evt.verified}, NOW()
          )
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            category = EXCLUDED.category,
            start_date = EXCLUDED.start_date,
            start_time = EXCLUDED.start_time,
            venue_name = EXCLUDED.venue_name,
            price = EXCLUDED.price,
            source_urls = EXCLUDED.source_urls,
            verification_sources = EXCLUDED.verification_sources,
            verified = EXCLUDED.verified,
            updated_at = NOW();
        `;
      }
    } catch (err) {
      console.error('Postgres save error:', err);
    }
  }

  return { inserted, updated };
}

import { and, asc, eq, gte } from 'drizzle-orm';
import { db } from '../db/index.js';
import { verifiedEvents } from '../db/schema.js';
import { VerifiedEvent } from '../types/events';

function toVerifiedEvent(row: typeof verifiedEvents.$inferSelect): VerifiedEvent {
  return {
    id: row.id,
    title: row.title,
    category: row.category as VerifiedEvent['category'],
    start_date: row.startDate,
    start_time: row.startTime,
    venue_name: row.venueName,
    city: row.city,
    price: row.price,
    source_urls: row.sourceUrls,
    verification_sources: row.verificationSources,
    verified: row.verified,
    created_at: row.createdAt?.toISOString(),
    updated_at: row.updatedAt?.toISOString(),
  };
}

export async function fetchPublicVerifiedEvents(): Promise<VerifiedEvent[]> {
  const todayStr = new Date().toISOString().split('T')[0];

  const rows = await db
    .select()
    .from(verifiedEvents)
    .where(and(eq(verifiedEvents.verified, true), gte(verifiedEvents.startDate, todayStr)))
    .orderBy(asc(verifiedEvents.startDate), asc(verifiedEvents.startTime));

  return rows.map(toVerifiedEvent);
}

export async function saveVerifiedEvents(newEvents: VerifiedEvent[]): Promise<{ inserted: number; updated: number }> {
  let inserted = 0;
  let updated = 0;

  for (const evt of newEvents) {
    const existing = await db
      .select({ id: verifiedEvents.id })
      .from(verifiedEvents)
      .where(eq(verifiedEvents.id, evt.id));

    if (existing.length > 0) {
      updated++;
    } else {
      inserted++;
    }

    await db
      .insert(verifiedEvents)
      .values({
        id: evt.id,
        title: evt.title,
        category: evt.category,
        startDate: evt.start_date,
        startTime: evt.start_time,
        venueName: evt.venue_name,
        city: evt.city,
        price: evt.price,
        sourceUrls: evt.source_urls,
        verificationSources: evt.verification_sources,
        verified: evt.verified,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: verifiedEvents.id,
        set: {
          title: evt.title,
          category: evt.category,
          startDate: evt.start_date,
          startTime: evt.start_time,
          venueName: evt.venue_name,
          price: evt.price,
          sourceUrls: evt.source_urls,
          verificationSources: evt.verification_sources,
          verified: evt.verified,
          updatedAt: new Date(),
        },
      });
  }

  return { inserted, updated };
}

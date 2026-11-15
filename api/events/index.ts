import type { VercelRequest, VercelResponse } from '@vercel/node';
import { timingSafeEqual } from 'node:crypto';
import { fetchPublicVerifiedEvents, saveVerifiedEvents, normalizeImportedEvents, deleteEventById } from '../../utils/eventsDb';

const MAX_EVENT_IMPORT_BYTES = 1_000_000;

function hasAdminAuthorization(req: VercelRequest): boolean {
  const expectedToken = process.env.EVENTS_ADMIN_TOKEN;
  const authorization = req.headers.authorization;

  // Fail closed until a private admin token has been configured in Vercel.
  if (!expectedToken || typeof authorization !== 'string') return false;
  const prefix = 'Bearer ';
  if (!authorization.startsWith(prefix)) return false;

  const supplied = Buffer.from(authorization.slice(prefix.length));
  const expected = Buffer.from(expectedToken);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Vary', 'Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 'public, max-age=120, s-maxage=300, stale-while-revalidate=600');
      const events = await fetchPublicVerifiedEvents();
      return res.status(200).json(events);
    }

    if (req.method === 'POST' || req.method === 'DELETE') {
      if (!hasAdminAuthorization(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      res.setHeader('Cache-Control', 'no-store');
    }

    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        if (Buffer.byteLength(body, 'utf8') > MAX_EVENT_IMPORT_BYTES) {
          return res.status(413).json({ error: 'Event import payload is too large.' });
        }
        try {
          body = JSON.parse(body);
        } catch {
          return res.status(400).json({ error: 'Request body must contain valid JSON.' });
        }
      } else if (Buffer.byteLength(JSON.stringify(body ?? null), 'utf8') > MAX_EVENT_IMPORT_BYTES) {
        return res.status(413).json({ error: 'Event import payload is too large.' });
      }

      const rawItems = Array.isArray(body) ? body : (body && typeof body === 'object' ? [body] : []);

      if (rawItems.length === 0) {
        return res.status(400).json({ error: 'No valid event data provided in request body.' });
      }

      const normalizedEvents = normalizeImportedEvents(rawItems);
      if (normalizedEvents.length === 0) {
        return res.status(400).json({ error: 'Failed to parse events.' });
      }

      const stats = await saveVerifiedEvents(normalizedEvents);
      return res.status(200).json({
        success: true,
        message: `Successfully inserted ${normalizedEvents.length} event(s).`,
        count: normalizedEvents.length,
        stats,
        events: normalizedEvents
      });
    }

    if (req.method === 'DELETE') {
      const id = (req.query.id as string) || req.body?.id;
      if (typeof id !== 'string' || !id.trim() || id.length > 255) {
        return res.status(400).json({ error: 'A valid event ID is required.' });
      }
      await deleteEventById(id);
      return res.status(200).json({ success: true, deletedId: id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: unknown) {
    console.error('API /api/events error:', error);
    return res.status(500).json({ error: 'Server error processing events.' });
  }
}

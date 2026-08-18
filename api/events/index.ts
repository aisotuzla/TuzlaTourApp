import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchPublicVerifiedEvents } from '../../utils/eventsDb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Set caching headers for PWA efficiency
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=1200');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const events = await fetchPublicVerifiedEvents();
    return res.status(200).json(events);
  } catch (error) {
    console.error('API /api/events error:', error);
    // Never expose technical error details to user
    return res.status(500).json({ error: 'Failed to fetch verified events' });
  }
}

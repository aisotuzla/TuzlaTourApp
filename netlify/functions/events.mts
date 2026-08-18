import type { Config } from '@netlify/functions';
import { fetchPublicVerifiedEvents } from '../../utils/eventsDb.js';

export default async (req: Request) => {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const events = await fetchPublicVerifiedEvents();
    return new Response(JSON.stringify(events), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  } catch (error) {
    console.error('API /api/events error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch verified events' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const config: Config = {
  path: '/api/events',
  method: 'GET',
};

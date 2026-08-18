import type { VercelRequest, VercelResponse } from '@vercel/node';
import { crawlAllApprovedSources } from '../../utils/sourcesCrawler';
import { matchAndVerifyCandidates } from '../../utils/eventMatcher';
import { saveVerifiedEvents } from '../../utils/eventsDb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Verify Cron Authorization Secret
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // 2. Crawl the 3 approved websites
    const candidates = await crawlAllApprovedSources();

    // 3. Normalize, Match, & Enforce Strict 2+ Source Verification Rule
    const verifiedEvents = matchAndVerifyCandidates(candidates);

    // 4. Upsert Verified Events into Database
    const stats = await saveVerifiedEvents(verifiedEvents);

    return res.status(200).json({
      success: true,
      crawledCandidates: candidates.length,
      verifiedEventsCount: verifiedEvents.length,
      stats
    });
  } catch (error) {
    console.error('Cron crawler execution error:', error);
    return res.status(500).json({ error: 'Cron execution failed' });
  }
}

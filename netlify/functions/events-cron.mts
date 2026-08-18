import type { Config } from '@netlify/functions';
import { crawlAllApprovedSources } from '../../utils/sourcesCrawler.js';
import { matchAndVerifyCandidates } from '../../utils/eventMatcher.js';
import { saveVerifiedEvents } from '../../utils/eventsDb.js';

export default async () => {
  try {
    const candidates = await crawlAllApprovedSources();
    const verified = matchAndVerifyCandidates(candidates);
    const stats = await saveVerifiedEvents(verified);

    console.log('Events crawl complete', {
      crawledCandidates: candidates.length,
      verifiedEventsCount: verified.length,
      stats,
    });
  } catch (error) {
    console.error('Events cron execution error:', error);
  }
};

export const config: Config = {
  schedule: '0 */6 * * *',
};

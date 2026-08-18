import { VerifiedEvent, ExtractedCandidateEvent, VerifiedEventCategory, ALLOWED_EVENT_CATEGORIES } from '../types/events';

// Normalize string for title matching: lowercases, removes diacritics, punctuation, extra spaces
export function normalizeString(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritical marks
    .replace(/đ/g, 'd')
    .replace(/ć/g, 'c')
    .replace(/č/g, 'c')
    .replace(/š/g, 's')
    .replace(/ž/g, 'z')
    .replace(/[^a-z0-9\s]/g, ' ') // replace non-alphanumeric with space
    .replace(/\s+/g, ' ')
    .trim();
}

// Check if candidate event is strictly in Tuzla
export function isTuzlaCity(city: string): boolean {
  if (!city) return false;
  const norm = normalizeString(city);
  return norm.includes('tuzla');
}

// Check if category is allowed
export function isAllowedCategory(category: string): category is VerifiedEventCategory {
  return ALLOWED_EVENT_CATEGORIES.includes(category as VerifiedEventCategory);
}

// Determine if date/time is in the future
export function isFutureEvent(startDateStr: string, startTimeStr: string): boolean {
  try {
    const eventDateTime = new Date(`${startDateStr}T${startTimeStr}:00`);
    if (isNaN(eventDateTime.getTime())) return false;
    const now = new Date();
    return eventDateTime.getTime() >= now.getTime();
  } catch {
    return false;
  }
}

// Calculate similarity ratio between two normalized strings (0 to 1)
export function stringSimilarity(str1: string, str2: string): number {
  const s1 = normalizeString(str1);
  const s2 = normalizeString(str2);

  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  // If one contains the other and length difference is small
  if ((s1.includes(s2) || s2.includes(s1)) && Math.abs(s1.length - s2.length) < 15) {
    return 0.85;
  }

  // Word overlap Jaccard index
  const words1 = new Set(s1.split(' ').filter(w => w.length > 2));
  const words2 = new Set(s2.split(' ').filter(w => w.length > 2));

  if (words1.size === 0 || words2.size === 0) return 0.0;

  let intersection = 0;
  words1.forEach(w => {
    if (words2.has(w)) intersection++;
  });

  const union = new Set([...words1, ...words2]).size;
  return intersection / union;
}

// Deterministic Event Matching & Verification Logic
// Requires AT LEAST 2 UNIQUE APPROVED SOURCES
export function matchAndVerifyCandidates(candidates: ExtractedCandidateEvent[]): VerifiedEvent[] {
  const APPROVED_DOMAINS = ['tuzlanski.ba', 'tip.ba', 'tuzlainfo.ba'];

  // Filter candidates for strict single-event validity first
  const validCandidates = candidates.filter(c => {
    if (!c.title || !c.start_date || !c.start_time || !c.venue_name) return false;
    if (!isTuzlaCity(c.city)) return false;
    if (!isAllowedCategory(c.category)) return false;

    // Must come from approved domain
    const dom = c.source_domain.toLowerCase();
    const isApprovedDomain = APPROVED_DOMAINS.some(ad => dom.includes(ad));
    if (!isApprovedDomain) return false;

    // Format validation
    if (!/^\d{4}-\d{2}-\d{2}$/.exec(c.start_date)) return false;
    if (!/^\d{2}:\d{2}$/.exec(c.start_time)) return false;

    return true;
  });

  // Group candidates that refer to the same event
  const clusters: ExtractedCandidateEvent[][] = [];

  for (const cand of validCandidates) {
    let matchedCluster: ExtractedCandidateEvent[] | null = null;

    for (const cluster of clusters) {
      const rep = cluster[0];

      // Exact matching fields: date & time must match
      if (cand.start_date !== rep.start_date) continue;
      if (cand.start_time !== rep.start_time) continue;

      // Title & Venue similarity
      const titleSim = stringSimilarity(cand.title, rep.title);
      const venueSim = stringSimilarity(cand.venue_name, rep.venue_name);

      // Match if titles are sufficiently similar OR if title & venue match well
      if (titleSim >= 0.55 || (titleSim >= 0.4 && venueSim >= 0.6)) {
        matchedCluster = cluster;
        break;
      }
    }

    if (matchedCluster) {
      // Don't add duplicate candidate from the exact same URL
      if (!matchedCluster.some(c => c.source_url === cand.source_url)) {
        matchedCluster.push(cand);
      }
    } else {
      clusters.push([cand]);
    }
  }

  const verifiedEvents: VerifiedEvent[] = [];

  for (const cluster of clusters) {
    // Collect unique verification source domains
    const sourceDomains = Array.from(
      new Set(
        cluster.map(c => {
          const dom = c.source_domain.toLowerCase();
          if (dom.includes('tuzlanski.ba')) return 'tuzlanski.ba';
          if (dom.includes('tip.ba')) return 'tip.ba';
          if (dom.includes('tuzlainfo.ba')) return 'tuzlainfo.ba';
          return dom;
        })
      )
    ).filter(d => APPROVED_DOMAINS.includes(d));

    // STRICT VERIFICATION RULE: Must have AT LEAST 2 unique approved sources
    if (sourceDomains.length >= 2) {
      // Pick best representative fields
      const rep = cluster[0];
      const sourceUrls = Array.from(new Set(cluster.map(c => c.source_url)));

      // Generate deterministic ID based on title, date, time
      const cleanTitleSlug = normalizeString(rep.title).replace(/\s+/g, '-').slice(0, 30);
      const deterministicId = `evt-${rep.start_date}-${rep.start_time.replace(':', '')}-${cleanTitleSlug}`;

      verifiedEvents.push({
        id: deterministicId,
        title: rep.title.trim(),
        category: rep.category,
        start_date: rep.start_date,
        start_time: rep.start_time,
        venue_name: rep.venue_name.trim(),
        city: 'Tuzla',
        price: rep.price || null,
        source_urls: sourceUrls,
        verification_sources: sourceDomains,
        verified: true
      });
    }
  }

  return verifiedEvents;
}

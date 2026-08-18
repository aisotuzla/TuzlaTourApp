import { ExtractedCandidateEvent, VerifiedEventCategory } from '../types/events';

interface HTMLScrapedArticle {
  title: string;
  url: string;
  domain: string;
  content: string;
}

// Rule-based HTML parser fallback when AI key is unavailable or for supplementary extraction
export function extractCandidateFromArticle(article: HTMLScrapedArticle): ExtractedCandidateEvent | null {
  const text = (article.title + ' ' + article.content).trim();
  const textLower = text.toLowerCase();

  // 1. Must be in Tuzla
  const nonTuzlaCities = ['sarajevo', 'mostar', 'banja luka', 'zenica', 'brcko', 'bihać', 'trebinje', 'zagreb', 'beograd'];
  const hasOtherCity = nonTuzlaCities.some(city => textLower.includes(city));
  const hasTuzlaKeyword = ['tuzla', 'tuzli', 'tušanj', 'mejdan', 'bkc', 'panonica', 'panonska', 'slana banja', 'trg slobode', 'soni trg', 'tuzlansk'].some(kw => textLower.includes(kw));

  if (hasOtherCity && !hasTuzlaKeyword) return null;

  // 2. Reject non-event articles (crime, politics, accident, history, traffic)
  const nonEventKeywords = ['hronika', 'nesreća', 'policija', 'hapšenje', 'saobraćaj', 'izbori', 'vladu', 'budžet', 'preminuo', 'optužnica', 'istraga'];
  if (nonEventKeywords.some(kw => textLower.includes(kw)) && !textLower.includes('utakmica') && !textLower.includes('koncert')) {
    return null;
  }

  // 3. Extract Date (Format YYYY-MM-DD or DD.MM.YYYY)
  let startDate: string | null = null;
  const datePattern = /(\d{1,2})\.(\d{1,2})\.(\d{4})?/;
  const dateMatch = text.match(datePattern);

  if (dateMatch) {
    const day = dateMatch[1].padStart(2, '0');
    const month = dateMatch[2].padStart(2, '0');
    const year = dateMatch[3] ? dateMatch[3] : new Date().getFullYear().toString();
    startDate = `${year}-${month}-${day}`;
  } else {
    // Check for relative dates or month names
    const monthsBs = ['januar', 'februar', 'mart', 'april', 'maj', 'juni', 'juli', 'august', 'septembar', 'oktobar', 'novembar', 'decembar'];
    for (let m = 0; m < monthsBs.length; m++) {
      const monthName = monthsBs[m];
      const monthPattern = new RegExp(`(\\d{1,2})\\.\\s*(${monthName})`, 'i');
      const monthMatch = text.match(monthPattern);
      if (monthMatch) {
        const day = monthMatch[1].padStart(2, '0');
        const month = String(m + 1).padStart(2, '0');
        const year = new Date().getFullYear().toString();
        startDate = `${year}-${month}-${day}`;
        break;
      }
    }
  }

  if (!startDate) return null;

  // 4. Extract Start Time (HH:mm)
  let startTime: string | null = null;
  const timeMatch = text.match(/(?:u|od)\s*(\d{1,2})[:.](\d{2})\s*(?:sati|h)?/i) || text.match(/(\d{1,2})[:.](\d{2})\s*(?:sati|h)/i);
  if (timeMatch) {
    const hours = timeMatch[1].padStart(2, '0');
    const minutes = timeMatch[2];
    startTime = `${hours}:${minutes}`;
  }

  if (!startTime) return null;

  // 5. Category classification
  let category: VerifiedEventCategory | null = null;
  if (textLower.includes('panonic') || textLower.includes('panonsk') || textLower.includes('slana jezera')) {
    category = 'Panonnica';
  } else if (textLower.includes('utakmica') || textLower.includes('fudbal') || textLower.includes('košarka') || textLower.includes('rukomet') || textLower.includes('odbojka') || textLower.includes('turnir') || textLower.includes('mejdan') || textLower.includes('tušanj')) {
    category = 'Sport';
  } else if (textLower.includes('koncert') || textLower.includes('muzika') || textLower.includes('nastup') || textLower.includes('svirka') || textLower.includes('festival')) {
    category = 'Music';
  } else if (textLower.includes('predstava') || textLower.includes('teatar') || textLower.includes('pozorište')) {
    category = 'Theatre';
  } else if (textLower.includes('film') || textLower.includes('kino') || textLower.includes('projekcija') || textLower.includes('premijera')) {
    category = 'Movie';
  } else if (textLower.includes('izložba') || textLower.includes('galerija') || textLower.includes('kultura') || textLower.includes('knjiga') || textLower.includes('muzej')) {
    category = 'Culture';
  }

  if (!category) return null;

  // 6. Venue extraction
  let venueName = 'Tuzla';
  if (textLower.includes('tušanj')) venueName = 'Stadion Tušanj';
  else if (textLower.includes('mejdan')) venueName = 'SKPC Mejdan';
  else if (textLower.includes('bkc')) venueName = 'BKC Tuzla';
  else if (textLower.includes('trg slobode')) venueName = 'Trg slobode';
  else if (textLower.includes('panonic') || textLower.includes('panonsk')) venueName = 'Panonska jezera';
  else if (textLower.includes('narodno pozorište')) venueName = 'Narodno pozorište Tuzla';
  else if (textLower.includes('mujezinović')) venueName = 'Atelje Ismet Mujezinović';

  // 7. Price extraction
  let price: string | null = null;
  if (textLower.includes('besplatan ulaz') || textLower.includes('ulaz slobodan')) {
    price = 'Besplatan ulaz';
  } else {
    const priceMatch = text.match(/(\d+\s*KM)/i);
    if (priceMatch) price = priceMatch[1];
  }

  return {
    title: article.title.trim(),
    category,
    start_date: startDate,
    start_time: startTime,
    venue_name: venueName,
    city: 'Tuzla',
    price,
    source_url: article.url,
    source_domain: article.domain
  };
}

import https from 'https';
import http from 'http';
import { ExtractedCandidateEvent } from '../types/events';
import { extractCandidateFromArticle } from './crawlerParsers';

interface ScrapedPage {
  url: string;
  domain: string;
  title: string;
  content: string;
}

// Simple HTTP getter with timeout and user-agent
function fetchHtml(url: string, timeoutMs: number = 8000): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) TuzlaTourGuideCrawler/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9'
        }
      },
      (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          let redirectUrl = res.headers.location;
          if (redirectUrl.startsWith('/')) {
            const urlObj = new URL(url);
            redirectUrl = `${urlObj.protocol}//${urlObj.host}${redirectUrl}`;
          }
          return fetchHtml(redirectUrl, timeoutMs).then(resolve).catch(reject);
        }

        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }

        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => resolve(body));
      }
    );

    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${url}`));
    });
  });
}

// Extract article links from HTML page
function parseArticleLinks(html: string, baseUrl: string, domainName: string): string[] {
  const links = new Set<string>();
  const linkRegex = /href=["']([^"']+)["']/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    let href = match[1];
    if (href.startsWith('#') || href.startsWith('javascript:')) continue;

    // Clean tracking params
    href = href.split('?')[0].split('#')[0];

    let fullUrl = href;
    if (href.startsWith('/')) {
      const urlObj = new URL(baseUrl);
      fullUrl = `${urlObj.protocol}//${urlObj.host}${href}`;
    } else if (!href.startsWith('http')) {
      continue;
    }

    if (fullUrl.includes(domainName)) {
      // Look for article patterns (slugs, numbers, event categories)
      if (
        fullUrl.length > baseUrl.length + 10 &&
        !fullUrl.includes('/tag/') &&
        !fullUrl.includes('/category/') &&
        !fullUrl.includes('/page/')
      ) {
        links.add(fullUrl);
      }
    }
  }

  return Array.from(links).slice(0, 15); // Limit max 15 articles per source for Vercel execution budget
}

// Source 1: Tuzlanski.ba Crawler
async function crawlTuzlanski(): Promise<ScrapedPage[]> {
  const domain = 'tuzlanski.ba';
  const targetSections = [
    'https://tuzlanski.ba/category/tuzla/',
    'https://tuzlanski.ba/category/zivot/kultura-zabava/'
  ];

  const scrapedPages: ScrapedPage[] = [];

  for (const sectionUrl of targetSections) {
    try {
      const html = await fetchHtml(sectionUrl);
      const articleUrls = parseArticleLinks(html, sectionUrl, domain);

      for (const articleUrl of articleUrls.slice(0, 6)) {
        try {
          const articleHtml = await fetchHtml(articleUrl);
          const titleMatch = articleHtml.match(/<h1[^>]*>(.*?)<\/h1>/i);
          const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';

          // Strip HTML tags for content
          const content = articleHtml.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
            .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ');

          if (title && content) {
            scrapedPages.push({ url: articleUrl, domain, title, content });
          }
        } catch {
          // Continue if single article fails
        }
      }
    } catch (err) {
      console.error(`Failed crawling section ${sectionUrl}:`, err);
    }
  }

  return scrapedPages;
}

// Source 2: TIP.ba Crawler
async function crawlTip(): Promise<ScrapedPage[]> {
  const domain = 'tip.ba';
  const targetSections = [
    'https://tip.ba/category/tuzla/',
    'https://tip.ba/category/kultura/'
  ];

  const scrapedPages: ScrapedPage[] = [];

  for (const sectionUrl of targetSections) {
    try {
      const html = await fetchHtml(sectionUrl);
      const articleUrls = parseArticleLinks(html, sectionUrl, domain);

      for (const articleUrl of articleUrls.slice(0, 6)) {
        try {
          const articleHtml = await fetchHtml(articleUrl);
          const titleMatch = articleHtml.match(/<h1[^>]*>(.*?)<\/h1>/i);
          const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';

          const content = articleHtml.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
            .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ');

          if (title && content) {
            scrapedPages.push({ url: articleUrl, domain, title, content });
          }
        } catch {
          // Continue if single article fails
        }
      }
    } catch (err) {
      console.error(`Failed crawling section ${sectionUrl}:`, err);
    }
  }

  return scrapedPages;
}

// Source 3: Tuzlainfo.ba Crawler
async function crawlTuzlainfo(): Promise<ScrapedPage[]> {
  const domain = 'tuzlainfo.ba';
  const targetSections = [
    'https://tuzlainfo.ba/index.php/vijesti/tuzla',
    'https://tuzlainfo.ba/index.php/kultura'
  ];

  const scrapedPages: ScrapedPage[] = [];

  for (const sectionUrl of targetSections) {
    try {
      const html = await fetchHtml(sectionUrl);
      const articleUrls = parseArticleLinks(html, sectionUrl, domain);

      for (const articleUrl of articleUrls.slice(0, 6)) {
        try {
          const articleHtml = await fetchHtml(articleUrl);
          const titleMatch = articleHtml.match(/<h1[^>]*>(.*?)<\/h1>/i) || articleHtml.match(/<h2[^>]*>(.*?)<\/h2>/i);
          const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';

          const content = articleHtml.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
            .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ');

          if (title && content) {
            scrapedPages.push({ url: articleUrl, domain, title, content });
          }
        } catch {
          // Continue if single article fails
        }
      }
    } catch (err) {
      console.error(`Failed crawling section ${sectionUrl}:`, err);
    }
  }

  return scrapedPages;
}

// Orchestrator: Crawl all 3 approved sources in parallel
export async function crawlAllApprovedSources(): Promise<ExtractedCandidateEvent[]> {
  const results = await Promise.allSettled([
    crawlTuzlanski(),
    crawlTip(),
    crawlTuzlainfo()
  ]);

  const allArticles: ScrapedPage[] = [];

  results.forEach((res) => {
    if (res.status === 'fulfilled') {
      allArticles.push(...res.value);
    }
  });

  const candidateEvents: ExtractedCandidateEvent[] = [];

  for (const article of allArticles) {
    const candidate = extractCandidateFromArticle(article);
    if (candidate) {
      candidateEvents.push(candidate);
    }
  }

  return candidateEvents;
}

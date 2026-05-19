export interface GlobeItem {
  title: string;
  link: string;
  image: string;
  source: string;
  pubDate: string;
  description: string;
}

export interface GlobeRegion {
  id: string;
  label: { fr: string; ar: string; en: string };
  flag: string;
  items: GlobeItem[];
}

declare global {
  var __globeCache: { data: GlobeRegion[]; fetchedAt: number } | undefined;
}

export const REGION_META: Record<string, { label: { fr: string; ar: string; en: string }; flag: string }> = {
  mena:   { flag: "🌙", label: { fr: "Moyen-Orient & Maghreb",  ar: "الشرق الأوسط والمغرب العربي", en: "Middle East & Maghreb" } },
  africa: { flag: "🌍", label: { fr: "Afrique",                  ar: "أفريقيا",                      en: "Africa" } },
  europe: { flag: "🏛️", label: { fr: "Europe",                   ar: "أوروبا",                      en: "Europe" } },
  monde:  { flag: "🌐", label: { fr: "Monde",                    ar: "العالم",                       en: "World" } },
};

type Feed = { url: string; region: string; source: string };

export const GLOBE_FEEDS: Feed[] = [
  { url: "https://feeds.bbci.co.uk/news/world/africa/rss.xml",     region: "africa", source: "BBC Africa" },
  { url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml", region: "mena",  source: "BBC MENA" },
  { url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml",     region: "europe", source: "BBC Europe" },
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml",            region: "monde",  source: "BBC World" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", region: "monde",  source: "New York Times" },
  { url: "https://www.france24.com/fr/afrique/rss",                region: "africa", source: "France 24 Afrique" },
  { url: "https://www.france24.com/fr/moyen-orient/rss",           region: "mena",   source: "France 24 ME" },
  { url: "https://www.france24.com/fr/europe/rss",                 region: "europe", source: "France 24 Europe" },
];

function unescapeHTML(str: string): string {
  return str
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
}

function extractTag(xml: string, tag: string): string {
  const cdataMatch = new RegExp(`<${tag}><\\!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, "i").exec(xml);
  if (cdataMatch) return cdataMatch[1].trim();
  const plainMatch = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i").exec(xml);
  return plainMatch ? unescapeHTML(plainMatch[1].trim()) : "";
}

function parseRSS(xml: string, source: string): GlobeItem[] {
  const items: GlobeItem[] = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;
  while ((match = itemRe.exec(xml)) !== null && items.length < 6) {
    const chunk = match[1];
    const title = extractTag(chunk, "title");
    if (!title) continue;
    let link = extractTag(chunk, "link");
    if (!link) { const m = /href="([^"]+)"/.exec(chunk); if (m) link = m[1]; }
    if (!link) continue;
    const description = extractTag(chunk, "description").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").slice(0, 180).trim();
    const pubDateRaw = extractTag(chunk, "pubDate") || extractTag(chunk, "published");
    let pubDate: string;
    try { pubDate = pubDateRaw ? new Date(pubDateRaw).toISOString() : new Date().toISOString(); }
    catch { pubDate = new Date().toISOString(); }
    const mediaMatch = /media:(?:content|thumbnail)[^>]+url="([^"]+)"/.exec(chunk);
    const enclosureMatch = /enclosure[^>]+url="([^"]+)"/.exec(chunk);
    const image = mediaMatch?.[1] || enclosureMatch?.[1]
      || `https://picsum.photos/seed/${encodeURIComponent(title.slice(0, 16))}/400/225`;
    items.push({ title, link, image, source, pubDate, description });
  }
  return items;
}

async function fetchFeed(feed: Feed): Promise<{ region: string; items: GlobeItem[] }> {
  try {
    const res = await fetch(feed.url, {
      headers: {
        "User-Agent": "DzWire/1.0 (+https://dzwire.replit.app) RSS Reader",
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
      },
      signal: AbortSignal.timeout(7000),
      next: { revalidate: 900 },
    });
    if (!res.ok) return { region: feed.region, items: [] };
    const xml = await res.text();
    return { region: feed.region, items: parseRSS(xml, feed.source) };
  } catch {
    return { region: feed.region, items: [] };
  }
}

const TTL = 15 * 60 * 1000;

export async function getGlobeData(): Promise<GlobeRegion[]> {
  if (global.__globeCache && global.__globeCache.data.length > 0 && Date.now() - global.__globeCache.fetchedAt < TTL) {
    return global.__globeCache.data;
  }
  global.__globeCache = undefined;

  const results = await Promise.allSettled(GLOBE_FEEDS.map(fetchFeed));

  const byRegion: Record<string, GlobeItem[]> = {};
  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    const { region, items } = r.value;
    if (!byRegion[region]) byRegion[region] = [];
    for (const item of items) {
      if (!byRegion[region].some((x) => x.title === item.title)) byRegion[region].push(item);
    }
  }

  const regions: GlobeRegion[] = Object.entries(REGION_META)
    .map(([id, meta]) => ({ id, ...meta, items: (byRegion[id] ?? []).slice(0, 6) }))
    .filter((r) => r.items.length > 0);

  if (regions.length > 0) global.__globeCache = { data: regions, fetchedAt: Date.now() };

  return regions;
}

import { upsertArticles, setDigest, setWeather, setHolidays } from "./store";
import type { Article, Category, Locale, Digest, WeatherData, Holiday } from "./types";

interface ScraperSource {
  name: string;
  url: string;
  category: Category;
  lang: Locale;
}

const SOURCES: ScraperSource[] = [
  { name: "TSA Algérie", url: "https://www.tsa-algerie.com/feed/", category: "politique", lang: "fr" },
  { name: "El Khabar", url: "https://www.elkhabar.com/press/rss/", category: "energie-economie", lang: "ar" },
  { name: "Echorouk", url: "https://echoroukonline.com/feed/", category: "politique", lang: "ar" }
];

/**
 * High-performance, zero-dependency RegExp RSS XML Parser.
 * Runs instantly in Vercel Serverless & Edge environments.
 */
function parseRSSXml(xmlText: string): any[] {
  const items: any[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[1];
    
    // Extract Title (supporting CDATA blocks)
    const title = itemContent.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1]
      || itemContent.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "";
      
    // Extract Link
    const link = itemContent.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "";
    
    // Extract PubDate
    const pubDate = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || "";
    
    // Extract Description/Excerpt (supporting CDATA blocks)
    const description = itemContent.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1]
      || itemContent.match(/<description>([\s\S]*?)<\/description>/)?.[1] || "";
      
    // Extract Image URL from various standard RSS tags
    const imageUrl = itemContent.match(/<enclosure[^>]*url="([^"]*)"/)?.[1]
      || itemContent.match(/<media:content[^>]*url="([^"]*)"/)?.[1]
      || itemContent.match(/<img[^>]*src="([^"]*)"/)?.[1] || "";

    items.push({
      title: title.trim(),
      link: link.trim(),
      pubDate: pubDate.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim()
    });
  }
  return items;
}

export async function runIngestion(): Promise<void> {
  console.log("[INGESTION] Launching autonomous direct XML crawler pass...");
  const allArticles: Article[] = [];

  for (const src of SOURCES) {
    try {
      console.log(`[INGESTION] Fetching raw XML from: ${src.name}...`);
      const response = await fetch(src.url, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) DzWireCrawler/1.0" },
        next: { revalidate: 0 } // Bypass standard fetch caching
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const xmlText = await response.text();
      
      // Parse RSS directly
      const rawItems = parseRSSXml(xmlText);
      console.log(`[INGESTION] Successfully parsed ${rawItems.length} items from ${src.name}.`);

      // Map parsed items to standardized Article schema
      for (const item of rawItems.slice(0, 5)) { // Limit to top 5 articles per source
        const id = `scraped-${src.name.toLowerCase().replace(/\s+/g, "-")}-${encodeURIComponent(item.link).slice(-20)}`;
        
        const newArticle: Article = {
          id,
          title: {
            fr: src.lang === "fr" ? item.title : "",
            ar: src.lang === "ar" ? item.title : "",
            en: ""
          },
          slug: {
            fr: src.lang === "fr" ? item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : "",
            ar: src.lang === "ar" ? "article-" + id : "",
            en: ""
          },
          excerpt: {
            fr: src.lang === "fr" ? item.description.replace(/<[^>]*>/g, "").slice(0, 160) : "",
            ar: src.lang === "ar" ? item.description.replace(/<[^>]*>/g, "").slice(0, 160) : "",
            en: ""
          },
          content: {
            fr: src.lang === "fr" ? item.description : "",
            ar: src.lang === "ar" ? item.description : "",
            en: ""
          },
          category: src.category,
          source: src.name,
          sourceUrl: item.link,
          imageUrl: item.imageUrl || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=60",
          publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          lang: src.lang,
          tags: ["Scraped", src.name],
          isSponsored: false,
          isPremium: false
        };

        allArticles.push(newArticle);
      }
    } catch (e) {
      console.error(`[INGESTION ERROR] Failed to fetch or parse ${src.name}:`, e);
    }
  }

  if (allArticles.length > 0) {
    console.log(`[INGESTION] Flushed ${allArticles.length} newly crawled articles directly to PostgreSQL cache.`);
    upsertArticles(allArticles);
    await buildEditorialDigest(allArticles);
  }
}

async function buildEditorialDigest(articles: Article[]): Promise<void> {
  const latest = articles.slice(0, 3);
  const digest: Digest = {
    textFr: `Flash Info : ${latest.map(a => a.title.fr || a.title.ar).join(" | ")}`,
    textAr: `موجز الأخبار : ${latest.map(a => a.title.ar || a.title.fr).join(" | ")}`,
    generatedAt: new Date().toISOString()
  };
  setDigest(digest);
}

export async function fetchWeather(): Promise<void> {
  try {
    // Fetch Algiers (latitude 36.75, longitude 3.06) weather parameters
    const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=36.75&longitude=3.06&current_weather=true");
    if (!res.ok) return;
    const data = await res.json();
    const current = data.current_weather;
    
    const weatherData: WeatherData = {
      temperature: current.temperature,
      weathercode: current.weathercode,
      windspeed: current.windspeed,
      condition: "Algiers Local Weather",
      icon: "☀️"
    };
    setWeather(weatherData);
  } catch (e) {
    console.error("[WEATHER ERROR]:", e);
  }
}

export async function fetchHolidays(): Promise<void> {
  try {
    const year = new Date().getFullYear();
    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/DZ`);
    if (!res.ok) return;
    const data = await res.json();
    
    const holidays: Holiday[] = data.slice(0, 5).map((h: any) => ({
      date: h.date,
      localName: h.localName,
      name: h.name,
      countryCode: h.countryCode
    }));
    setHolidays(holidays);
  } catch (e) {
    console.error("[HOLIDAYS ERROR]:", e);
  }
}

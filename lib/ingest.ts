import type { Article, WeatherData, Holiday, Category } from "./types";
import { upsertArticles, setWeather, setHolidays, setDigest, getAllArticles } from "./store";
import { writeArticleToSanity } from "./sanity";

const WEATHER_CODES: Record<number, { fr: string; ar: string; en: string; icon: string }> = {
  0: { fr: "Ciel dégagé", ar: "صافٍ", en: "Clear sky", icon: "☀️" },
  1: { fr: "Peu nuageux", ar: "قليل السحب", en: "Mainly clear", icon: "🌤️" },
  2: { fr: "Partiellement nuageux", ar: "غائم جزئياً", en: "Partly cloudy", icon: "⛅" },
  3: { fr: "Couvert", ar: "ملبّد", en: "Overcast", icon: "☁️" },
  45: { fr: "Brouillard", ar: "ضباب", en: "Fog", icon: "🌫️" },
  48: { fr: "Brouillard givrant", ar: "ضباب متجمد", en: "Icy fog", icon: "🌫️" },
  51: { fr: "Bruine légère", ar: "رذاذ خفيف", en: "Light drizzle", icon: "🌦️" },
  61: { fr: "Pluie légère", ar: "مطر خفيف", en: "Light rain", icon: "🌧️" },
  71: { fr: "Neige légère", ar: "ثلج خفيف", en: "Light snow", icon: "🌨️" },
  80: { fr: "Averses", ar: "زخات مطر", en: "Rain showers", icon: "🌦️" },
  95: { fr: "Orage", ar: "عاصفة رعدية", en: "Thunderstorm", icon: "⛈️" },
};

function getWeatherInfo(code: number) {
  return WEATHER_CODES[code] ?? { fr: "Variable", ar: "متغير", en: "Variable", icon: "🌡️" };
}

function generateId(): string {
  return `rss-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

interface RSS2JSONResponse {
  status: string;
  items: Array<{
    title?: string;
    description?: string;
    content?: string;
    link?: string;
    thumbnail?: string;
    pubDate?: string;
    categories?: string[];
  }>;
}

export async function fetchRSSFeed(
  feedUrl: string,
  lang: "fr" | "ar",
  defaultCategory: Category
): Promise<Article[]> {
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&count=10`;
  try {
    const res = await fetch(apiUrl, { next: { revalidate: 600 } });
    if (!res.ok) return [];
    const data = (await res.json()) as RSS2JSONResponse;
    if (data.status !== "ok" || !data.items) return [];

    return data.items.slice(0, 10).map((item) => {
      const title = item.title ?? "Sans titre";
      const id = generateId();
      const slug = slugify(title);
      const placeholderImg = `https://picsum.photos/seed/${id}/800/450`;
      const excerpt = (item.description ?? "").replace(/<[^>]*>/g, "").slice(0, 200).trim() || title;
      const content = (item.content ?? item.description ?? "").replace(/<[^>]*>/g, "").trim() || excerpt;

      return {
        id,
        title: { fr: title, ar: title },
        slug: { fr: slug, ar: slug },
        excerpt: { fr: excerpt, ar: excerpt },
        content: { fr: content, ar: content },
        category: defaultCategory,
        source: new URL(feedUrl).hostname.replace("www.", ""),
        sourceUrl: item.link ?? feedUrl,
        imageUrl: item.thumbnail || placeholderImg,
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        lang,
        tags: item.categories?.slice(0, 3) ?? [],
        curatedBy: "DzWire",
      } as Article;
    });
  } catch {
    return [];
  }
}

export async function fetchHackerNewsStories(): Promise<Article[]> {
  try {
    const idsRes = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json", {
      next: { revalidate: 600 },
    });
    if (!idsRes.ok) return [];
    const ids = (await idsRes.json()) as number[];
    const top5 = ids.slice(0, 5);

    const stories = await Promise.allSettled(
      top5.map((id) =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
          next: { revalidate: 600 },
        }).then((r) => r.json())
      )
    );

    const articles: Article[] = [];
    for (const result of stories) {
      if (result.status !== "fulfilled" || !result.value?.title) continue;
      const story = result.value as {
        id: number;
        title: string;
        url?: string;
        score: number;
        time: number;
      };
      const id = `hn-${story.id}`;
      const slug = slugify(story.title);
      const excerpt = `HN Score: ${story.score} — ${story.title}`;
      articles.push({
        id,
        title: { fr: story.title, ar: story.title, en: story.title },
        slug: { fr: slug, ar: slug, en: slug },
        excerpt: { fr: excerpt, ar: excerpt, en: excerpt },
        content: {
          fr: `Article Hacker News — Score: ${story.score}. Lien: ${story.url ?? "#"}`,
          ar: `مقال هاكر نيوز — النقاط: ${story.score}. الرابط: ${story.url ?? "#"}`,
          en: `Hacker News article — Score: ${story.score}. Link: ${story.url ?? "#"}`,
        },
        category: "tech-innovation",
        source: "Hacker News",
        sourceUrl: story.url ?? `https://news.ycombinator.com/item?id=${story.id}`,
        imageUrl: `https://picsum.photos/seed/hn${story.id}/800/450`,
        publishedAt: new Date(story.time * 1000).toISOString(),
        lang: "en",
        tags: ["tech", "hacker-news"],
        curatedBy: "DzWire",
      });
    }
    return articles;
  } catch {
    return [];
  }
}

export async function fetchWeather(): Promise<void> {
  try {
    const url =
      "https://api.open-meteo.com/v1/forecast?latitude=36.75&longitude=3.04&current_weather=true";
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as {
      current_weather: { temperature: number; weathercode: number; windspeed: number };
    };
    const cw = data.current_weather;
    const info = getWeatherInfo(cw.weathercode);
    const weather: WeatherData = {
      temperature: Math.round(cw.temperature),
      weathercode: cw.weathercode,
      windspeed: Math.round(cw.windspeed),
      condition: info.fr,
      icon: info.icon,
    };
    setWeather(weather);
  } catch {}
}

export async function fetchHolidays(): Promise<void> {
  try {
    const res = await fetch("https://date.nager.at/api/v3/NextPublicHolidays/DZ", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return;
    const data = (await res.json()) as Array<{
      date: string;
      localName: string;
      name: string;
      countryCode: string;
    }>;
    setHolidays(data.slice(0, 3));
  } catch {}
}

export async function generateDigest(): Promise<void> {
  const articles = getAllArticles().slice(0, 3);
  if (articles.length === 0) return;

  const summariesFr = articles.map((a, i) => `${i + 1}. ${a.title.fr}: ${a.excerpt.fr}`).join(" ");
  const summariesAr = articles.map((a, i) => `${i + 1}. ${a.title.ar}: ${a.excerpt.ar}`).join(" ");
  const summariesEn = articles
    .map((a, i) => `${i + 1}. ${a.title.en ?? a.title.fr}: ${a.excerpt.en ?? a.excerpt.fr}`)
    .join(" ");

  const dateFr = new Date().toLocaleDateString("fr-DZ", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const dateAr = new Date().toLocaleDateString("ar-DZ", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const dateEn = new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  setDigest({
    textFr: `Bulletin DzWire du ${dateFr} — ${summariesFr}`,
    textAr: `نشرة DzWire ليوم ${dateAr} — ${summariesAr}`,
    textEn: `DzWire digest for ${dateEn} — ${summariesEn}`,
    generatedAt: new Date().toISOString(),
  });
}

async function writeBatchToSanity(articles: Article[]): Promise<void> {
  await Promise.allSettled(articles.slice(0, 10).map((a) => writeArticleToSanity(a)));
}

export async function runIngestion(): Promise<void> {
  const [hnArticles, rss1, rss2, rss3] = await Promise.allSettled([
    fetchHackerNewsStories(),
    fetchRSSFeed("https://www.elkhabar.com/feed", "ar", "politique"),
    fetchRSSFeed("https://www.echoroukonline.com/feed", "ar", "politique"),
    fetchRSSFeed("https://www.tsa-algerie.com/feed", "fr", "politique"),
  ]);

  const allArticles: Article[] = [];
  for (const r of [hnArticles, rss1, rss2, rss3]) {
    if (r.status === "fulfilled") allArticles.push(...r.value);
  }

  if (allArticles.length > 0) {
    upsertArticles(allArticles);
    writeBatchToSanity(allArticles).catch(() => {});
  }

  await Promise.allSettled([fetchWeather(), fetchHolidays()]);
  await generateDigest();
}

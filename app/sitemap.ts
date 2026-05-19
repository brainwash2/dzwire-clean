import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/store";
import { CATEGORIES, LOCALES, getText } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://dzwire.replit.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles();

  const homePages: MetadataRoute.Sitemap = LOCALES.map((locale) => ({
    url: `${BASE_URL}/${locale}`,
    lastModified: new Date(),
    changeFrequency: "hourly",
    priority: 1,
    alternates: {
      languages: {
        "fr-DZ": `${BASE_URL}/fr`,
        "ar-DZ": `${BASE_URL}/ar`,
        "en-GB": `${BASE_URL}/en`,
      },
    },
  }));

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.flatMap((category) =>
    LOCALES.map((locale) => ({
      url: `${BASE_URL}/${locale}/${category}`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.85,
      alternates: {
        languages: {
          "fr-DZ": `${BASE_URL}/fr/${category}`,
          "ar-DZ": `${BASE_URL}/ar/${category}`,
          "en-GB": `${BASE_URL}/en/${category}`,
        },
      },
    }))
  );

  const articlePages: MetadataRoute.Sitemap = articles.flatMap((article) =>
    LOCALES.map((locale: Locale) => {
      const slug = getText(article.slug, locale) || article.slug.fr;
      return {
        url: `${BASE_URL}/${locale}/${article.category}/${slug}`,
        lastModified: new Date(article.publishedAt),
        changeFrequency: "weekly" as const,
        priority: article.isPremium ? 0.9 : 0.7,
        alternates: {
          languages: {
            "fr-DZ": `${BASE_URL}/fr/${article.category}/${article.slug.fr}`,
            "ar-DZ": `${BASE_URL}/ar/${article.category}/${article.slug.ar}`,
            "en-GB": `${BASE_URL}/en/${article.category}/${article.slug.en ?? article.slug.fr}`,
          },
        },
      };
    })
  );

  return [...homePages, ...categoryPages, ...articlePages];
}

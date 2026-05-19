import type { Metadata } from "next";
import type { Locale } from "@/lib/types";
import type { Article } from "@/lib/types";
import { getText } from "@/lib/i18n";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://dzwire.replit.app";

export function buildArticleMetadata(article: Article, locale: Locale): Metadata {
  const title = getText(article.title, locale);
  const description = getText(article.excerpt, locale);
  const slugFr = article.slug.fr;
  const slugAr = article.slug.ar;
  const slugEn = article.slug.en ?? slugFr;
  const canonicalPath = `/${locale}/${article.category}/${getText(article.slug, locale) || slugFr}`;

  return {
    title: `${title} — DzWire`,
    description,
    alternates: {
      canonical: `${BASE_URL}${canonicalPath}`,
      languages: {
        "fr-DZ": `${BASE_URL}/fr/${article.category}/${slugFr}`,
        "ar-DZ": `${BASE_URL}/ar/${article.category}/${slugAr}`,
        "en-GB": `${BASE_URL}/en/${article.category}/${slugEn}`,
        "x-default": `${BASE_URL}/fr/${article.category}/${slugFr}`,
      },
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: `${BASE_URL}${canonicalPath}`,
      siteName: "DzWire",
      locale: locale === "ar" ? "ar_DZ" : locale === "en" ? "en_GB" : "fr_DZ",
      images: article.imageUrl
        ? [{ url: article.imageUrl, width: 1200, height: 630, alt: title }]
        : [],
      publishedTime: article.publishedAt,
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: article.imageUrl ? [article.imageUrl] : [],
      site: "@DzWire_dz",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
  };
}

export function buildCategoryMetadata(
  category: string,
  label: string,
  locale: Locale,
  description: string
): Metadata {
  return {
    title: `${label} — DzWire`,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/${category}`,
      languages: {
        "fr-DZ": `${BASE_URL}/fr/${category}`,
        "ar-DZ": `${BASE_URL}/ar/${category}`,
        "en-GB": `${BASE_URL}/en/${category}`,
        "x-default": `${BASE_URL}/fr/${category}`,
      },
    },
    openGraph: {
      type: "website",
      title: `${label} — DzWire`,
      description,
      url: `${BASE_URL}/${locale}/${category}`,
      siteName: "DzWire",
    },
  };
}

export function newsArticleJsonLd(opts: {
  url: string;
  headline: string;
  image?: string;
  datePublished: string;
  description?: string;
  authorName?: string;
  source?: string;
  keywords?: string[];
  locale: Locale;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: { "@type": "WebPage", "@id": opts.url },
    headline: opts.headline,
    description: opts.description,
    image: opts.image ? [{ "@type": "ImageObject", url: opts.image, width: 1200, height: 630 }] : undefined,
    datePublished: opts.datePublished,
    dateModified: opts.datePublished,
    inLanguage: opts.locale === "ar" ? "ar-DZ" : opts.locale === "en" ? "en-GB" : "fr-DZ",
    keywords: opts.keywords?.join(", "),
    author: opts.authorName
      ? [{ "@type": "Person", name: opts.authorName }]
      : [{ "@type": "Organization", name: opts.source ?? "DzWire" }],
    publisher: {
      "@type": "NewsMediaOrganization",
      name: "DzWire",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.png`,
        width: 192,
        height: 192,
      },
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "DzWire",
    url: BASE_URL,
    description: "Algerian news hub — FR/AR/EN",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/fr/recherche?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "NewsMediaOrganization",
      name: "DzWire",
      logo: { "@type": "ImageObject", url: `${BASE_URL}/logo.png` },
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function estimateReadingTime(text: string, locale: Locale): number {
  const wpm = locale === "ar" ? 180 : 200;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / wpm));
}

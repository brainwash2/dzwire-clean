"use client";

import dynamic from "next/dynamic";
import type { GeoArticle } from "./MapClient";
import type { Locale } from "@/lib/types";

const MapClient = dynamic(() => import("./MapClient"), { ssr: false });

interface Props {
  articles: GeoArticle[];
  locale: Locale;
}

export default function MapWrapper({ articles, locale }: Props) {
  return <MapClient articles={articles} locale={locale} />;
}

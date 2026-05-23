import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

export const sanityClient = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion: "2024-01-01",
      useCdn: true,
      token: process.env.SANITY_API_READ_TOKEN,
    })
  : null;

export const sanityWriteClient = projectId && process.env.SANITY_WRITE_TOKEN
  ? createClient({
      projectId,
      dataset,
      apiVersion: "2024-01-01",
      useCdn: false,
      token: process.env.SANITY_WRITE_TOKEN,
    })
  : null;

const builder = imageUrlBuilder({ projectId: projectId || "", dataset });

export function urlFor(source: any) {
  return builder.image(source);
}

/**
 * Fetch all published platform events from Sanity CMS
 */
export async function fetchSanityEvents(): Promise<any[]> {
  if (!sanityClient) return [];
  try {
    return await sanityClient.fetch(
      `*[_type == "event"] | order(date asc)`
    );
  } catch (error) {
    console.error("[SANITY ERROR] Failed to fetch events:", error);
    return [];
  }
}

/**
 * Fetch all published editorial articles from Sanity CMS
 */
export async function fetchSanityArticles(): Promise<any[]> {
  if (!sanityClient) return [];
  try {
    return await sanityClient.fetch(
      `*[_type == "article"] | order(publishedAt desc)`
    );
  } catch (error) {
    console.error("[SANITY ERROR] fetchSanityArticles failed:", error);
    return [];
  }
}

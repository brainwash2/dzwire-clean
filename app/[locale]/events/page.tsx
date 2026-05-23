import EventsClient from "@/components/EventsClient";
import { fetchSanityEvents } from "@/lib/sanity";

export const dynamic = "force-dynamic";

/**
 * Adapter function mapping Sanity CMS schemas to front-end Client properties
 */
function mapSanityEventToEvent(se: any): any {
  return {
    id: se._id,
    title: { 
      fr: se.title_fr, 
      ar: se.title_ar, 
      en: se.title_en || se.title_fr 
    },
    date: se.date,
    endDate: se.endDate || undefined,
    category: se.category,
    status: se.status || "upcoming",
    location: { 
      fr: se.location_fr, 
      ar: se.location_ar, 
      en: se.location_fr 
    },
    description: { 
      fr: se.description_fr || "", 
      ar: se.description_ar || "", 
      en: se.description_fr || "" 
    },
    isFeatured: se.isFeatured || false
  };
}

export default async function EventsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  console.log("[EVENTS ROUTE] Fetching live events from Sanity...");
  const rawSanityEvents = await fetchSanityEvents();
  
  let events: any[] = [];

  if (rawSanityEvents && rawSanityEvents.length > 0) {
    console.log(`[EVENTS ROUTE] Loaded ${rawSanityEvents.length} dynamic events from Sanity CMS.`);
    // Map Sanity structures to the client UI expectations
    events = rawSanityEvents.map(mapSanityEventToEvent);
  } else {
    console.log("[EVENTS ROUTE] No dynamic events in Sanity CMS. Please create them in /studio.");
  }

  return <EventsClient locale={locale as any} initialEvents={events} />;
}

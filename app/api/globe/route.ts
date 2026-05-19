import { NextResponse } from "next/server";
import { getGlobeData } from "@/lib/globe";
export type { GlobeItem, GlobeRegion } from "@/lib/globe";

export async function GET() {
  const regions = await getGlobeData();
  const cached = !!(global.__globeCache && global.__globeCache.data.length > 0);
  return NextResponse.json({ regions, cached });
}

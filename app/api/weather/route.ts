import { NextResponse } from "next/server";
import { getWeather } from "@/lib/store";

export async function GET() {
  const weather = getWeather();
  if (!weather) {
    return NextResponse.json(
      { data: null, error: "Weather data not yet available." },
      { status: 503 }
    );
  }
  return NextResponse.json({ data: weather, error: null });
}

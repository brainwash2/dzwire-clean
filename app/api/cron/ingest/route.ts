import { NextRequest, NextResponse } from "next/server";
import { runIngestion, fetchWeather, fetchHolidays } from "@/lib/ingest";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    
    // Defensive extraction: normalize multiple spaces and capture the bearer token
    const token = authHeader?.replace(/\s+/g, " ").trim().split(" ")[1];
    
    if (
      process.env.NODE_ENV === "production" && 
      token !== process.env.INTERNAL_INGESTION_SECRET
    ) {
      console.warn("[CRON GATEWAY] Unauthorized access attempt blocked.");
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    console.log("[CRON GATEWAY] Secure credentials verified. Running ingestion pipeline...");
    
    await runIngestion();
    await Promise.all([fetchWeather(), fetchHolidays()]);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: "Ingestion queue executed successfully."
    });
  } catch (error) {
    console.error("[CRON GATEWAY ERROR]:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Ingestion execution failure" },
      { status: 500 }
    );
  }
}

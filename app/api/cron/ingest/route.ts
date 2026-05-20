import { NextRequest, NextResponse } from "next/server";
import { runIngestion, fetchWeather, fetchHolidays } from "@/lib/ingest";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    
    // Protect the database ingestion gateway from malicious triggers in production
    if (
      process.env.NODE_ENV === "production" && 
      authHeader !== `Bearer ${process.env.INTERNAL_INGESTION_SECRET}`
    ) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    console.log("[CRON GATEWAY]: Starting secure batch ingestion...");
    
    // Execute async fetch workers
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

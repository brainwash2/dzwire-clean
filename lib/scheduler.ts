import { runIngestion, fetchWeather, fetchHolidays, generateDigest } from "./ingest";

declare global {
  var __schedulerStarted: boolean | undefined;
}

export async function startScheduler(): Promise<void> {
  if (global.__schedulerStarted) return;
  global.__schedulerStarted = true;

  console.log("[DzWire] Starting initial data ingestion...");
  try {
    await runIngestion();
    console.log("[DzWire] Initial ingestion complete.");
  } catch (e) {
    console.error("[DzWire] Initial ingestion error:", e);
  }

  setInterval(async () => {
    try {
      await runIngestion();
    } catch {}
  }, 10 * 60 * 1000);

  setInterval(async () => {
    try {
      await Promise.all([fetchWeather(), fetchHolidays()]);
      await generateDigest();
    } catch {}
  }, 15 * 60 * 1000);
}

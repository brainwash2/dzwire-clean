import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const PostPayloadSchema = z.object({
  symbol: z.string(),
  price: z.number(),
  change24h: z.number(),
});

/**
 * Helper to fetch and parse real-time stock futures
 */
async function fetchYahooFuture(symbol: string): Promise<{ price: number; change: number } | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=2d`,
      { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 0 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const result = data.chart.result[0];
    const price = result.indicators.quote[0].close[1] || result.meta.regularMarketPrice;
    const prevClose = result.meta.previousClose;
    const change = ((price - prevClose) / prevClose) * 100;
    return { price, change };
  } catch (e) {
    console.error(`[FINANCE API ERROR] Failed to fetch ${symbol}:`, e);
    return null;
  }
}

/**
 * GET: Automatically updates commodities (Brent, Gas) and official USD/DZD exchange rates
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace(/\s+/g, " ").trim().split(" ")[1];

    if (
      process.env.NODE_ENV === "production" &&
      token !== process.env.INTERNAL_INGESTION_SECRET
    ) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    console.log("[TICKERS API] Fetching global energy commodities and official USD/DZD rates...");

    // Fetch Brent Crude, Natural Gas, and USD/DZD cross rates
    const [brent, gas, officialUsd] = await Promise.all([
      fetchYahooFuture("BZ=F"), // Brent futures
      fetchYahooFuture("NG=F"), // Gas futures
      fetchYahooFuture("DZD=X")  // USD/DZD rate
    ]);

    const timestamp = new Date();

    if (brent) {
      await query(
        `INSERT INTO market_tickers (symbol, name, price, change_24h, updated_at)
         VALUES ('BRENT', 'Brent Crude Oil', $1, $2, $3)
         ON CONFLICT (symbol) DO UPDATE SET price = EXCLUDED.price, change_24h = EXCLUDED.change_24h, updated_at = EXCLUDED.updated_at`,
        [brent.price, brent.change, timestamp]
      );
      await query(
        `INSERT INTO ticker_historical (symbol, price, recorded_at) VALUES ('BRENT', $1, $2) ON CONFLICT DO NOTHING`,
        [brent.price, timestamp]
      );
    }

    if (gas) {
      await query(
        `INSERT INTO market_tickers (symbol, name, price, change_24h, updated_at)
         VALUES ('NAT_GAS', 'Natural Gas', $1, $2, $3)
         ON CONFLICT (symbol) DO UPDATE SET price = EXCLUDED.price, change_24h = EXCLUDED.change_24h, updated_at = EXCLUDED.updated_at`,
        [gas.price, gas.change, timestamp]
      );
      await query(
        `INSERT INTO ticker_historical (symbol, price, recorded_at) VALUES ('NAT_GAS', $1, $2) ON CONFLICT DO NOTHING`,
        [gas.price, timestamp]
      );
    }

    if (officialUsd) {
      await query(
        `INSERT INTO market_tickers (symbol, name, price, change_24h, updated_at)
         VALUES ('USD_DZD_OFFICIAL', 'Official USD/DZD', $1, $2, $3)
         ON CONFLICT (symbol) DO UPDATE SET price = EXCLUDED.price, change_24h = EXCLUDED.change_24h, updated_at = EXCLUDED.updated_at`,
        [officialUsd.price, officialUsd.change, timestamp]
      );
      await query(
        `INSERT INTO ticker_historical (symbol, price, recorded_at) VALUES ('USD_DZD_OFFICIAL', $1, $2) ON CONFLICT DO NOTHING`,
        [officialUsd.price, timestamp]
      );
    }

    return NextResponse.json({ success: true, updated: ["BRENT", "NAT_GAS", "USD_DZD_OFFICIAL"] });
  } catch (error) {
    console.error("[TICKERS API ERROR]:", error);
    return NextResponse.json({ error: "Ingestion failure" }, { status: 500 });
  }
}

/**
 * POST: Securely accepts manual administrative updates for parallel market rates (Square Port Said)
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace(/\s+/g, " ").trim().split(" ")[1];

    if (token !== process.env.INTERNAL_INGESTION_SECRET) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await request.json();
    const result = PostPayloadSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Validation failed", issues: result.error.issues }, { status: 400 });
    }

    const { symbol, price, change24h } = result.data;
    const timestamp = new Date();

    console.log(`[TICKERS API] Writing manual update for ${symbol}...`);

    await query(
      `INSERT INTO market_tickers (symbol, name, price, change_24h, updated_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (symbol) DO UPDATE SET price = EXCLUDED.price, change_24h = EXCLUDED.change_24h, updated_at = EXCLUDED.updated_at`,
      [symbol, symbol === "USD_DZD_PARALLEL" ? "Parallel USD/DZD" : symbol, price, change24h, timestamp]
    );

    await query(
      `INSERT INTO ticker_historical (symbol, price, recorded_at) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      [symbol, price, timestamp]
    );

    return NextResponse.json({ success: true, updated: symbol });
  } catch (error) {
    console.error("[TICKERS API ERROR]:", error);
    return NextResponse.json({ error: "Manual update failure" }, { status: 500 });
  }
}

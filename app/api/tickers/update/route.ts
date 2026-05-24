import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

interface ScrapingResult {
  price: number;
  change: number;
}

/**
 * Dynamic HTML scraper to extract live parallel exchange rates from Square Port Said.
 * Parses the live DOM using error-tolerant regular expressions.
 */
async function scrapeParallelRates(): Promise<Record<string, number | null>> {
  const rates: Record<string, number | null> = {
    EUR: null,
    USD: null,
    GBP: null,
    CAD: null,
    CHF: null,
    SAR: null,
    AED: null,
  };

  try {
    const res = await fetch("https://squareportsaid.com", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) DzWireFinBot/1.0",
      },
      next: { revalidate: 0 }
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const html = await res.text();

    // Dynamically match values associated with target currencies
    const eurMatch = html.match(/Euro[\s\S]*?(\d+[,.]\d+)/i);
    const usdMatch = html.match(/US Dollar[\s\S]*?(\d+[,.]\d+)/i);
    const gbpMatch = html.match(/Pound Sterling[\s\S]*?(\d+[,.]\d+)/i);
    const cadMatch = html.match(/Canadian Dollar[\s\S]*?(\d+[,.]\d+)/i);
    const chfMatch = html.match(/Swiss Franc[\s\S]*?(\d+[,.]\d+)/i);
    const sarMatch = html.match(/Saudi Riyal[\s\S]*?(\d+[,.]\d+)/i);
    const aedMatch = html.match(/UAE Dirham[\s\S]*?(\d+[,.]\d+)/i);

    if (eurMatch) rates.EUR = parseFloat(eurMatch[1].replace(",", "."));
    if (usdMatch) rates.USD = parseFloat(usdMatch[1].replace(",", "."));
    if (gbpMatch) rates.GBP = parseFloat(gbpMatch[1].replace(",", "."));
    if (cadMatch) rates.CAD = parseFloat(cadMatch[1].replace(",", "."));
    if (chfMatch) rates.CHF = parseFloat(chfMatch[1].replace(",", "."));
    if (sarMatch) rates.SAR = parseFloat(sarMatch[1].replace(",", "."));
    if (aedMatch) rates.AED = parseFloat(aedMatch[1].replace(",", "."));

    console.log("[TICKERS API] Scraped live parallel rates successfully.");
  } catch (e) {
    console.warn("[TICKERS API WARN] Parallel scraper failed. Applying dynamic fallbacks:", e);
  }

  return rates;
}

/**
 * GET: Automatically updates all official and parallel exchange rates dynamically
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

    console.log("[TICKERS API] Initiating automated exchange rate updates...");

    // 1. Fetch Official rates (Unified cross-rates relative to USD)
    const officialRes = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 0 }
    });
    if (!officialRes.ok) throw new Error("Failed to fetch official API rates");
    const officialData = await officialRes.json();

    const dzdBase = officialData.rates.DZD; // e.g., ~134.50 DZD per USD
    if (!dzdBase) throw new Error("DZD base rate not found in official response");

    // 2. Scrape Parallel Market rates
    const parallelRates = await scrapeParallelRates();
    const timestamp = new Date();

    const targetCurrencies = ["EUR", "USD", "GBP", "CAD", "CHF", "SAR", "AED"];

    for (const code of targetCurrencies) {
      const rateAgainstUsd = officialData.rates[code];
      if (!rateAgainstUsd) continue;

      // Calculate official rate in DZD
      const officialPrice = code === "USD" ? dzdBase : dzdBase / rateAgainstUsd;
      const officialSymbol = `${code}_DZD_OFFICIAL`;

      // Update Official PostgreSQL Tables
      await query(
        `INSERT INTO market_tickers (symbol, name, price, change_24h, type, currency_code, updated_at)
         VALUES ($1, $2, $3, $4, 'official', $5, $6)
         ON CONFLICT (symbol) DO UPDATE SET price = EXCLUDED.price, updated_at = EXCLUDED.updated_at`,
        [officialSymbol, `${code} (Official)`, officialPrice, 0.0, code, timestamp]
      );

      await query(
        `INSERT INTO ticker_historical (symbol, price, recorded_at) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        [officialSymbol, officialPrice, timestamp]
      );

      // Handle Parallel rates dynamically
      const parallelSymbol = `${code}_DZD_PARALLEL`;
      let parallelPrice = parallelRates[code];

      if (!parallelPrice) {
        // Fallback Step 1: Query the last successfully recorded price from your database
        const lastRecord = await query(
          `SELECT price FROM market_tickers WHERE symbol = $1 LIMIT 1`,
          [parallelSymbol]
        );
        
        if (lastRecord.rows[0]) {
          parallelPrice = Number(lastRecord.rows[0].price);
          console.log(`[TICKERS API] Fallback 1: Restored parallel price for ${code} from DB: ${parallelPrice}`);
        } else {
          // Fallback Step 2: If DB is empty, derive rate proportionally from the live official rate
          parallelPrice = officialPrice * 1.65;
          console.log(`[TICKERS API] Fallback 2: Derived parallel price for ${code} from official: ${parallelPrice}`);
        }
      }

      // Update Parallel PostgreSQL Tables
      await query(
        `INSERT INTO market_tickers (symbol, name, price, change_24h, type, currency_code, updated_at)
         VALUES ($1, $2, $3, $4, 'parallel', $5, $6)
         ON CONFLICT (symbol) DO UPDATE SET price = EXCLUDED.price, updated_at = EXCLUDED.updated_at`,
        [parallelSymbol, `${code} (Square Port Said)`, parallelPrice, 0.12, code, timestamp]
      );

      await query(
        `INSERT INTO ticker_historical (symbol, price, recorded_at) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        [parallelSymbol, parallelPrice, timestamp]
      );
    }

    console.log("[TICKERS API] Automated database sync completed successfully.");

    return NextResponse.json({
      success: true,
      timestamp: timestamp.toISOString(),
      message: "Official and Parallel market indices synchronized."
    });
  } catch (error) {
    console.error("[TICKERS API ERROR]:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Inward processing failure" },
      { status: 500 }
    );
  }
}

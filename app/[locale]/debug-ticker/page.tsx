import React from "react";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DebugTickerPage() {
  let tickersResult = null;
  let sponsorsResult = null;
  let dbError: any = null;

  try {
    // Attempt queries directly against Neon PostgreSQL
    tickersResult = await query("SELECT * FROM market_tickers");
    sponsorsResult = await query("SELECT * FROM sponsor_announcements");
  } catch (err: any) {
    dbError = {
      message: err.message,
      stack: err.stack,
      code: err.code
    };
  }

  return (
    <div className="p-8 font-mono text-xs bg-zinc-950 text-gray-300 min-h-screen space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-emerald-500">🛠️</span> DZWIRE TICKER DIAGNOSTICS
        </h1>
        <p className="text-[10px] text-gray-500">Real-time database and cache validation ledger</p>
      </div>
      
      {dbError ? (
        <div className="p-4 border border-red-500/20 bg-red-950/20 rounded text-red-400 space-y-2">
          <h2 className="font-bold">❌ DATABASE EXCEPTION CAUGHT:</h2>
          <pre className="whitespace-pre-wrap font-mono text-[11px] bg-black p-3 rounded border border-red-500/10">{dbError.message}</pre>
          <pre className="whitespace-pre-wrap text-[10px] opacity-70 font-mono bg-black p-3 rounded border border-red-500/10">{dbError.stack}</pre>
        </div>
      ) : (
        <div className="p-4 border border-emerald-500/20 bg-emerald-950/20 rounded text-emerald-400 font-bold flex items-center gap-2">
          <span>✔</span> Database Connection & Queries Completed with 0 Exceptions.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h2 className="font-bold text-white">1. market_tickers rows ({tickersResult?.rows?.length ?? 0})</h2>
          <pre className="bg-black p-4 rounded overflow-auto h-[450px] border border-white/5 font-mono text-[11px]">
            {JSON.stringify(tickersResult?.rows || [], null, 2)}
          </pre>
        </div>
        <div className="space-y-2">
          <h2 className="font-bold text-white">2. sponsor_announcements rows ({sponsorsResult?.rows?.length ?? 0})</h2>
          <pre className="bg-black p-4 rounded overflow-auto h-[450px] border border-white/5 font-mono text-[11px]">
            {JSON.stringify(sponsorsResult?.rows || [], null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

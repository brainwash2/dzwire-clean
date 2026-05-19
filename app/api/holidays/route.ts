import { NextResponse } from "next/server";
import { getHolidays } from "@/lib/store";

export async function GET() {
  const holidays = getHolidays();
  return NextResponse.json({ data: holidays, error: null });
}

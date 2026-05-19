import { NextRequest, NextResponse } from "next/server";
import { incrementViewCount, getViewCount } from "@/lib/store";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  const views = incrementViewCount(id);
  return NextResponse.json({ views });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json({ views: getViewCount(id) });
}

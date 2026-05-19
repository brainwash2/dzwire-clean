import { NextRequest, NextResponse } from "next/server";
import { getDigest } from "@/lib/store";

export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get("lang") ?? "fr";
  const digest = getDigest();

  if (!digest) {
    return NextResponse.json(
      { data: null, error: "Digest not yet generated. Try again shortly." },
      { status: 503 }
    );
  }

  const text = lang === "ar" ? digest.textAr : digest.textFr;
  return NextResponse.json({
    data: { text, generatedAt: digest.generatedAt },
    error: null,
  });
}

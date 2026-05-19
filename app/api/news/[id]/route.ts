import { NextRequest, NextResponse } from "next/server";
import { getArticleById } from "@/lib/store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const article = getArticleById(id);
  if (!article) {
    return NextResponse.json({ data: null, error: "Article not found" }, { status: 404 });
  }
  return NextResponse.json({ data: article, error: null });
}

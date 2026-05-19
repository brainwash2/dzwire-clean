import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth-server";
import { initDB, getSessionUser } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.cookies.get(SESSION_COOKIE)?.value;
    if (!sessionId) {
      return NextResponse.json({ user: null });
    }

    await initDB();
    const result = await getSessionUser(sessionId);
    if (!result) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: result.user.id,
        username: result.user.username,
        name: result.user.name,
        profileImage: result.user.profile_image,
        hasActiveSubscription: result.subscription !== null,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}

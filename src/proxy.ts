import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, expectedToken } from "@/lib/auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const cookie = request.cookies.get(AUTH_COOKIE)?.value;
  if (cookie === expectedToken()) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const unlockUrl = new URL("/unlock", request.url);
  return NextResponse.redirect(unlockUrl);
}

export const config = {
  matcher: [
    "/((?!unlock|api/unlock|api/cron|_next/static|_next/image|manifest.webmanifest|icon-192.png|icon-512.png|sw.js|offline.html|favicon.ico).*)",
  ],
};

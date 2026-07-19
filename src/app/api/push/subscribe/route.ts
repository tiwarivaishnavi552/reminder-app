import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseUserAgent } from "@/lib/ua";

interface SubscribeBody {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export async function POST(request: Request) {
  const body = (await request.json()) as SubscribeBody;
  if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return NextResponse.json({ error: "invalid subscription" }, { status: 400 });
  }

  const userAgent = request.headers.get("user-agent") ?? "";
  const { browser, os } = parseUserAgent(userAgent);

  await prisma.deviceSubscription.upsert({
    where: { endpoint: body.endpoint },
    create: {
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
      browser,
      os,
      userAgent,
    },
    update: {
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
      browser,
      os,
      userAgent,
      active: true,
      lastActiveAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}

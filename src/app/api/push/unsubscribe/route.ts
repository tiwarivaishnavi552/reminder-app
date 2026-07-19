import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { endpoint } = (await request.json()) as { endpoint?: string };
  if (!endpoint) {
    return NextResponse.json({ error: "missing endpoint" }, { status: 400 });
  }

  await prisma.deviceSubscription.updateMany({
    where: { endpoint },
    data: { active: false },
  });

  return NextResponse.json({ ok: true });
}

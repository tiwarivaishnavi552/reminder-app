import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const devices = await prisma.deviceSubscription.findMany({
    orderBy: { lastActiveAt: "desc" },
    select: { id: true, browser: true, os: true, active: true, lastActiveAt: true },
  });

  return NextResponse.json({ devices });
}

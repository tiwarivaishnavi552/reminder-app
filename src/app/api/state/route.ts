import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { defaultData, rollDay } from "@/lib/storage";
import type { AppData } from "@/lib/types";

const SINGLETON_ID = "singleton";
const TIMEZONE = process.env.TIMEZONE;

function toJson(data: AppData): Prisma.InputJsonValue {
  return data as unknown as Prisma.InputJsonValue;
}

export async function GET() {
  const row = await prisma.appState.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID, data: toJson(defaultData()) },
    update: {},
  });

  const current = row.data as unknown as AppData;
  const rolled = rollDay(current, TIMEZONE);
  if (rolled.currentDay !== current.currentDay) {
    const updated = await prisma.appState.update({
      where: { id: SINGLETON_ID },
      data: { data: toJson(rolled) },
    });
    return NextResponse.json({ data: updated.data, updatedAt: updated.updatedAt });
  }

  return NextResponse.json({ data: row.data, updatedAt: row.updatedAt });
}

export async function PUT(request: Request) {
  const body = (await request.json()) as { data: AppData; expectedUpdatedAt?: string };

  if (body.expectedUpdatedAt) {
    const current = await prisma.appState.findUnique({ where: { id: SINGLETON_ID } });
    if (current && current.updatedAt.toISOString() !== body.expectedUpdatedAt) {
      return NextResponse.json({ error: "stale" }, { status: 409 });
    }
  }

  const updated = await prisma.appState.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID, data: toJson(body.data) },
    update: { data: toJson(body.data) },
  });

  return NextResponse.json({ data: updated.data, updatedAt: updated.updatedAt });
}

import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { sendPush } from "@/lib/webpush";
import { defaultData, rollDay } from "@/lib/storage";
import { nowMinutes, timeToMinutes } from "@/lib/schedule";
import type { AppData } from "@/lib/types";

const SINGLETON_ID = "singleton";
const TIMEZONE = process.env.TIMEZONE;

function toJson(data: AppData): Prisma.InputJsonValue {
  return data as unknown as Prisma.InputJsonValue;
}

function isAuthorized(request: Request): boolean {
  const url = new URL(request.url);
  const secret = request.headers.get("x-cron-secret") ?? url.searchParams.get("secret");
  return Boolean(process.env.CRON_SECRET) && secret === process.env.CRON_SECRET;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const row = await prisma.appState.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID, data: toJson(defaultData()) },
    update: {},
  });

  const current = row.data as unknown as AppData;
  const data = rollDay(current, TIMEZONE);
  const minutes = nowMinutes(new Date(), TIMEZONE);

  const due = data.schedule.filter(
    (b) => timeToMinutes(b.startTime) === minutes && !data.notifiedBlockIds.includes(b.id)
  );

  if (due.length === 0) {
    if (data.currentDay !== current.currentDay) {
      await prisma.appState.update({ where: { id: SINGLETON_ID }, data: { data: toJson(data) } });
    }
    return NextResponse.json({ checked: 0, notified: [] });
  }

  const devices = await prisma.deviceSubscription.findMany({ where: { active: true } });

  for (const block of due) {
    for (const device of devices) {
      const result = await sendPush(device, {
        title: block.title,
        body: `Starting now (${block.startTime}) — let's go.`,
        url: "/",
      });

      if (!result.ok && (result.statusCode === 404 || result.statusCode === 410)) {
        await prisma.deviceSubscription.update({ where: { id: device.id }, data: { active: false } });
      } else if (result.ok) {
        await prisma.deviceSubscription.update({ where: { id: device.id }, data: { lastActiveAt: new Date() } });
      }
    }
  }

  const notifiedBlockIds = Array.from(new Set([...data.notifiedBlockIds, ...due.map((b) => b.id)]));
  await prisma.appState.update({
    where: { id: SINGLETON_ID },
    data: { data: toJson({ ...data, notifiedBlockIds }) },
  });

  return NextResponse.json({ checked: due.length, notified: due.map((b) => b.id) });
}

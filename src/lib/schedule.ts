import type { ScheduleBlock } from "./types";

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function nowMinutes(date = new Date(), timeZone?: string): number {
  if (!timeZone) return date.getHours() * 60 + date.getMinutes();

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export function sortedSchedule(schedule: ScheduleBlock[]): ScheduleBlock[] {
  return [...schedule].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
}

export function currentBlock(schedule: ScheduleBlock[], minutes = nowMinutes()): ScheduleBlock | null {
  return (
    sortedSchedule(schedule).find(
      (b) => timeToMinutes(b.startTime) <= minutes && minutes < timeToMinutes(b.endTime)
    ) ?? null
  );
}

export function nextBlock(schedule: ScheduleBlock[], minutes = nowMinutes()): ScheduleBlock | null {
  return sortedSchedule(schedule).find((b) => timeToMinutes(b.startTime) > minutes) ?? null;
}

export function blockProgress(block: ScheduleBlock, minutes = nowMinutes()): number {
  const start = timeToMinutes(block.startTime);
  const end = timeToMinutes(block.endTime);
  if (end <= start) return 0;
  const pct = ((minutes - start) / (end - start)) * 100;
  return Math.min(100, Math.max(0, pct));
}

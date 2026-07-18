import type { AppData } from "./types";

const STORAGE_KEY = "reminder-app:data";

export function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function defaultData(): AppData {
  return {
    schedule: [
      { id: crypto.randomUUID(), title: "Deep Study Session", startTime: "06:15", endTime: "08:15" },
      { id: crypto.randomUUID(), title: "Breakfast Break", startTime: "08:15", endTime: "08:45" },
      { id: crypto.randomUUID(), title: "Study Session 2", startTime: "08:45", endTime: "10:45" },
    ],
    goals: [
      { id: crypto.randomUUID(), text: "Complete a study module", done: false },
      { id: crypto.randomUUID(), text: "Solve 20 practice problems", done: false },
      { id: crypto.randomUUID(), text: "Revise notes", done: false },
    ],
    studyGoalMinutes: 600,
    studyMinutesToday: 0,
    streak: 0,
    currentDay: todayKey(),
    notifiedBlockIds: [],
  };
}

export function loadData(): AppData {
  if (typeof window === "undefined") return defaultData();

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultData();

  try {
    const parsed = JSON.parse(raw) as AppData;
    return rollDay(parsed);
  } catch {
    return defaultData();
  }
}

export function saveData(data: AppData): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** If the stored data is from a previous day, roll goals/study time over and update the streak. */
export function rollDay(data: AppData): AppData {
  const today = todayKey();
  if (data.currentDay === today) return data;

  const madeProgressYesterday = data.goals.some((g) => g.done) || data.studyMinutesToday > 0;
  const yesterday = todayKey(new Date(Date.now() - 86400000));
  const isConsecutive = data.currentDay === yesterday;

  const streak = madeProgressYesterday ? (isConsecutive ? data.streak + 1 : 1) : isConsecutive ? data.streak : 0;

  return {
    ...data,
    goals: data.goals.map((g) => ({ ...g, done: false })),
    studyMinutesToday: 0,
    streak,
    currentDay: today,
    notifiedBlockIds: [],
  };
}

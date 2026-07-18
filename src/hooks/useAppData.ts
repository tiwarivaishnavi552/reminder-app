"use client";

import { useCallback, useEffect, useState } from "react";
import type { AppData, Goal, ScheduleBlock } from "@/lib/types";
import { loadData, rollDay, saveData, todayKey } from "@/lib/storage";
import { requestNotificationPermission, sendNotification, notificationsSupported } from "@/lib/notifications";
import { timeToMinutes, nowMinutes } from "@/lib/schedule";

const TICK_MS = 15_000;

export function useAppData() {
  const [data, setData] = useState<AppData | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // Reading localStorage must happen post-mount to avoid an SSR/client hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(loadData());
    if (notificationsSupported()) setPermission(Notification.permission);
  }, []);

  useEffect(() => {
    if (data) saveData(data);
  }, [data]);

  // Tick: advance the clock, roll over to a new day, and fire due notifications.
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
      setData((prev) => {
        if (!prev) return prev;
        const rolled = rollDay(prev);

        if (permission !== "granted") return rolled;

        const minutes = nowMinutes();
        const due = rolled.schedule.filter(
          (b) => timeToMinutes(b.startTime) === minutes && !rolled.notifiedBlockIds.includes(b.id)
        );
        if (due.length === 0) return rolled;

        due.forEach((b) => sendNotification(b.title, `Starting now (${b.startTime}) — let's go.`));
        return {
          ...rolled,
          notifiedBlockIds: [...rolled.notifiedBlockIds, ...due.map((b) => b.id)],
        };
      });
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [permission]);

  const requestPermission = useCallback(async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
  }, []);

  const toggleGoal = useCallback((id: string) => {
    setData((prev) =>
      prev ? { ...prev, goals: prev.goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g)) } : prev
    );
  }, []);

  const addGoal = useCallback((text: string) => {
    const goal: Goal = { id: crypto.randomUUID(), text, done: false };
    setData((prev) => (prev ? { ...prev, goals: [...prev.goals, goal] } : prev));
  }, []);

  const removeGoal = useCallback((id: string) => {
    setData((prev) => (prev ? { ...prev, goals: prev.goals.filter((g) => g.id !== id) } : prev));
  }, []);

  const addBlock = useCallback((block: Omit<ScheduleBlock, "id">) => {
    const newBlock: ScheduleBlock = { ...block, id: crypto.randomUUID() };
    setData((prev) => (prev ? { ...prev, schedule: [...prev.schedule, newBlock] } : prev));
  }, []);

  const updateBlock = useCallback((id: string, patch: Partial<Omit<ScheduleBlock, "id">>) => {
    setData((prev) =>
      prev ? { ...prev, schedule: prev.schedule.map((b) => (b.id === id ? { ...b, ...patch } : b)) } : prev
    );
  }, []);

  const removeBlock = useCallback((id: string) => {
    setData((prev) => (prev ? { ...prev, schedule: prev.schedule.filter((b) => b.id !== id) } : prev));
  }, []);

  const logStudyMinutes = useCallback((minutes: number) => {
    setData((prev) =>
      prev ? { ...prev, studyMinutesToday: Math.max(0, prev.studyMinutesToday + minutes) } : prev
    );
  }, []);

  const setStudyGoalMinutes = useCallback((minutes: number) => {
    setData((prev) => (prev ? { ...prev, studyGoalMinutes: minutes } : prev));
  }, []);

  return {
    data,
    now,
    permission,
    requestPermission,
    toggleGoal,
    addGoal,
    removeGoal,
    addBlock,
    updateBlock,
    removeBlock,
    logStudyMinutes,
    setStudyGoalMinutes,
    today: todayKey(),
  };
}

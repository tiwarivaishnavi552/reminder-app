"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AppData, Goal, ScheduleBlock } from "@/lib/types";
import { requestNotificationPermission, sendNotification, notificationsSupported } from "@/lib/notifications";
import { registerServiceWorker, subscribeToPush, postSubscription } from "@/lib/push-client";
import { timeToMinutes, nowMinutes } from "@/lib/schedule";

const TICK_MS = 15_000;
const SAVE_DEBOUNCE_MS = 800;

async function fetchState(): Promise<{ data: AppData; updatedAt: string }> {
  const res = await fetch("/api/state");
  return res.json();
}

async function putState(
  data: AppData,
  expectedUpdatedAt: string | undefined
): Promise<{ status: number; data: AppData; updatedAt: string }> {
  const res = await fetch("/api/state", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, expectedUpdatedAt }),
  });
  const body = await res.json();
  return { status: res.status, data: body.data, updatedAt: body.updatedAt };
}

export function useAppData() {
  const [data, setData] = useState<AppData | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [now, setNow] = useState(() => new Date());

  const updatedAtRef = useRef<string | undefined>(undefined);
  const dirtyRef = useRef(false);
  const permissionRef = useRef<NotificationPermission>("default");

  useEffect(() => {
    // Reading Notification.permission and fetching server state must happen post-mount to
    // avoid an SSR/client hydration mismatch.
    if (notificationsSupported()) {
      permissionRef.current = Notification.permission;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPermission(Notification.permission);
    }
    fetchState().then(({ data, updatedAt }) => {
      updatedAtRef.current = updatedAt;
      setData(data);
    });
  }, []);

  // Debounced save: only fires for local mutations (dirtyRef), not for tick-driven state refreshes.
  useEffect(() => {
    if (!data || !dirtyRef.current) return;
    const timeout = setTimeout(async () => {
      const result = await putState(data, updatedAtRef.current);
      if (result.status === 409) {
        const fresh = await fetchState();
        updatedAtRef.current = fresh.updatedAt;
        dirtyRef.current = false;
        setData(fresh.data);
        return;
      }
      updatedAtRef.current = result.updatedAt;
      dirtyRef.current = false;
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [data]);

  // Tick: refresh the clock, pull server state (day-rollover + notifiedBlockIds from other devices),
  // and fire a local notification for snappy in-tab UX if a block is due and not yet notified.
  useEffect(() => {
    const interval = setInterval(async () => {
      setNow(new Date());
      if (dirtyRef.current) return;

      const fresh = await fetchState();
      updatedAtRef.current = fresh.updatedAt;
      let nextData = fresh.data;

      if (permissionRef.current === "granted") {
        const minutes = nowMinutes();
        const due = nextData.schedule.filter(
          (b) => timeToMinutes(b.startTime) === minutes && !nextData.notifiedBlockIds.includes(b.id)
        );
        if (due.length > 0) {
          due.forEach((b) => sendNotification(b.title, `Starting now (${b.startTime}) — let's go.`));
          nextData = { ...nextData, notifiedBlockIds: [...nextData.notifiedBlockIds, ...due.map((b) => b.id)] };
          const saved = await putState(nextData, updatedAtRef.current);
          if (saved.status !== 409) updatedAtRef.current = saved.updatedAt;
        }
      }

      setData(nextData);
    }, TICK_MS);
    return () => clearInterval(interval);
  }, []);

  const mutate = useCallback((updater: (prev: AppData) => AppData) => {
    dirtyRef.current = true;
    setData((prev) => (prev ? updater(prev) : prev));
  }, []);

  const requestPermission = useCallback(async () => {
    const result = await requestNotificationPermission();
    permissionRef.current = result;
    setPermission(result);

    if (result === "granted") {
      const registration = await registerServiceWorker();
      if (registration) {
        const subscription = await subscribeToPush(registration);
        if (subscription) await postSubscription(subscription);
      }
    }
  }, []);

  const toggleGoal = useCallback(
    (id: string) => mutate((prev) => ({ ...prev, goals: prev.goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g)) })),
    [mutate]
  );

  const addGoal = useCallback(
    (text: string) => {
      const goal: Goal = { id: crypto.randomUUID(), text, done: false };
      mutate((prev) => ({ ...prev, goals: [...prev.goals, goal] }));
    },
    [mutate]
  );

  const removeGoal = useCallback(
    (id: string) => mutate((prev) => ({ ...prev, goals: prev.goals.filter((g) => g.id !== id) })),
    [mutate]
  );

  const addBlock = useCallback(
    (block: Omit<ScheduleBlock, "id">) => {
      const newBlock: ScheduleBlock = { ...block, id: crypto.randomUUID() };
      mutate((prev) => ({ ...prev, schedule: [...prev.schedule, newBlock] }));
    },
    [mutate]
  );

  const updateBlock = useCallback(
    (id: string, patch: Partial<Omit<ScheduleBlock, "id">>) =>
      mutate((prev) => ({ ...prev, schedule: prev.schedule.map((b) => (b.id === id ? { ...b, ...patch } : b)) })),
    [mutate]
  );

  const removeBlock = useCallback(
    (id: string) => mutate((prev) => ({ ...prev, schedule: prev.schedule.filter((b) => b.id !== id) })),
    [mutate]
  );

  const logStudyMinutes = useCallback(
    (minutes: number) => mutate((prev) => ({ ...prev, studyMinutesToday: Math.max(0, prev.studyMinutesToday + minutes) })),
    [mutate]
  );

  const setStudyGoalMinutes = useCallback(
    (minutes: number) => mutate((prev) => ({ ...prev, studyGoalMinutes: minutes })),
    [mutate]
  );

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
  };
}

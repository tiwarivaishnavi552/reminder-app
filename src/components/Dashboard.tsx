"use client";

import { useAppData } from "@/hooks/useAppData";
import { NotificationBanner } from "./NotificationBanner";
import { CurrentTaskCard } from "./CurrentTaskCard";
import { GoalsPanel } from "./GoalsPanel";
import { StudyPanel } from "./StudyPanel";
import { ScheduleEditor } from "./ScheduleEditor";

export function Dashboard() {
  const {
    data,
    now,
    permission,
    requestPermission,
    toggleGoal,
    addGoal,
    removeGoal,
    addBlock,
    removeBlock,
    logStudyMinutes,
  } = useAppData();

  if (!data) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-black/40 dark:text-white/40">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <header>
        <h1 className="text-3xl font-bold">My Study OS</h1>
        <p className="text-sm text-black/50 dark:text-white/50">
          {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </header>

      <NotificationBanner permission={permission} onRequest={requestPermission} />

      <CurrentTaskCard schedule={data.schedule} now={now} />

      <div className="grid gap-6 sm:grid-cols-2">
        <GoalsPanel goals={data.goals} onToggle={toggleGoal} onAdd={addGoal} onRemove={removeGoal} />
        <StudyPanel
          studyMinutesToday={data.studyMinutesToday}
          studyGoalMinutes={data.studyGoalMinutes}
          streak={data.streak}
          onLog={logStudyMinutes}
        />
      </div>

      <ScheduleEditor schedule={data.schedule} onAdd={addBlock} onRemove={removeBlock} />
    </div>
  );
}

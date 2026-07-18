"use client";

export function StudyPanel({
  studyMinutesToday,
  studyGoalMinutes,
  streak,
  onLog,
}: {
  studyMinutesToday: number;
  studyGoalMinutes: number;
  streak: number;
  onLog: (minutes: number) => void;
}) {
  const pct = Math.min(100, (studyMinutesToday / studyGoalMinutes) * 100);
  const doneH = Math.floor(studyMinutesToday / 60);
  const doneM = studyMinutesToday % 60;
  const goalH = Math.floor(studyGoalMinutes / 60);
  const goalM = studyGoalMinutes % 60;

  return (
    <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-black/60 dark:text-white/60">
          Study Hours
        </h3>
        <span className="text-sm font-medium text-orange-600">🔥 {streak} day streak</span>
      </div>
      <p className="mt-2 text-lg font-bold">
        {doneH}h {doneM}m <span className="text-sm font-normal text-black/50 dark:text-white/50">/ {goalH}h {goalM}m</span>
      </p>
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onLog(25)}
          className="rounded-md border border-black/15 px-3 py-1.5 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
        >
          +25 min
        </button>
        <button
          onClick={() => onLog(50)}
          className="rounded-md border border-black/15 px-3 py-1.5 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
        >
          +50 min
        </button>
        <button
          onClick={() => onLog(-25)}
          className="rounded-md border border-black/15 px-3 py-1.5 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
        >
          -25 min
        </button>
      </div>
    </div>
  );
}

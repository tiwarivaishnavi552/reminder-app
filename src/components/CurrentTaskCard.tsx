import type { ScheduleBlock } from "@/lib/types";
import { blockProgress, currentBlock, formatTime, nextBlock } from "@/lib/schedule";

export function CurrentTaskCard({ schedule, now }: { schedule: ScheduleBlock[]; now: Date }) {
  const minutes = now.getHours() * 60 + now.getMinutes();
  const current = currentBlock(schedule, minutes);
  const upcoming = nextBlock(schedule, minutes);

  return (
    <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
      {current ? (
        <>
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">🔥 Current Task</p>
          <h2 className="mt-1 text-2xl font-bold">{current.title}</h2>
          <p className="mt-1 text-sm text-black/60 dark:text-white/60">
            {formatTime(current.startTime)} – {formatTime(current.endTime)}
          </p>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-orange-500 transition-all"
              style={{ width: `${blockProgress(current, minutes)}%` }}
            />
          </div>
        </>
      ) : (
        <>
          <p className="text-xs font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">
            No active block
          </p>
          <h2 className="mt-1 text-2xl font-bold">Free time</h2>
        </>
      )}

      {upcoming && (
        <p className="mt-4 text-sm text-black/60 dark:text-white/60">
          Next: <span className="font-medium text-black dark:text-white">{upcoming.title}</span> at{" "}
          {formatTime(upcoming.startTime)}
        </p>
      )}
    </div>
  );
}

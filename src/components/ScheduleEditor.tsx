"use client";

import { useState } from "react";
import type { ScheduleBlock } from "@/lib/types";
import { formatTime, sortedSchedule } from "@/lib/schedule";

export function ScheduleEditor({
  schedule,
  onAdd,
  onRemove,
}: {
  schedule: ScheduleBlock[];
  onAdd: (block: Omit<ScheduleBlock, "id">) => void;
  onRemove: (id: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  return (
    <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-black/60 dark:text-white/60">
        Daily Schedule
      </h3>
      <ul className="mt-3 space-y-2">
        {sortedSchedule(schedule).map((b) => (
          <li key={b.id} className="group flex items-center justify-between gap-2 text-sm">
            <span>
              <span className="font-medium">{b.title}</span>{" "}
              <span className="text-black/50 dark:text-white/50">
                {formatTime(b.startTime)} – {formatTime(b.endTime)}
              </span>
            </span>
            <button
              onClick={() => onRemove(b.id)}
              className="text-xs text-black/30 opacity-0 hover:text-red-600 group-hover:opacity-100"
              aria-label={`Remove ${b.title}`}
            >
              ✕
            </button>
          </li>
        ))}
        {schedule.length === 0 && (
          <li className="text-sm text-black/40 dark:text-white/40">No blocks scheduled.</li>
        )}
      </ul>
      <form
        className="mt-4 flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim() || !startTime || !endTime) return;
          onAdd({ title: title.trim(), startTime, endTime });
          setTitle("");
          setStartTime("");
          setEndTime("");
        }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Block title…"
          className="min-w-0 flex-1 rounded-md border border-black/15 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-orange-500 dark:border-white/15"
        />
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
          className="rounded-md border border-black/15 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-orange-500 dark:border-white/15"
        />
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
          className="rounded-md border border-black/15 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-orange-500 dark:border-white/15"
        />
        <button type="submit" className="rounded-md bg-orange-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-700">
          Add
        </button>
      </form>
    </div>
  );
}

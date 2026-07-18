"use client";

import { useState } from "react";
import type { Goal } from "@/lib/types";

export function GoalsPanel({
  goals,
  onToggle,
  onAdd,
  onRemove,
}: {
  goals: Goal[];
  onToggle: (id: string) => void;
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
}) {
  const [text, setText] = useState("");

  return (
    <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-black/60 dark:text-white/60">
        Today&apos;s Goals
      </h3>
      <ul className="mt-3 space-y-2">
        {goals.map((g) => (
          <li key={g.id} className="group flex items-center gap-2">
            <input
              type="checkbox"
              checked={g.done}
              onChange={() => onToggle(g.id)}
              className="h-4 w-4 accent-orange-600"
            />
            <span className={`flex-1 text-sm ${g.done ? "text-black/40 line-through dark:text-white/40" : ""}`}>
              {g.text}
            </span>
            <button
              onClick={() => onRemove(g.id)}
              className="text-xs text-black/30 opacity-0 hover:text-red-600 group-hover:opacity-100"
              aria-label={`Remove ${g.text}`}
            >
              ✕
            </button>
          </li>
        ))}
        {goals.length === 0 && <li className="text-sm text-black/40 dark:text-white/40">No goals yet.</li>}
      </ul>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          onAdd(text.trim());
          setText("");
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a goal…"
          className="flex-1 rounded-md border border-black/15 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-orange-500 dark:border-white/15"
        />
        <button type="submit" className="rounded-md bg-orange-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-700">
          Add
        </button>
      </form>
    </div>
  );
}

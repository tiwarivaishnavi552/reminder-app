"use client";

import { useEffect, useState } from "react";

interface Device {
  id: string;
  browser: string;
  os: string;
  isActive: boolean;
}

const ACTIVE_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

function icon(os: string): string {
  return os === "Android" || os === "iOS" ? "📱" : "💻";
}

export function DevicesPanel() {
  const [devices, setDevices] = useState<Device[] | null>(null);

  useEffect(() => {
    fetch("/api/devices")
      .then((res) => res.json())
      .then((body) => {
        const now = Date.now();
        const withStatus: Device[] = body.devices.map(
          (d: { id: string; browser: string; os: string; active: boolean; lastActiveAt: string }) => ({
            id: d.id,
            browser: d.browser,
            os: d.os,
            isActive: d.active && now - new Date(d.lastActiveAt).getTime() < ACTIVE_WINDOW_MS,
          })
        );
        setDevices(withStatus);
      });
  }, []);

  if (!devices || devices.length === 0) return null;

  return (
    <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-black/60 dark:text-white/60">Devices</h3>
      <ul className="mt-3 space-y-2 text-sm">
        {devices.map((d) => (
          <li key={d.id} className="flex items-center justify-between">
            <span>
              {icon(d.os)} {d.browser} {d.os}
            </span>
            <span className={d.isActive ? "text-emerald-600" : "text-black/40 dark:text-white/40"}>
              {d.isActive ? "Active" : "Inactive"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import { notificationsSupported } from "@/lib/notifications";

export function NotificationBanner({
  permission,
  onRequest,
}: {
  permission: NotificationPermission;
  onRequest: () => void;
}) {
  if (!notificationsSupported() || permission !== "default") return null;

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      <span>Enable notifications to get reminders when a schedule block starts.</span>
      <button
        onClick={onRequest}
        className="shrink-0 rounded-md bg-amber-600 px-3 py-1.5 font-medium text-white hover:bg-amber-700"
      >
        Allow notifications
      </button>
    </div>
  );
}

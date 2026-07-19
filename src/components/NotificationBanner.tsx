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
    <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      <p className="font-medium">Enable Study Notifications</p>
      <p className="mt-1 text-amber-800/80 dark:text-amber-200/80">Allow notifications to receive:</p>
      <ul className="mt-1 space-y-0.5 text-amber-800/80 dark:text-amber-200/80">
        <li>✓ Study reminders</li>
        <li>✓ Break alerts</li>
        <li>✓ Daily goal check-ins</li>
      </ul>
      <p className="mt-1 text-xs text-amber-800/60 dark:text-amber-200/60">
        Works across every device you enable it on, even when this tab is closed.
      </p>
      <button
        onClick={onRequest}
        className="mt-3 rounded-md bg-amber-600 px-3 py-1.5 font-medium text-white hover:bg-amber-700"
      >
        Enable notifications
      </button>
    </div>
  );
}

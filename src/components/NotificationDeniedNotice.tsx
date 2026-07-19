import { notificationsSupported } from "@/lib/notifications";

export function NotificationDeniedNotice({ permission }: { permission: NotificationPermission }) {
  if (!notificationsSupported() || permission !== "denied") return null;

  return (
    <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
      Notifications are blocked for this site. Enable them from your browser&apos;s site settings to get
      schedule reminders.
    </div>
  );
}

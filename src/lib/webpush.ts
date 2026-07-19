import webpush from "web-push";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT ?? "",
  process.env.VAPID_PUBLIC_KEY ?? "",
  process.env.VAPID_PRIVATE_KEY ?? ""
);

export interface PushSubscriptionKeys {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export type SendPushResult = { ok: true } | { ok: false; statusCode: number };

export async function sendPush(
  sub: PushSubscriptionKeys,
  payload: { title: string; body: string; url?: string }
): Promise<SendPushResult> {
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      JSON.stringify(payload)
    );
    return { ok: true };
  } catch (err) {
    const statusCode = err instanceof webpush.WebPushError ? err.statusCode : 0;
    return { ok: false, statusCode };
  }
}

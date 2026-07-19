"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UnlockPage() {
  const router = useRouter();
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(false);
    const res = await fetch("/api/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passphrase }),
    });
    setSubmitting(false);
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError(true);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5"
      >
        <h1 className="text-xl font-bold">My Study OS</h1>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">Enter your passphrase to continue.</p>
        <input
          type="password"
          autoFocus
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          className="mt-4 w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-orange-500 dark:border-white/15"
          placeholder="Passphrase"
        />
        {error && <p className="mt-2 text-sm text-red-600">Incorrect passphrase.</p>}
        <button
          type="submit"
          disabled={submitting}
          className="mt-4 w-full rounded-md bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
        >
          {submitting ? "Checking…" : "Unlock"}
        </button>
      </form>
    </div>
  );
}

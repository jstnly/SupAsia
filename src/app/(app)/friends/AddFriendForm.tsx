"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addFriendByUsername } from "@/server/actions/social";

export function AddFriendForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);
    startTransition(async () => {
      try {
        const friend = await addFriendByUsername(username);
        setOk(`Added @${friend.username}`);
        setUsername("");
        router.refresh();
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : "failed");
      }
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap gap-2">
      <Input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="@username"
        className="flex-1 min-w-[180px]"
      />
      <Button disabled={pending || !username.trim()}>
        {pending ? "Adding…" : "Add friend"}
      </Button>
      {err && <div className="w-full text-sm text-[var(--color-lotus-700)]">{err}</div>}
      {ok && <div className="w-full text-sm text-[var(--color-jade-700)]">{ok}</div>}
    </form>
  );
}

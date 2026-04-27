import { Suspense } from "react";
import { LoginForm } from "./LoginForm";
import Link from "next/link";
import { MascotSlot } from "@/components/game/MascotSlot";

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 inline-flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--color-lotus-400)] font-display font-bold text-white">B</div>
          <span className="font-display text-lg font-bold">Biết Tiếng Việt</span>
        </Link>
        <div className="card-soft p-8">
          <div className="mb-4 flex items-center gap-3">
            <MascotSlot size={64} />
            <div>
              <div className="font-display text-2xl font-bold">Welcome back</div>
              <div className="text-sm text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
                Bồ has been waiting for you.
              </div>
            </div>
          </div>
          <Suspense fallback={<div className="h-48" />}>
            <LoginForm />
          </Suspense>
        </div>
        <div className="mt-4 text-center text-xs text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">
          By signing up you agree to be polite to your buffalo.
        </div>
      </div>
    </main>
  );
}

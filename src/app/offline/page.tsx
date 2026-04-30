import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="text-7xl">🌐</div>
      <div>
        <h1 className="font-display text-3xl font-extrabold">Không có mạng</h1>
        <p className="mt-1 text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
          You&apos;re offline — connect to continue learning
        </p>
      </div>
      <p className="text-sm text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)] max-w-xs">
        Your progress is saved. Lessons you&apos;ve visited recently are cached and may still be accessible.
      </p>
      <Link
        href="/learn"
        className="rounded-full bg-[var(--color-jade-500)] px-6 py-3 font-display font-bold text-white shadow-[0_4px_0_0_rgba(26,20,35,0.2)]"
      >
        Try again
      </Link>
    </div>
  );
}

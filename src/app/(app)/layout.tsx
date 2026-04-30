import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id));
  if (!profile) redirect("/login");
  if (!profile.onboardedAt) redirect("/onboarding");

  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4 pb-24 pt-4 md:pb-6">
      <TopBar profile={profile} />
      <div className="flex-1 py-4">{children}</div>
      <BottomNav />
    </div>
  );
}

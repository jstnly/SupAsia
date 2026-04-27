import { getLeaderboard } from "@/server/actions/social";
import { LeaderboardClient } from "./LeaderboardClient";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string; window?: string }>;
}) {
  const sp = await searchParams;
  const scope = (sp.scope === "friends" ? "friends" : "global") as "global" | "friends";
  const window = (
    sp.window === "daily" ? "daily" :
    sp.window === "all-time" ? "all-time" : "weekly"
  ) as "daily" | "weekly" | "all-time";

  const rows = await getLeaderboard(scope, window);
  return <LeaderboardClient rows={rows} scope={scope} window={window} />;
}

import { getFriends } from "@/server/actions/social";
import { AddFriendForm } from "./AddFriendForm";
import { MascotSlot } from "@/components/game/MascotSlot";
import { Flame } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { SectionShell } from "@/components/ui/SectionShell";

export default async function FriendsPage() {
  const friends = await getFriends();

  return (
    <div className="space-y-6">
      <SectionShell section="friends">
        <PageHero
          section="friends"
          eyebrow="Bạn Bè · Friends"
          title="Your circle"
          subtitle="Add friends by username. You'll appear together on the leaderboard and can challenge each other to tone duels."
          meta={
            <div className="text-center">
              <div className="text-[10px] font-display uppercase tracking-wider text-white/80">Friends</div>
              <div className="font-display text-2xl font-extrabold">{friends.length}</div>
            </div>
          }
        />
      </SectionShell>

      <div className="card-soft p-5">
        <AddFriendForm />
      </div>

      <div className="space-y-2">
        {friends.length === 0 ? (
          <div className="card-soft text-center py-10">
            <MascotSlot size={96} emote="shrug" />
            <div className="font-display font-semibold mt-2">No friends yet</div>
            <p className="text-sm text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">Add a friend by username above to get started.</p>
          </div>
        ) : (
          friends.map((f) => (
            <div key={f.friendId} className="card-soft flex items-center gap-3 p-4">
              <MascotSlot size={48} variant={f.avatarVariant} />
              <div className="flex-1">
                <div className="font-display font-semibold">{f.displayName}</div>
                <div className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">@{f.username}</div>
              </div>
              <div className="inline-flex items-center gap-1 text-sm">
                <Flame size={14} className="text-[var(--color-gold-500)]" />
                <span className="font-display font-bold">{f.streakDays}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

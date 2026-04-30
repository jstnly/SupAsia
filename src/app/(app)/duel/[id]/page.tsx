import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDuel } from "@/server/actions/duel";
import { DuelRoom } from "./DuelRoom";

export default async function DuelRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const duel = await getDuel(id);
  if (!duel) notFound();

  const isHost = duel.hostId === user.id;
  const isGuest = duel.guestId === user.id;
  const canJoin = !isHost && !isGuest && duel.status === "waiting";

  return (
    <DuelRoom
      duelId={id}
      userId={user.id}
      initialDuel={duel}
      isHost={isHost}
      canJoin={canJoin}
    />
  );
}

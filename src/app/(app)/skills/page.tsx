import { redirect } from "next/navigation";
import { getSkillTreeState } from "@/server/actions/skill-tree";
import { SkillTree } from "./SkillTree";

export default async function SkillsPage() {
  const state = await getSkillTreeState();
  if (!state) redirect("/login");
  return <SkillTree initialLevel={state.level} initialUnlocked={state.unlocked} />;
}

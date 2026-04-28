"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Lock, Sparkles, Check } from "lucide-react";
import {
  SKILL_BRANCHES,
  BRANCH_NODES,
  SKILL_TREE_UNLOCK_LEVEL,
  availableSkillPoints,
  canUnlock,
  type SkillBranch,
  type SkillNode,
} from "@/lib/game/skill-tree";
import { unlockSkillNode } from "@/server/actions/skill-tree";
import { cn } from "@/lib/utils";

export function SkillTree({
  initialLevel,
  initialUnlocked,
}: {
  initialLevel: number;
  initialUnlocked: string[];
}) {
  const [unlocked, setUnlocked] = useState<string[]>(initialUnlocked);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const level = initialLevel;
  const unlockedSet = new Set(unlocked);
  const sp = availableSkillPoints(level, unlocked.length);
  const isLocked = level < SKILL_TREE_UNLOCK_LEVEL;

  function tryUnlock(nodeId: string) {
    setError(null);
    startTransition(async () => {
      const r = await unlockSkillNode(nodeId);
      if (r.ok) {
        setUnlocked(r.unlockedNodes);
      } else {
        setError(r.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="card-soft flex flex-wrap items-center gap-4 p-5">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[var(--color-lotus-500)] to-[var(--color-gold-500)] text-white">
          {isLocked ? <Lock size={26} /> : <Sparkles size={26} />}
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-lotus-600)]">
            Skill Tree
          </div>
          {isLocked ? (
            <>
              <h1 className="font-display text-2xl font-extrabold">Unlocks at L{SKILL_TREE_UNLOCK_LEVEL}</h1>
              <div className="text-sm text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
                You&apos;re at L{level}. Keep finishing lessons to earn skill points.
              </div>
            </>
          ) : (
            <>
              <h1 className="font-display text-2xl font-extrabold tabular-nums">{sp} SP available</h1>
              <div className="text-sm text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
                Level {level} · {unlocked.length}/24 nodes unlocked
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border-2 border-[var(--color-lotus-300)] bg-[var(--color-lotus-50)] p-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {(Object.keys(SKILL_BRANCHES) as SkillBranch[]).map((branch) => (
          <BranchCard
            key={branch}
            branch={branch}
            unlocked={unlockedSet}
            sp={sp}
            onUnlock={tryUnlock}
            pending={pending}
            isLocked={isLocked}
          />
        ))}
      </div>
    </div>
  );
}

function BranchCard({
  branch,
  unlocked,
  sp,
  onUnlock,
  pending,
  isLocked,
}: {
  branch: SkillBranch;
  unlocked: ReadonlySet<string>;
  sp: number;
  onUnlock: (id: string) => void;
  pending: boolean;
  isLocked: boolean;
}) {
  const meta = SKILL_BRANCHES[branch];
  const nodes = BRANCH_NODES[branch];
  const unlockedCount = nodes.filter((n) => unlocked.has(n.id)).length;

  return (
    <div className="card-soft space-y-3 p-4">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <div className="font-display font-bold" style={{ color: meta.color }}>
            {meta.nameEnglish}
          </div>
          <div className="truncate text-xs text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
            {meta.name} — {meta.tagline}
          </div>
        </div>
        <div className="font-display text-xs font-semibold tabular-nums">
          {unlockedCount}/6
        </div>
      </div>
      <div className="space-y-2">
        {nodes.map((node) => (
          <NodeRow
            key={node.id}
            node={node}
            isUnlocked={unlocked.has(node.id)}
            canUnlockNow={!isLocked && canUnlock(node.id, unlocked) && sp >= 1}
            onUnlock={onUnlock}
            pending={pending}
            color={meta.color}
          />
        ))}
      </div>
    </div>
  );
}

function NodeRow({
  node,
  isUnlocked,
  canUnlockNow,
  onUnlock,
  pending,
  color,
}: {
  node: SkillNode;
  isUnlocked: boolean;
  canUnlockNow: boolean;
  onUnlock: (id: string) => void;
  pending: boolean;
  color: string;
}) {
  return (
    <motion.div
      initial={false}
      animate={isUnlocked ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex items-center gap-3 rounded-2xl border-2 p-3",
        isUnlocked && "border-[var(--color-jade-500)] bg-[var(--color-jade-50)]",
        !isUnlocked && canUnlockNow && "bg-white",
        !isUnlocked && !canUnlockNow && "border-[var(--color-border)] bg-white opacity-55",
      )}
      style={!isUnlocked && canUnlockNow ? { borderColor: color, borderStyle: "dashed" } : {}}
    >
      <div
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-full font-display text-sm font-bold",
          isUnlocked && "bg-[var(--color-jade-500)] text-white",
        )}
        style={
          !isUnlocked
            ? { color, border: `2px solid ${color}`, background: "white" }
            : {}
        }
      >
        {isUnlocked ? <Check size={16} /> : node.position}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-display text-sm font-semibold">
          {node.name}{" "}
          <span className="text-xs font-normal opacity-60">({node.nameEnglish})</span>
        </div>
        <div className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
          {node.description}
        </div>
      </div>
      {canUnlockNow && (
        <button
          onClick={() => onUnlock(node.id)}
          disabled={pending}
          className="shrink-0 rounded-full px-3 py-1.5 font-display text-xs font-bold text-white shadow-[0_3px_0_0_rgba(26,20,35,0.18)] active:translate-y-0.5 disabled:opacity-50"
          style={{ background: color }}
        >
          {pending ? "…" : "Unlock"}
        </button>
      )}
    </motion.div>
  );
}

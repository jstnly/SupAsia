import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";

/**
 * Profiles — extends supabase auth.users.
 * Created via SQL trigger on auth.user insert (see drizzle/0000_init.sql).
 */
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // mirrors auth.uid()
  displayName: text("display_name").notNull(),
  username: text("username").notNull().unique(),
  avatarVariant: integer("avatar_variant").notNull().default(0),
  starterBuff: text("starter_buff").notNull().default("listener"),
  motivation: text("motivation"), // family / travel / heritage / fun
  dailyGoalMinutes: integer("daily_goal_minutes").notNull().default(15),
  dialect: text("dialect").notNull().default("southern"),
  totalXp: integer("total_xp").notNull().default(0),
  gold: integer("gold").notNull().default(0),
  gems: integer("gems").notNull().default(0),
  hearts: integer("hearts").notNull().default(5),
  heartsRefillAt: timestamp("hearts_refill_at"),
  streakDays: integer("streak_days").notNull().default(0),
  streakFreezes: integer("streak_freezes").notNull().default(0),
  lastLessonAt: timestamp("last_lesson_at"),
  league: text("league").notNull().default("tra-da"),
  unlockedSkillNodes: jsonb("unlocked_skill_nodes").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  earnedAchievements: jsonb("earned_achievements").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  onboardedAt: timestamp("onboarded_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const stats = pgTable("stats", {
  userId: uuid("user_id").primaryKey().references(() => profiles.id, { onDelete: "cascade" }),
  thinh: integer("thinh").notNull().default(0),
  khau: integer("khau").notNull().default(0),
  van: integer("van").notNull().default(0),
  but: integer("but").notNull().default(0),
  tuVung: integer("tu_vung").notNull().default(0),
  thanhDieu: integer("thanh_dieu").notNull().default(0),
  nguPhap: integer("ngu_phap").notNull().default(0),
});

export const progress = pgTable(
  "progress",
  {
    userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id").notNull(),
    status: text("status").notNull().default("started"), // started, completed, mastered
    bestScore: integer("best_score").notNull().default(0),
    attempts: integer("attempts").notNull().default(0),
    completedAt: timestamp("completed_at"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.lessonId] }),
    statusIdx: index("progress_status_idx").on(t.userId, t.status),
  })
);

export const xpEvents = pgTable(
  "xp_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    statKey: text("stat_key"), // null = overall only
    source: text("source").notNull(), // lesson:..., duel:..., bonus:streak, etc.
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    userTimeIdx: index("xp_events_user_time_idx").on(t.userId, t.createdAt),
  })
);

export const friendships = pgTable(
  "friendships",
  {
    userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
    friendId: uuid("friend_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("pending"), // pending, accepted, blocked
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.friendId] }),
  })
);

export const duels = pgTable("duels", {
  id: uuid("id").primaryKey().defaultRandom(),
  hostId: uuid("host_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  guestId: uuid("guest_id").references(() => profiles.id, { onDelete: "cascade" }),
  mode: text("mode").notNull().default("tone-duel"),
  status: text("status").notNull().default("waiting"), // waiting, active, finished, abandoned
  hostScore: integer("host_score").notNull().default(0),
  guestScore: integer("guest_score").notNull().default(0),
  winnerId: uuid("winner_id"),
  startedAt: timestamp("started_at"),
  finishedAt: timestamp("finished_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  xpReward: integer("xp_reward").notNull().default(0),
  iconKey: text("icon_key"),
});

export const userAchievements = pgTable(
  "user_achievements",
  {
    userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
    achievementId: text("achievement_id").notNull().references(() => achievements.id, { onDelete: "cascade" }),
    earnedAt: timestamp("earned_at").notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.achievementId] }),
  })
);

export const items = pgTable("items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slot: text("slot").notNull(), // eyes, ears, mouth, hand, charm, cosmetic
  rarity: text("rarity").notNull().default("common"),
  costGems: integer("cost_gems").notNull().default(0),
  effect: jsonb("effect"),
});

export const inventory = pgTable(
  "inventory",
  {
    userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
    itemId: text("item_id").notNull().references(() => items.id, { onDelete: "cascade" }),
    qty: integer("qty").notNull().default(1),
    equipped: boolean("equipped").notNull().default(false),
    acquiredAt: timestamp("acquired_at").notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.itemId] }),
  })
);

export type Profile = typeof profiles.$inferSelect;
export type Stats = typeof stats.$inferSelect;
export type ProgressRow = typeof progress.$inferSelect;
export type XpEvent = typeof xpEvents.$inferSelect;

export const SQL_NOW = sql`now()`;

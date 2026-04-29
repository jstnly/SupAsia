export type BossId =
  | "dragon-mekong"
  | "tiger-saigon"
  | "phoenix-dalat"
  | "lotus-hoian"
  | "dragon-danang"
  | "scholar-hue"
  | "hermit-ninhbinh"
  | "serpent-halong"
  | "phoenix-hanoi"
  | "wave-nhatrang"
  | "turtle-phuquoc"
  | "queen-cantho"
  | "elder-sapa";

export type Boss = {
  id: BossId;
  cityId: string;
  name: string;
  title: string;
  emoji: string;
  description: string;
  /** Minimum unit order needed to challenge */
  requiredUnit: number;
  xpReward: number;
  gemsReward: number;
  /** Number of correct answers needed to win (out of 10 fast-fire Qs) */
  winThreshold: number;
};

export const BOSSES: readonly Boss[] = [
  {
    id: "dragon-mekong",
    cityId: "mekong",
    name: "Rồng Sông Cửu",
    title: "The Nine-River Dragon",
    emoji: "🐉",
    description: "A mighty river dragon guards the delta. Answer its tone challenges to pass.",
    requiredUnit: 0,
    xpReward: 80,
    gemsReward: 5,
    winThreshold: 7,
  },
  {
    id: "tiger-saigon",
    cityId: "saigon",
    name: "Hổ Thành Phố",
    title: "The Urban Tiger",
    emoji: "🐯",
    description: "Streets of Sài Gòn are his jungle. Beat him at translation speed.",
    requiredUnit: 1,
    xpReward: 100,
    gemsReward: 8,
    winThreshold: 7,
  },
  {
    id: "phoenix-dalat",
    cityId: "dalat",
    name: "Phụng Đà Lạt",
    title: "The Misty Phoenix",
    emoji: "🦅",
    description: "She speaks only in poetry. Fill her blanks to earn her trust.",
    requiredUnit: 2,
    xpReward: 120,
    gemsReward: 10,
    winThreshold: 8,
  },
  {
    id: "lotus-hoian",
    cityId: "hoian",
    name: "Hoa Sen Cổ",
    title: "The Ancient Lotus",
    emoji: "🌺",
    description: "A lantern spirit who tests your vocabulary of cloth and trade.",
    requiredUnit: 3,
    xpReward: 140,
    gemsReward: 12,
    winThreshold: 8,
  },
  {
    id: "dragon-danang",
    cityId: "danang",
    name: "Rồng Cầu",
    title: "Dragon Bridge Spirit",
    emoji: "🌉",
    description: "Guardian of the fire-breathing bridge. Match its rapid-fire tones.",
    requiredUnit: 4,
    xpReward: 160,
    gemsReward: 15,
    winThreshold: 8,
  },
  {
    id: "scholar-hue",
    cityId: "hue",
    name: "Học Giả Hoàng Cung",
    title: "The Imperial Scholar",
    emoji: "📜",
    description: "A ghost of the Nguyễn court. Speak with formal precision.",
    requiredUnit: 5,
    xpReward: 180,
    gemsReward: 18,
    winThreshold: 8,
  },
  {
    id: "hermit-ninhbinh",
    cityId: "ninhbinh",
    name: "Ẩn Sĩ Tràng An",
    title: "The Cave Hermit",
    emoji: "🧙",
    description: "He has lived in the karst caves for centuries. Count and classify to impress him.",
    requiredUnit: 6,
    xpReward: 200,
    gemsReward: 20,
    winThreshold: 8,
  },
  {
    id: "serpent-halong",
    cityId: "halong",
    name: "Giao Long Vịnh",
    title: "The Bay Serpent",
    emoji: "🌊",
    description: "An ancient sea serpent who tests ocean vocabulary and scenic description.",
    requiredUnit: 7,
    xpReward: 220,
    gemsReward: 22,
    winThreshold: 9,
  },
  {
    id: "phoenix-hanoi",
    cityId: "hanoi",
    name: "Phượng Hoàng Bắc",
    title: "The Northern Phoenix",
    emoji: "🏛️",
    description: "Capital guardian who demands mastery of advanced grammar.",
    requiredUnit: 8,
    xpReward: 250,
    gemsReward: 25,
    winThreshold: 9,
  },
  {
    id: "wave-nhatrang",
    cityId: "nhatrang",
    name: "Sóng Thần",
    title: "The Tidal Wave Spirit",
    emoji: "🌊",
    description: "Health, seafood, beach — answer her questions to surf safely.",
    requiredUnit: 9,
    xpReward: 270,
    gemsReward: 28,
    winThreshold: 9,
  },
  {
    id: "turtle-phuquoc",
    cityId: "phuquoc",
    name: "Rùa Vàng Đảo",
    title: "The Golden Island Turtle",
    emoji: "🐢",
    description: "Ancient and wise, she tests your eco-vocabulary and emotions.",
    requiredUnit: 10,
    xpReward: 300,
    gemsReward: 30,
    winThreshold: 9,
  },
  {
    id: "queen-cantho",
    cityId: "cantho",
    name: "Nữ Vương Chợ Nổi",
    title: "The Floating Market Queen",
    emoji: "⛵",
    description: "She rules the dawn market. Master bargaining and classifiers.",
    requiredUnit: 11,
    xpReward: 330,
    gemsReward: 35,
    winThreshold: 9,
  },
  {
    id: "elder-sapa",
    cityId: "sapa",
    name: "Trưởng Lão Fansipan",
    title: "The Summit Elder",
    emoji: "🏔️",
    description: "The final guardian, atop the roof of Indochina. Prove complete mastery.",
    requiredUnit: 12,
    xpReward: 500,
    gemsReward: 50,
    winThreshold: 10,
  },
];

export const BOSS_BY_CITY = Object.fromEntries(BOSSES.map((b) => [b.cityId, b]));

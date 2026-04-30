import type { ToneId } from "@/lib/game/tones";

export type WordCard = {
  kind: "word";
  vi: string;
  en: string;
  tone?: ToneId;
  examples?: { vi: string; en: string }[];
  notes?: string;
};

export type GrammarCard = {
  kind: "grammar";
  pattern: string;
  explanation: string;
  examples: { vi: string; en: string }[];
};

export type ToneCard = {
  kind: "tone";
  toneId: ToneId;
  description: string;
  examples: { vi: string; en: string }[];
  tips?: string;
};

export type PhraseCard = {
  kind: "phrase";
  vi: string;
  en: string;
  literal?: string;
  whenToUse: string;
};

export type CultureCard = {
  kind: "culture";
  topic: string;
  body: string;
};

export type KnowledgeResponse = WordCard | GrammarCard | ToneCard | PhraseCard | CultureCard;

export type KnowledgeEntry = {
  id: string;
  intent: "vocab" | "grammar" | "tone" | "phrase" | "culture" | "pronunciation";
  triggers: string[];
  keywords: string[];
  response: KnowledgeResponse;
};

// ─── Tones ────────────────────────────────────────────────────────────────────

const TONE_ENTRIES: KnowledgeEntry[] = [
  {
    id: "tone-ngang",
    intent: "tone",
    triggers: ["ngang tone", "level tone", "no tone", "flat tone"],
    keywords: ["ngang", "level", "flat"],
    response: {
      kind: "tone",
      toneId: "ngang",
      description: "The level tone — pitch stays steady at a mid level. No diacritic mark on the vowel.",
      examples: [
        { vi: "ma", en: "ghost" },
        { vi: "ba", en: "three" },
        { vi: "anh", en: "older brother / you (male)" },
      ],
      tips: "Think of saying 'ahh' at the doctor's office — flat and held. This is the easiest tone for English speakers.",
    },
  },
  {
    id: "tone-sac",
    intent: "tone",
    triggers: ["sắc tone", "rising tone", "acute tone"],
    keywords: ["sac", "rising", "acute"],
    response: {
      kind: "tone",
      toneId: "sac",
      description: "The rising (sắc) tone — pitch starts mid and sharply rises, like asking 'what?!' in surprise.",
      examples: [
        { vi: "má", en: "mother (Southern)" },
        { vi: "cá", en: "fish" },
        { vi: "nước", en: "water" },
      ],
      tips: "Marked with an acute accent ´. Glide your voice upward sharply at the end of the syllable.",
    },
  },
  {
    id: "tone-huyen",
    intent: "tone",
    triggers: ["huyền tone", "falling tone", "grave tone"],
    keywords: ["huyen", "falling", "grave"],
    response: {
      kind: "tone",
      toneId: "huyen",
      description: "The falling (huyền) tone — pitch starts mid and gently falls. Voice lowers smoothly.",
      examples: [
        { vi: "mà", en: "but / which" },
        { vi: "bà", en: "grandmother" },
        { vi: "trời", en: "sky / heaven" },
      ],
      tips: "Marked with a grave accent `. Like the resigned 'oh well' tone in English.",
    },
  },
  {
    id: "tone-hoi",
    intent: "tone",
    triggers: ["hỏi tone", "dipping tone", "question tone"],
    keywords: ["hoi", "dipping", "question"],
    response: {
      kind: "tone",
      toneId: "hoi",
      description: "The dipping (hỏi) tone — pitch dips down then rises, like asking 'really?' with hesitation.",
      examples: [
        { vi: "mả", en: "tomb" },
        { vi: "hỏi", en: "to ask" },
        { vi: "khỏe", en: "well / healthy" },
      ],
      tips: "Marked with a hook ̉ above the vowel. In Southern speech, hỏi and ngã merge into the same sound — easier for learners.",
    },
  },
  {
    id: "tone-nga",
    intent: "tone",
    triggers: ["ngã tone", "broken tone", "tilde tone"],
    keywords: ["nga", "broken", "tilde"],
    response: {
      kind: "tone",
      toneId: "nga",
      description: "The broken (ngã) tone — pitch breaks with a glottal stop in the middle, then rises sharply.",
      examples: [
        { vi: "mã", en: "horse / code" },
        { vi: "ngã", en: "to fall" },
        { vi: "đã", en: "(past tense marker)" },
      ],
      tips: "Marked with a tilde ˜. In Southern dialect this merges with hỏi — both sound like a dipping rise. Northern speakers keep them distinct.",
    },
  },
  {
    id: "tone-nang",
    intent: "tone",
    triggers: ["nặng tone", "heavy tone", "dot tone"],
    keywords: ["nang", "heavy", "dot"],
    response: {
      kind: "tone",
      toneId: "nang",
      description: "The heavy (nặng) tone — short, low, and abruptly cut off, like a verbal punch.",
      examples: [
        { vi: "mạ", en: "rice seedling" },
        { vi: "lạ", en: "strange / unfamiliar" },
        { vi: "đẹp", en: "beautiful" },
      ],
      tips: "Marked with a dot ̣ below the vowel. Cut your voice short — like saying 'uh!' with finality.",
    },
  },
  {
    id: "tone-overview",
    intent: "tone",
    triggers: ["how many tones", "tones in vietnamese", "vietnamese tones"],
    keywords: ["tones"],
    response: {
      kind: "culture",
      topic: "The 6 Vietnamese Tones",
      body:
        "Vietnamese has 6 tones in writing: **ngang** (level), **sắc** (rising), **huyền** (falling), **hỏi** (dipping), **ngã** (broken), and **nặng** (heavy). " +
        "The same syllable changes meaning entirely with the tone — `ma` (ghost), `má` (mother), `mà` (but), `mả` (tomb), `mã` (horse), `mạ` (rice seedling).\n\n" +
        "**Southern Vietnamese merges hỏi and ngã in speech**, so spoken Saigonese has 5 distinct tones, not 6. Tap any tone above for examples and pronunciation tips.",
    },
  },
];

// ─── Pronouns ─────────────────────────────────────────────────────────────────

const PRONOUN_ENTRIES: KnowledgeEntry[] = [
  {
    id: "pronoun-toi",
    intent: "vocab",
    triggers: ["tôi", "toi", "what does tôi mean", "i in vietnamese"],
    keywords: ["toi", "i", "me"],
    response: {
      kind: "word",
      vi: "tôi",
      en: "I (formal/neutral)",
      tone: "ngang",
      examples: [
        { vi: "Tôi tên là Lan.", en: "My name is Lan." },
        { vi: "Tôi không biết.", en: "I don't know." },
      ],
      notes: "Neutral and slightly formal. Safe to use with strangers in business settings, but feels distant with friends — switch to mình or age-based pronouns once you get comfortable.",
    },
  },
  {
    id: "pronoun-minh",
    intent: "vocab",
    triggers: ["mình", "minh", "what does mình mean"],
    keywords: ["minh"],
    response: {
      kind: "word",
      vi: "mình",
      en: "I / me (casual, peers)",
      tone: "huyen",
      examples: [
        { vi: "Mình đi nhé!", en: "I'm heading out!" },
        { vi: "Mình thích cà phê.", en: "I like coffee." },
      ],
      notes: "Friendly and warm — used with friends and peers. Also means 'we' (inclusive) and 'self'. The default 'I' for casual chat among same-age people.",
    },
  },
  {
    id: "pronoun-anh",
    intent: "vocab",
    triggers: ["anh", "what does anh mean", "older brother in vietnamese"],
    keywords: ["anh", "brother"],
    response: {
      kind: "word",
      vi: "anh",
      en: "older brother / you (male, older)",
      tone: "ngang",
      examples: [
        { vi: "Anh khỏe không?", en: "How are you? (to an older man)" },
        { vi: "Anh tên gì?", en: "What's your name? (to an older man)" },
      ],
      notes: "Used for any male slightly older than you, or your literal older brother. A male speaker can also use 'anh' to refer to himself when talking to someone younger.",
    },
  },
  {
    id: "pronoun-chi",
    intent: "vocab",
    triggers: ["chị", "chi", "what does chị mean", "older sister in vietnamese"],
    keywords: ["chi", "sister"],
    response: {
      kind: "word",
      vi: "chị",
      en: "older sister / you (female, older)",
      tone: "nang",
      examples: [
        { vi: "Chị ơi!", en: "Excuse me, miss! (to an older woman)" },
        { vi: "Chị muốn gì?", en: "What would you like? (to an older woman)" },
      ],
      notes: "Used for any female slightly older than you. A female speaker uses 'chị' to refer to herself when talking to someone younger.",
    },
  },
  {
    id: "pronoun-em",
    intent: "vocab",
    triggers: ["em", "what does em mean", "younger sibling in vietnamese"],
    keywords: ["em", "younger"],
    response: {
      kind: "word",
      vi: "em",
      en: "younger sibling / you (younger) / I (when speaking to someone older)",
      tone: "ngang",
      examples: [
        { vi: "Em tên gì?", en: "What's your name? (to a younger person)" },
        { vi: "Em không biết.", en: "I don't know. (when you're younger than the listener)" },
      ],
      notes: "Asymmetric: 'em' is what the older person calls the younger, AND what the younger calls themselves. Also used between romantic partners (em = the woman or younger).",
    },
  },
  {
    id: "pronoun-ba",
    intent: "vocab",
    triggers: ["ba", "what does ba mean", "father in vietnamese", "dad in vietnamese"],
    keywords: ["ba", "father", "dad"],
    response: {
      kind: "word",
      vi: "ba",
      en: "dad / father (Southern)",
      tone: "ngang",
      examples: [
        { vi: "Ba ơi!", en: "Dad!" },
        { vi: "Ba của tôi.", en: "My dad." },
      ],
      notes: "Southern dialect. Northern speakers use 'bố' instead. Both mean 'dad' — match what your family/region uses.",
    },
  },
  {
    id: "pronoun-ma",
    intent: "vocab",
    triggers: ["má", "ma", "what does má mean", "mother in vietnamese", "mom in vietnamese"],
    keywords: ["ma", "mother", "mom"],
    response: {
      kind: "word",
      vi: "má",
      en: "mom / mother (Southern)",
      tone: "sac",
      examples: [
        { vi: "Má ơi!", en: "Mom!" },
        { vi: "Má nấu cơm.", en: "Mom is cooking rice." },
      ],
      notes: "Southern dialect. Northern speakers use 'mẹ' instead. Be careful — without the rising tone, 'ma' means 'ghost'.",
    },
  },
  {
    id: "pronoun-ban",
    intent: "vocab",
    triggers: ["bạn", "ban", "what does bạn mean", "friend in vietnamese"],
    keywords: ["ban", "friend", "you"],
    response: {
      kind: "word",
      vi: "bạn",
      en: "friend / you (peer)",
      tone: "nang",
      examples: [
        { vi: "Bạn tên gì?", en: "What's your name? (to a peer)" },
        { vi: "Bạn của tôi.", en: "My friend." },
      ],
      notes: "Neutral 'you' for someone roughly your age. Common in classrooms, language apps, and online. In real Vietnamese conversation, age-based pronouns (anh/chị/em) usually replace it once age is known.",
    },
  },
  {
    id: "pronoun-co",
    intent: "vocab",
    triggers: ["cô", "co", "what does cô mean", "aunt in vietnamese", "miss in vietnamese"],
    keywords: ["co", "aunt", "miss", "ms"],
    response: {
      kind: "word",
      vi: "cô",
      en: "aunt / Ms. / female teacher / you (woman ~mom's age)",
      tone: "ngang",
      examples: [
        { vi: "Cô ơi!", en: "Excuse me, ma'am!" },
        { vi: "Cô giáo.", en: "Female teacher." },
      ],
      notes: "Used for a woman around your mother's age but not in your family. Polite and respectful. Also addresses female teachers regardless of age.",
    },
  },
  {
    id: "pronoun-chu",
    intent: "vocab",
    triggers: ["chú", "chu", "what does chú mean", "uncle in vietnamese"],
    keywords: ["chu", "uncle", "sir"],
    response: {
      kind: "word",
      vi: "chú",
      en: "uncle / Mr. / you (man ~dad's age)",
      tone: "sac",
      examples: [
        { vi: "Chú ơi!", en: "Excuse me, sir!" },
        { vi: "Chú là ai?", en: "Who are you, sir?" },
      ],
      notes: "Used for a man around your father's age but not in your family. Polite address for a stranger who's clearly older.",
    },
  },
];

// ─── Greetings ────────────────────────────────────────────────────────────────

const GREETING_ENTRIES: KnowledgeEntry[] = [
  {
    id: "greeting-xinchao",
    intent: "phrase",
    triggers: ["xin chào", "hello in vietnamese", "how do i say hello"],
    keywords: ["hello", "chao", "xin"],
    response: {
      kind: "phrase",
      vi: "Xin chào",
      en: "Hello (formal/polite)",
      literal: "please-greet",
      whenToUse: "Polite greeting suitable for any time and any audience — strangers, elders, business settings. Slightly formal; among friends just 'Chào' is common.",
    },
  },
  {
    id: "greeting-chao",
    intent: "phrase",
    triggers: ["chào", "hi in vietnamese", "casual hello"],
    keywords: ["hi", "chao"],
    response: {
      kind: "phrase",
      vi: "Chào + [pronoun]",
      en: "Hi (with the listener's pronoun)",
      literal: "greet-anh / greet-chị / greet-em",
      whenToUse: "Add the appropriate pronoun: 'Chào anh' (older brother/man), 'Chào chị' (older sister/woman), 'Chào em' (younger). Sounds much warmer than 'Xin chào' alone.",
    },
  },
  {
    id: "greeting-buoisang",
    intent: "phrase",
    triggers: ["chào buổi sáng", "good morning"],
    keywords: ["morning", "sang", "buoi"],
    response: {
      kind: "phrase",
      vi: "Chào buổi sáng",
      en: "Good morning",
      literal: "greet-time-morning",
      whenToUse: "Used in formal/written contexts (TV, hotels, business). Conversational Vietnamese rarely says 'good morning' — people just say 'Chào + pronoun'.",
    },
  },
  {
    id: "greeting-tambiet",
    intent: "phrase",
    triggers: ["tạm biệt", "goodbye in vietnamese"],
    keywords: ["goodbye", "bye", "tam", "biet"],
    response: {
      kind: "phrase",
      vi: "Tạm biệt",
      en: "Goodbye",
      literal: "temporarily-part",
      whenToUse: "Formal goodbye, fine in any setting. With friends 'Chào nhé' or 'Hẹn gặp lại' is more common.",
    },
  },
  {
    id: "greeting-hengaplai",
    intent: "phrase",
    triggers: ["hẹn gặp lại", "see you later", "see you again"],
    keywords: ["hen", "gap", "lai", "see"],
    response: {
      kind: "phrase",
      vi: "Hẹn gặp lại",
      en: "See you again / See you later",
      literal: "appoint-meet-again",
      whenToUse: "Warm, friendly farewell when you expect to see the person again. Add 'nhé' at the end for extra warmth.",
    },
  },
];

// ─── Common phrases ───────────────────────────────────────────────────────────

const PHRASE_ENTRIES: KnowledgeEntry[] = [
  {
    id: "phrase-camon",
    intent: "phrase",
    triggers: ["cảm ơn", "thank you in vietnamese", "thanks in vietnamese"],
    keywords: ["thanks", "thank", "cam", "on"],
    response: {
      kind: "phrase",
      vi: "Cảm ơn",
      en: "Thank you",
      literal: "feel-favor",
      whenToUse: "Add the listener's pronoun for warmth: 'Cảm ơn anh/chị/em'. For extra emphasis: 'Cảm ơn nhiều' (thanks a lot) or 'Cảm ơn rất nhiều' (thank you very much).",
    },
  },
  {
    id: "phrase-xinloi",
    intent: "phrase",
    triggers: ["xin lỗi", "sorry in vietnamese", "excuse me in vietnamese"],
    keywords: ["sorry", "excuse", "xin", "loi"],
    response: {
      kind: "phrase",
      vi: "Xin lỗi",
      en: "Sorry / Excuse me",
      literal: "please-fault",
      whenToUse: "Both an apology and a way to get someone's attention. 'Xin lỗi anh/chị, …' works like 'Excuse me, sir/ma'am, …'.",
    },
  },
  {
    id: "phrase-khongsao",
    intent: "phrase",
    triggers: ["không sao", "no problem", "you're welcome"],
    keywords: ["nosao", "khong", "sao"],
    response: {
      kind: "phrase",
      vi: "Không sao",
      en: "No problem / It's fine / You're welcome",
      literal: "no-matter",
      whenToUse: "Reply to apologies AND to thanks. The all-purpose 'don't worry about it' of Vietnamese. 'Không sao đâu' is even warmer.",
    },
  },
  {
    id: "phrase-ngonqua",
    intent: "phrase",
    triggers: ["ngon quá", "delicious in vietnamese", "tasty in vietnamese"],
    keywords: ["ngon", "qua", "delicious", "tasty"],
    response: {
      kind: "phrase",
      vi: "Ngon quá!",
      en: "So delicious!",
      literal: "tasty-very",
      whenToUse: "Compliment food at any meal. Hosts love hearing this. Just 'Ngon!' is fine too. 'Ngon lắm' = very tasty.",
    },
  },
  {
    id: "phrase-duockhong",
    intent: "phrase",
    triggers: ["được không", "is it ok", "can i", "may i"],
    keywords: ["duoc", "khong", "ok", "may"],
    response: {
      kind: "phrase",
      vi: "… được không?",
      en: "… is it OK? / can I … ?",
      literal: "...possible-not?",
      whenToUse: "Tag onto the end of any request: 'Tôi ngồi đây được không?' (Can I sit here?). Polite, soft request. Yes/no answer.",
    },
  },
  {
    id: "phrase-lamon",
    intent: "phrase",
    triggers: ["làm ơn", "please in vietnamese"],
    keywords: ["lam", "on", "please"],
    response: {
      kind: "phrase",
      vi: "Làm ơn",
      en: "Please (do me a favor)",
      literal: "do-favor",
      whenToUse: "Used before a request: 'Làm ơn cho tôi…' (please give me…). More formal than just adding 'đi' at the end of a request. Use with strangers or in service situations.",
    },
  },
  {
    id: "phrase-vangda",
    intent: "phrase",
    triggers: ["vâng", "dạ", "yes politely", "polite yes"],
    keywords: ["vang", "da", "yes"],
    response: {
      kind: "phrase",
      vi: "Vâng / Dạ",
      en: "Yes (polite)",
      literal: "yes-respectfully",
      whenToUse: "'Dạ' is Southern, 'Vâng' is Northern. Both signal respect. Drop them in front of any reply to elders/customers/teachers: 'Dạ, em hiểu' (Yes, I understand). 'Có' = yes (matter-of-fact); 'Ừ' = yeah (very casual, peers only).",
    },
  },
  {
    id: "phrase-conhongkhong",
    intent: "phrase",
    triggers: ["có không", "yes or no", "do you have"],
    keywords: ["co", "khong", "yes", "no"],
    response: {
      kind: "phrase",
      vi: "Có … không?",
      en: "Do you have / is there … ?",
      literal: "have...not?",
      whenToUse: "Wraps a noun for yes/no questions: 'Có cà phê không?' (Do you have coffee?). Answer with 'Có' (yes) or 'Không' (no).",
    },
  },
  {
    id: "phrase-baonhieu",
    intent: "phrase",
    triggers: ["bao nhiêu", "how much", "how many"],
    keywords: ["bao", "nhieu", "how", "much", "many"],
    response: {
      kind: "phrase",
      vi: "Bao nhiêu?",
      en: "How much / how many?",
      literal: "how-much",
      whenToUse: "'Bao nhiêu tiền?' (How much money?) is the question for prices. 'Bao nhiêu tuổi?' = how old are you?",
    },
  },
  {
    id: "phrase-odau",
    intent: "phrase",
    triggers: ["ở đâu", "where is", "where are"],
    keywords: ["o", "dau", "where"],
    response: {
      kind: "phrase",
      vi: "… ở đâu?",
      en: "Where is … ?",
      literal: "...at-where?",
      whenToUse: "Tag onto the end of a noun: 'Nhà vệ sinh ở đâu?' (Where's the bathroom?). The answer comes back with location words: 'ở bên kia' (over there), 'ở đối diện' (across), 'gần đây' (nearby).",
    },
  },
];

// ─── Grammar essentials ───────────────────────────────────────────────────────

const GRAMMAR_ENTRIES: KnowledgeEntry[] = [
  {
    id: "grammar-khong-question",
    intent: "grammar",
    triggers: ["không question", "yes no question", "how to ask yes no", "không particle"],
    keywords: ["khong", "question", "yes", "no"],
    response: {
      kind: "grammar",
      pattern: "[Subject] + [Verb/Adjective] + không?",
      explanation: "Wrap a verb or adjective with '... không?' to make a yes/no question. Answer 'có' (yes/affirm) or 'không' (no). Vietnamese has no 'do/does/did' helpers — just append không.",
      examples: [
        { vi: "Bạn khỏe không?", en: "Are you well?" },
        { vi: "Có cà phê sữa không?", en: "Do you have milk coffee?" },
        { vi: "Trời mưa không?", en: "Is it raining?" },
      ],
    },
  },
  {
    id: "grammar-tense-markers",
    intent: "grammar",
    triggers: ["past tense", "future tense", "tense in vietnamese", "đã đang sẽ", "verb tense"],
    keywords: ["tense", "past", "future", "da", "dang", "se"],
    response: {
      kind: "grammar",
      pattern: "[Subject] + (đã / đang / sẽ) + [Verb]",
      explanation: "Vietnamese verbs never conjugate. Add a tense marker BEFORE the verb when needed: 'đã' (past, completed), 'đang' (in progress, like English -ing), 'sẽ' (future). Often the marker is dropped if context is clear.",
      examples: [
        { vi: "Tôi đã ăn rồi.", en: "I already ate." },
        { vi: "Cô ấy đang học.", en: "She is studying." },
        { vi: "Mình sẽ đi mai.", en: "I'll go tomorrow." },
        { vi: "Hôm qua tôi gặp anh ấy.", en: "Yesterday I met him. (no marker needed — 'hôm qua' = yesterday makes it clear)" },
      ],
    },
  },
  {
    id: "grammar-classifiers",
    intent: "grammar",
    triggers: ["classifier", "measure word", "cái con cây", "what is cái"],
    keywords: ["classifier", "measure", "cai", "con", "cay"],
    response: {
      kind: "grammar",
      pattern: "[Number] + [Classifier] + [Noun]",
      explanation: "Vietnamese needs a 'classifier' word between numbers and nouns. The most common: 'cái' (objects), 'con' (animals + some objects like knife/road), 'cây' (long thin things), 'quả/trái' (fruit), 'người' (people).",
      examples: [
        { vi: "ba cái bàn", en: "three tables" },
        { vi: "hai con mèo", en: "two cats" },
        { vi: "một cây bút", en: "one pen" },
        { vi: "bốn trái xoài", en: "four mangoes (Southern)" },
      ],
    },
  },
  {
    id: "grammar-em-vs-anh",
    intent: "grammar",
    triggers: ["difference between em and anh", "em vs anh", "when to use em", "when to use anh"],
    keywords: ["em", "anh", "difference", "between"],
    response: {
      kind: "grammar",
      pattern: "Older speaks → calls listener 'em' / refers to self as 'anh' (or 'chị')",
      explanation: "Pronouns shift based on RELATIVE AGE. If you're older than the listener: you = 'anh' (male) or 'chị' (female), they = 'em'. If younger: you = 'em', they = 'anh/chị'. Same conversation, both speakers use the right pronouns simultaneously.",
      examples: [
        { vi: "Anh giúp em được không?", en: "Can I (older male) help you (younger)?" },
        { vi: "Em không hiểu, chị ơi.", en: "I (younger) don't understand, sister (older female)." },
      ],
    },
  },
  {
    id: "grammar-imperative-di",
    intent: "grammar",
    triggers: ["đi at end", "di particle", "imperative", "command", "let's go"],
    keywords: ["di", "imperative", "command"],
    response: {
      kind: "grammar",
      pattern: "[Verb] + đi",
      explanation: "Adding 'đi' at the end of a verb makes it a soft suggestion or invitation, like 'let's …' or 'go ahead and …'. Not bossy — friendly.",
      examples: [
        { vi: "Ăn đi!", en: "Eat up! / Go ahead and eat!" },
        { vi: "Đi đi!", en: "Let's go! / Go on!" },
        { vi: "Nói đi.", en: "Go ahead, say it." },
      ],
    },
  },
  {
    id: "grammar-noun-modifier",
    intent: "grammar",
    triggers: ["adjective order", "noun adjective", "color order", "modifier order"],
    keywords: ["adjective", "modifier", "order", "color"],
    response: {
      kind: "grammar",
      pattern: "[Noun] + [Modifier]",
      explanation: "Modifiers come AFTER the noun in Vietnamese, opposite of English. 'Red flower' is literally 'flower red'. Same with possession: 'my book' = 'sách của tôi' (book of me).",
      examples: [
        { vi: "hoa đỏ", en: "red flower (lit. flower red)" },
        { vi: "cà phê đen", en: "black coffee (lit. coffee black)" },
        { vi: "nhà to", en: "big house (lit. house big)" },
      ],
    },
  },
  {
    id: "grammar-cho-toi",
    intent: "grammar",
    triggers: ["cho tôi", "give me", "i'll have", "ordering"],
    keywords: ["cho", "toi", "give", "have"],
    response: {
      kind: "grammar",
      pattern: "Cho + [pronoun] + [item]",
      explanation: "The polite ordering pattern. Literally 'give me X'. Soften with 'làm ơn' (please) at the front, or 'nhé' at the end. Use 'mình' instead of 'tôi' with peers.",
      examples: [
        { vi: "Cho tôi một ly cà phê đen.", en: "I'll have a black coffee." },
        { vi: "Làm ơn cho mình hai cái bánh mì.", en: "Please give me two banh mi." },
      ],
    },
  },
  {
    id: "grammar-southern-vs-northern",
    intent: "grammar",
    triggers: ["southern vs northern", "saigon vs hanoi", "dialect difference"],
    keywords: ["southern", "northern", "dialect", "saigon", "hanoi"],
    response: {
      kind: "grammar",
      pattern: "Southern (Sài Gòn) ↔ Northern (Hà Nội)",
      explanation: "Pronunciation, vocabulary, and a few tones differ between regions. The biggest learner-relevant differences: Southern merges hỏi/ngã into one tone, drops final consonants more, and uses different family words. This app teaches Southern by default; the Northern pack unlocks at level 25.",
      examples: [
        { vi: "ba (S) / bố (N)", en: "dad" },
        { vi: "má (S) / mẹ (N)", en: "mom" },
        { vi: "trái (S) / quả (N)", en: "fruit (classifier)" },
        { vi: "muỗng (S) / thìa (N)", en: "spoon" },
        { vi: "ngàn (S) / nghìn (N)", en: "thousand" },
      ],
    },
  },
  {
    id: "grammar-numbers",
    intent: "grammar",
    triggers: ["numbers", "count", "how to count", "1 to 10"],
    keywords: ["number", "count"],
    response: {
      kind: "grammar",
      pattern: "1–10: một, hai, ba, bốn, năm, sáu, bảy, tám, chín, mười",
      explanation: "After 10, just chain: 'mười một' (11), 'hai mươi' (20), 'hai mươi mốt' (21 — note 'mốt' replaces 'một' in 21–91). 100 = một trăm. 1000 = một ngàn (S) / một nghìn (N). Prices in VND drop the trailing 'đồng' and use 'k' or 'ngàn' for thousand: '25k' = 25,000.",
      examples: [
        { vi: "hai mươi lăm ngàn", en: "twenty-five thousand (25,000 đồng)" },
        { vi: "mười lăm", en: "fifteen (note 'lăm' instead of 'năm')" },
        { vi: "ba trăm", en: "three hundred" },
      ],
    },
  },
  {
    id: "grammar-plural",
    intent: "grammar",
    triggers: ["plural", "plurals", "many in vietnamese", "những các"],
    keywords: ["plural", "nhung", "cac"],
    response: {
      kind: "grammar",
      pattern: "(những / các / nhiều) + [noun]",
      explanation: "Vietnamese nouns don't change form for plural. Add 'những' (some/those — definite-ish), 'các' (all of, formal), or 'nhiều' (many). Often context alone signals plural — no marker needed.",
      examples: [
        { vi: "các bạn", en: "everyone (lit. all friends)" },
        { vi: "những ngày đẹp", en: "(those) beautiful days" },
        { vi: "nhiều người", en: "many people" },
      ],
    },
  },
];

// ─── Culture ──────────────────────────────────────────────────────────────────

const CULTURE_ENTRIES: KnowledgeEntry[] = [
  {
    id: "culture-tipping",
    intent: "culture",
    triggers: ["tipping in vietnam", "do you tip in vietnam", "tip"],
    keywords: ["tipping", "tip", "vietnam"],
    response: {
      kind: "culture",
      topic: "Tipping in Vietnam",
      body:
        "Tipping is **not required** in Vietnam — service charges are usually included. That said:\n\n" +
        "- **Restaurants**: rounding up or leaving small change (5–10%) is appreciated, not expected.\n" +
        "- **Hotels / spa**: 20,000–50,000₫ for porters and housekeepers is generous.\n" +
        "- **Taxis / Grab**: round up to the nearest 5,000–10,000₫.\n" +
        "- **Street food**: never tip — would feel awkward.\n\n" +
        "If you do tip, hand it directly with a smile rather than leaving it on the table.",
    },
  },
  {
    id: "culture-family-pronouns",
    intent: "culture",
    triggers: ["family pronouns", "kinship terms", "how to address family"],
    keywords: ["family", "kinship", "pronoun"],
    response: {
      kind: "culture",
      topic: "Family-style pronouns",
      body:
        "Vietnamese uses **family terms as pronouns even with strangers**. The cab driver isn't 'sir' — he's 'anh' (older brother) or 'chú' (uncle), depending on age. The waitress is 'chị' or 'em', not 'miss'.\n\n" +
        "This isn't pretending to be related — it's a way of placing the relationship socially. Foreigners get a lot of slack here, but using the right pronoun is one of the fastest ways to sound natural and warm.",
    },
  },
  {
    id: "culture-dialect",
    intent: "culture",
    triggers: ["dialect overview", "regional differences", "what dialect"],
    keywords: ["dialect", "regional"],
    response: {
      kind: "culture",
      topic: "Vietnamese dialects in 90 seconds",
      body:
        "Three main regions: **Northern** (Hà Nội), **Central** (Huế), and **Southern** (Sài Gòn). All written language is the same — the differences are in pronunciation and a small set of vocabulary.\n\n" +
        "**Southern**: easier for learners — merges hỏi/ngã tones, softer consonants, fewer initial cluster distinctions. This app teaches Southern by default.\n\n" +
        "**Northern**: considered the 'standard' for media and formal contexts; preserves all 6 tones distinctly.\n\n" +
        "**Central** (especially Huế): the hardest for learners — distinct vowels and tones; even native speakers sometimes need a moment.",
    },
  },
  {
    id: "culture-food-etiquette",
    intent: "culture",
    triggers: ["food etiquette", "table manners", "how to eat", "chopstick rules"],
    keywords: ["etiquette", "manners", "chopstick", "food"],
    response: {
      kind: "culture",
      topic: "Eating with locals",
      body:
        "- **Wait for elders** to start eating first. A polite 'mời cả nhà ăn' (everyone please eat) goes a long way.\n" +
        "- **Don't stick chopsticks upright** in rice — it resembles incense at a funeral altar.\n" +
        "- **Pho is breakfast**: ordering pho at 8pm marks you as a tourist (it's still fine, just unusual).\n" +
        "- **Slurping noodles is OK**; talking with food in your mouth is not.\n" +
        "- **Pour drinks for others**, not yourself, especially with elders or hosts.",
    },
  },
  {
    id: "culture-age-pronoun",
    intent: "culture",
    triggers: ["asking age", "how old are you", "tuổi", "why ask my age"],
    keywords: ["age", "tuoi", "old"],
    response: {
      kind: "culture",
      topic: "Why everyone asks your age",
      body:
        "In Vietnamese culture, **age determines pronouns**, so locals will ask 'Bạn bao nhiêu tuổi?' (How old are you?) within the first few minutes of meeting you. It's not rude — it's necessary to address you correctly.\n\n" +
        "If you're roughly their age, they'll switch to 'bạn' (peer). Older → 'anh/chị'. Younger → 'em'. Just answer matter-of-factly: 'Tôi (số) tuổi' (I'm X years old).",
    },
  },
  {
    id: "culture-ordering",
    intent: "culture",
    triggers: ["ordering food", "how to order", "restaurant ordering", "calling waiter"],
    keywords: ["order", "ordering", "waiter", "restaurant"],
    response: {
      kind: "culture",
      topic: "Calling the waiter",
      body:
        "To get the waiter's attention, call **'Em ơi!'** (if young) or **'Anh ơi! / Chị ơi!'** (if older). 'Ơi' is the attention-getter — like 'Hey!' but warm, not rude.\n\n" +
        "When ordering: **'Cho tôi…'** (give me…) or **'Cho mình…'** (peer version). Add 'một ly' (one glass) or 'một tô' (one bowl) for liquids/soup. Tap water is **'nước lọc'**, hot tea is **'trà nóng'**, iced tea (free at most spots) is **'trà đá'**.",
    },
  },
];

// ─── Pronunciation ────────────────────────────────────────────────────────────

const PRONUNCIATION_ENTRIES: KnowledgeEntry[] = [
  {
    id: "pron-pho",
    intent: "pronunciation",
    triggers: ["pronounce phở", "how to pronounce pho"],
    keywords: ["pho", "phở", "pronounce"],
    response: {
      kind: "phrase",
      vi: "phở",
      en: "noodle soup",
      literal: "≈ 'fuh' with a dipping tone",
      whenToUse: "Closer to 'fuh' than 'foe'. The 'ph' is an English 'f'. The 'ơ' is a schwa-like vowel (like the 'u' in 'bun'). The hỏi tone dips down then rises slightly. 'Foh' or 'fo' will be understood but mark you as a tourist.",
    },
  },
  {
    id: "pron-nguyen",
    intent: "pronunciation",
    triggers: ["pronounce nguyễn", "how to pronounce nguyen"],
    keywords: ["nguyen", "nguyễn", "pronounce"],
    response: {
      kind: "phrase",
      vi: "Nguyễn",
      en: "(common Vietnamese family name)",
      literal: "≈ 'ngwee-en' with broken/dipping tone",
      whenToUse: "The 'ng' is a single sound (like the end of 'sing'), said at the START. So it's roughly 'ng' + 'win' fused: 'ngwin'. The Southern pronunciation merges the tone — it sounds like a single rising-dipping syllable. Most non-Vietnamese say 'win' or 'new-yen'; both are acceptable when speaking English.",
    },
  },
  {
    id: "pron-d-vs-d",
    intent: "pronunciation",
    triggers: ["d versus đ", "đ pronunciation", "d with bar", "d crossed"],
    keywords: ["d", "đ", "letter"],
    response: {
      kind: "grammar",
      pattern: "d / đ — two different letters!",
      explanation: "Without the bar: 'd' sounds like English 'y' in Southern, 'z' in Northern. With the bar 'đ' is English 'd'. So 'đi' (go) sounds like English 'dee', but 'da' (skin) sounds like 'ya' or 'za'.",
      examples: [
        { vi: "đi", en: "to go (English 'dee')" },
        { vi: "da", en: "skin (Southern: 'ya', Northern: 'za')" },
        { vi: "đẹp", en: "beautiful (English 'd')" },
      ],
    },
  },
];

// ─── Common vocabulary ────────────────────────────────────────────────────────
// Most-asked nouns/verbs that aren't in the curriculum yet. Authored as compact word cards.

type V = { vi: string; en: string; tone?: import("@/lib/game/tones").ToneId; note?: string };

const COMMON_VOCAB: V[] = [
  // Food
  { vi: "táo", en: "apple", tone: "sac" },
  { vi: "chuối", en: "banana", tone: "sac" },
  { vi: "cam", en: "orange", tone: "ngang" },
  { vi: "xoài", en: "mango", tone: "huyen" },
  { vi: "nước", en: "water", tone: "sac", note: "Also means 'country' depending on context — 'nước Mỹ' = America." },
  { vi: "cơm", en: "rice (cooked)", tone: "ngang" },
  { vi: "thịt", en: "meat", tone: "nang" },
  { vi: "cá", en: "fish", tone: "sac" },
  { vi: "gà", en: "chicken", tone: "huyen" },
  { vi: "bò", en: "beef / cow", tone: "huyen" },
  { vi: "bánh mì", en: "bread / Vietnamese sandwich" },
  { vi: "rau", en: "vegetable", tone: "ngang" },
  { vi: "trứng", en: "egg", tone: "sac" },
  { vi: "bia", en: "beer", tone: "ngang" },
  // Animals
  { vi: "chó", en: "dog", tone: "sac" },
  { vi: "mèo", en: "cat", tone: "huyen" },
  { vi: "chim", en: "bird", tone: "ngang" },
  { vi: "trâu", en: "water buffalo", tone: "ngang", note: "Bồ the mascot is a baby trâu!" },
  // Colors
  { vi: "đỏ", en: "red", tone: "hoi" },
  { vi: "xanh", en: "green / blue", tone: "ngang", note: "Vietnamese doesn't separate green and blue — both are 'xanh'. Add 'lá' (leaf) for green or 'da trời' (sky) for blue if needed." },
  { vi: "vàng", en: "yellow / gold", tone: "huyen" },
  { vi: "đen", en: "black", tone: "ngang" },
  { vi: "trắng", en: "white", tone: "sac" },
  // Time / days
  { vi: "hôm nay", en: "today" },
  { vi: "hôm qua", en: "yesterday" },
  { vi: "ngày mai", en: "tomorrow" },
  { vi: "bây giờ", en: "now" },
  // Verbs
  { vi: "ăn", en: "to eat", tone: "ngang" },
  { vi: "uống", en: "to drink", tone: "sac" },
  { vi: "đi", en: "to go", tone: "ngang" },
  { vi: "đến", en: "to come / arrive", tone: "sac" },
  { vi: "ngủ", en: "to sleep", tone: "hoi" },
  { vi: "học", en: "to study", tone: "nang" },
  { vi: "làm", en: "to do / make / work", tone: "huyen" },
  { vi: "yêu", en: "to love", tone: "ngang" },
  { vi: "thích", en: "to like", tone: "sac" },
  { vi: "biết", en: "to know", tone: "sac" },
  { vi: "hiểu", en: "to understand", tone: "hoi" },
  { vi: "muốn", en: "to want", tone: "sac" },
  // Adjectives
  { vi: "lớn", en: "big", tone: "sac" },
  { vi: "nhỏ", en: "small", tone: "hoi" },
  { vi: "tốt", en: "good", tone: "sac" },
  { vi: "xấu", en: "bad / ugly", tone: "sac" },
  { vi: "đẹp", en: "beautiful", tone: "nang" },
  { vi: "ngon", en: "delicious / tasty", tone: "ngang" },
  { vi: "nóng", en: "hot (temperature)", tone: "sac" },
  { vi: "lạnh", en: "cold", tone: "nang" },
  { vi: "vui", en: "happy / fun", tone: "ngang" },
  { vi: "buồn", en: "sad", tone: "huyen" },
];

const VOCAB_ENTRIES: KnowledgeEntry[] = COMMON_VOCAB.map((v) => ({
  id: `vocab-${v.vi.replace(/\s+/g, "-")}`,
  intent: "vocab" as const,
  triggers: [
    v.vi,
    v.en,
    `how do i say ${v.en}`,
    `${v.en} in vietnamese`,
    `what does ${v.vi} mean`,
  ],
  keywords: [v.vi, v.en, ...v.en.split(/[ /]+/).filter((w) => w.length >= 3)],
  response: {
    kind: "word",
    vi: v.vi,
    en: v.en,
    tone: v.tone,
    notes: v.note,
  },
}));

// ─── Compose all entries ──────────────────────────────────────────────────────

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  ...TONE_ENTRIES,
  ...PRONOUN_ENTRIES,
  ...GREETING_ENTRIES,
  ...PHRASE_ENTRIES,
  ...GRAMMAR_ENTRIES,
  ...CULTURE_ENTRIES,
  ...PRONUNCIATION_ENTRIES,
  ...VOCAB_ENTRIES,
];

// Topic chips for the empty state / fallback.
export const SUGGESTED_TOPICS: { label: string; query: string }[] = [
  { label: "How many tones?",            query: "how many tones in vietnamese" },
  { label: "How do I say hello?",        query: "how do I say hello" },
  { label: "How do I say thank you?",    query: "how do I say thank you" },
  { label: "Em vs anh",                  query: "difference between em and anh" },
  { label: "Past / future tense",        query: "past tense in vietnamese" },
  { label: "Numbers 1-10",               query: "numbers in vietnamese" },
  { label: "Tipping etiquette",          query: "tipping in vietnam" },
  { label: "Pronounce phở",              query: "pronounce phở" },
  { label: "Southern vs Northern",       query: "southern vs northern dialect" },
];

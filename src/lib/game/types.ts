import type { StatKey } from "./xp";
import type { ToneId } from "./tones";

export type ExerciseKind = "listen" | "translate" | "tone-match" | "speak" | "pair-match" | "fill-blank" | "story";

export type ExerciseBase = {
  id: string;
  kind: ExerciseKind;
  prompt: string;
  promptEnglish?: string;
  trainsStat: StatKey;
};

export type ListenExercise = ExerciseBase & {
  kind: "listen";
  audioText: string; // Vietnamese text to TTS
  options: string[];
  correct: number;
};

export type TranslateExercise = ExerciseBase & {
  kind: "translate";
  direction: "vi-to-en" | "en-to-vi";
  source: string;
  options: string[];
  correct: number;
};

export type ToneMatchExercise = ExerciseBase & {
  kind: "tone-match";
  baseSyllable: string;
  audioText: string;
  correctTone: ToneId;
};

export type SpeakExercise = ExerciseBase & {
  kind: "speak";
  targetText: string;
  targetTone: ToneId;
  audioText: string;
  dialectMerged?: boolean;
};

export type PairMatchExercise = ExerciseBase & {
  kind: "pair-match";
  pairs: { left: string; right: string; audioText?: string }[];
};

export type FillBlankExercise = ExerciseBase & {
  kind: "fill-blank";
  sentence: string; // use "___" to mark the blank
  options: string[];
  correct: number;
  audioText?: string; // full sentence to play (optional)
  englishHint?: string;
};

export type StoryLineNode = {
  id: string;
  kind: "line";
  speaker: string; // "narrator", "you", or a character name like "Mai"
  text: string;
  textEnglish?: string;
  audioText?: string;
  next: string;
};

export type StoryChoiceNode = {
  id: string;
  kind: "choice";
  prompt: string;
  promptEnglish?: string;
  options: {
    text: string;
    textEnglish?: string;
    correct: boolean;
    next: string;
  }[];
};

export type StoryEndNode = {
  id: string;
  kind: "end";
  text: string;
  textEnglish?: string;
};

export type StoryNode = StoryLineNode | StoryChoiceNode | StoryEndNode;

export type ShortStoryExercise = ExerciseBase & {
  kind: "story";
  startId: string;
  nodes: StoryNode[];
};

export type Exercise =
  | ListenExercise
  | TranslateExercise
  | ToneMatchExercise
  | SpeakExercise
  | PairMatchExercise
  | FillBlankExercise
  | ShortStoryExercise;

export type LessonTips = {
  vocab?: { word: string; meaning: string; audioText?: string; toneHint?: string }[];
  grammar?: { pattern: string; meaning: string; example?: string }[];
};

export type Lesson = {
  id: string;
  unitId: string;
  order: number;
  title: string;
  titleEnglish: string;
  exercises: Exercise[];
  xpReward: number;
  tips?: LessonTips;
};

export type Unit = {
  id: string;
  order: number;
  title: string;
  titleEnglish: string;
  theme: string;
  city: string;
  description: string;
  lessons: Lesson[];
};

export type City = {
  id: string;
  name: string;
  englishName: string;
  region: "south" | "central" | "north";
  position: { x: number; y: number };
  unitId: string;
};

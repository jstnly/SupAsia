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

export type Exercise = ListenExercise | TranslateExercise | ToneMatchExercise;

export type Lesson = {
  id: string;
  unitId: string;
  order: number;
  title: string;
  titleEnglish: string;
  exercises: Exercise[];
  xpReward: number;
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

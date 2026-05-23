import { phase1Topics } from "./topics-phase1";
import { phase2Topics } from "./topics-phase2";
import { phase3Topics } from "./topics-phase3";
import { phase4Topics } from "./topics-phase4";
import { phase5Topics } from "./topics-phase5";
import { phase6Topics } from "./topics-phase6";
import { phase7Topics } from "./topics-phase7";
import type { Topic } from "./types";

export const allTopics: Topic[] = [
  ...phase1Topics,
  ...phase2Topics,
  ...phase3Topics,
  ...phase4Topics,
  ...phase5Topics,
  ...phase6Topics,
  ...phase7Topics,
];

export const phaseLabels: Record<number, string> = {
  1: "Phase 1 · Foundations",
  2: "Phase 2 · Compute & Serverless Core",
  3: "Phase 3 · Integration & APIs",
  4: "Phase 4 · Security",
  5: "Phase 5 · Deployment & CI/CD",
  6: "Phase 6 · Containers, Caching, Edge",
  7: "Phase 7 · Observability",
};

export * from "./examInfo";
export * from "./types";

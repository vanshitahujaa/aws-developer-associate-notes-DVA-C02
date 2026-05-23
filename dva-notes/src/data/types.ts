export type Domain = "Development" | "Security" | "Deployment" | "Troubleshooting" | "Reference";

export interface KeyValue {
  k: string;
  v: string;
}

export interface CaseStudy {
  title: string;
  scenario: string;
  answer: string;
  why: string;
}

export interface PracticeQ {
  q: string;
  options: string[];
  correct: number | number[]; // index(es)
  explanation: string;
}

export interface TopicSection {
  heading: string;
  body?: string; // markdown-ish, simple paragraphs
  bullets?: string[];
  table?: { headers: string[]; rows: string[][] };
  code?: string;
}

export interface RootCause {
  symptom: string; // what you observe
  cause: string; // the >50% likely reason
}

export interface Topic {
  id: string;
  number: number;
  phase: number;
  title: string;
  domain: Domain;
  weight?: string;
  blurb: string;
  sections: TopicSection[];
  keyNumbers?: KeyValue[];
  howAsked?: string[];
  rootCauses?: RootCause[];
  cases: CaseStudy[];
  questions: PracticeQ[];
  gotchas: string[];
}

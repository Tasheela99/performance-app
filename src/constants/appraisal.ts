// ── Predefined goal categories ───────────────────────────────────────
export const GOAL_CATEGORIES = [
  'Technical Skills',
  'Soft Skills',
  'Leadership',
  'Communication',
  'Project Management',
  'Learning & Development',
  'Innovation',
  'Teamwork',
  'Customer Focus',
  'Other',
] as const;

// ── Period options ──────────────────────────────────────────────────
export const PERIOD_OPTIONS = [
  'Q1 2026',
  'Q2 2026',
  'Q3 2026',
  'Q4 2026',
  'H1 2026',
  'H2 2026',
  'Annual 2026',
] as const;

export type GoalCategory = typeof GOAL_CATEGORIES[number];
export type PeriodOption = typeof PERIOD_OPTIONS[number];
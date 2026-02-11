// ── Performance Sections and Weightages ────────────────────────────────
export const PERFORMANCE_SECTIONS = {
  TASKS: 'tasks',
  COMPETENCIES: 'competencies',
} as const;

export const SECTION_WEIGHTAGES = {
  [PERFORMANCE_SECTIONS.TASKS]: 80,
  [PERFORMANCE_SECTIONS.COMPETENCIES]: 20,
} as const;

// ── Performance Classifications ─────────────────────────────────────────
export const PERFORMANCE_CLASSIFICATIONS = {
  EXCEPTIONAL: { min: 101, max: Infinity, label: 'Exceptional', color: 'purple' },
  EXCELLENT: { min: 91, max: 100, label: 'Excellent', color: 'green' },
  VERY_GOOD: { min: 81, max: 90, label: 'Very Good', color: 'blue' },
  ABOVE_AVERAGE: { min: 75, max: 80, label: 'Above Average', color: 'teal' },
  AVERAGE: { min: 71, max: 75, label: 'Average', color: 'yellow' },
  SATISFACTORY: { min: 61, max: 70, label: 'Satisfactory', color: 'orange' },
  NEEDS_IMPROVEMENT: { min: 51, max: 60, label: 'Needs Improvement', color: 'red' },
  NEEDS_CRITICAL_IMPROVEMENT: { min: 0, max: 50, label: 'Needs Critical Improvement', color: 'red' },
} as const;

// ── Recognition Rules ───────────────────────────────────────────────────
export const RECOGNITION_RULES = {
  CONSECUTIVE_EXCELLENT_FOR_INCREMENT: 3,
  INCREMENTS_FOR_PRESIDENTIAL_AWARD: 3,
} as const;

// ── Predefined goal categories ───────────────────────────────────────────
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

// ── Period options ──────────────────────────────────────────────────────
export const PERIOD_OPTIONS = [
  'Q1 2026',
  'Q2 2026',
  'Q3 2026',
  'Q4 2026',
  'H1 2026',
  'H2 2026',
  'Annual 2026',
] as const;

// ── Helper functions ────────────────────────────────────────────────────
export const getPerformanceClassification = (score: number) => {
  for (const [key, classification] of Object.entries(PERFORMANCE_CLASSIFICATIONS)) {
    if (score >= classification.min && score <= classification.max) {
      return {
        key,
        ...classification,
      };
    }
  }
  return PERFORMANCE_CLASSIFICATIONS.NEEDS_CRITICAL_IMPROVEMENT;
};

export const calculateWeightedScore = (taskScore: number, competencyScore: number) => {
  return (
    (taskScore * SECTION_WEIGHTAGES.tasks) / 100 +
    (competencyScore * SECTION_WEIGHTAGES.competencies) / 100
  );
};

export type GoalCategory = typeof GOAL_CATEGORIES[number];
export type PeriodOption = typeof PERIOD_OPTIONS[number];
export type PerformanceSection = typeof PERFORMANCE_SECTIONS[keyof typeof PERFORMANCE_SECTIONS];
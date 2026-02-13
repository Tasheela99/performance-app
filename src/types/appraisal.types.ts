import { PerformanceSection } from '@/constants/appraisal';
import { User } from './auth.types';

/** Employee data for assignment purposes */
export interface AssignableEmployee {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'employee';
  department: string;
  position: string;
  createdAt: string;
}

/** Performance classification info */
export interface PerformanceClassification {
  key: string;
  min: number;
  max: number;
  label: string;
  color: string;
}

/** Officer performance tracking for recognition */
export interface OfficerPerformanceTracking {
  officerId: string;
  officer?: {
    id: string;
    name: string;
    email: string;
    department?: string;
    position?: string;
  };
  consecutiveExcellentYears: number;
  totalIncrements: number;
  eligibleForPresidentialAward: boolean;
  lastExcellentYear?: string;
}

/** Status of an appraisal template */
export type AppraisalStatus = 'draft' | 'published' | 'closed';

/** Status of an employee's submission against a template */
export type SubmissionStatus = 'pending' | 'inProgress' | 'submitted' | 'reviewed';

/** A single goal / KPI item within a template */
export interface AppraisalGoal {
  id: string;
  title: string;
  description: string;
  category: string;
  section: PerformanceSection; // 'tasks' or 'competencies'
  weightage: number; // percentage, e.g. 20 = 20%
}

/** The appraisal template created by admin/manager */
export interface AppraisalTemplate {
  id: string;
  title: string;
  description: string;
  period: string; // e.g. "Q1 2026", "Annual 2026"
  createdBy: string; // userId
  createdByName: string;
  createdByRole: 'admin' | 'manager';
  assignedTo: string[]; // employee userIds
  goals: AppraisalGoal[];
  status: AppraisalStatus;
  createdAt: string;
  deadline: string;
}

/** Employee's self-assessment response for one goal */
export interface GoalResponse {
  goalId: string;
  selfComment: string;
  attachments?: string[];
}

/** Employee's complete submission for one template */
export interface AppraisalSubmission {
  id: string;
  templateId: string;
  employeeId: string;
  employeeName: string;
  responses: GoalResponse[];
  overallComment: string;
  status: SubmissionStatus;
  submittedAt?: string;
}

/** Manager/admin review score for one goal */
export interface GoalReview {
  goalId: string;
  score: number; // 0-100
  comment: string;
}

/** Manager/admin review of a submission */
export interface AppraisalReview {
  id: string;
  submissionId: string;
  templateId: string;
  employeeId: string;
  employeeName: string;
  reviewerId: string;
  reviewerName: string;
  goalReviews: GoalReview[];
  taskScore: number; // Score for tasks section (0-100)
  competencyScore: number; // Score for competencies section (0-100)
  overallScore: number; // Weighted total score (0-100+)
  performanceClassification: PerformanceClassification;
  overallComment: string;
  reviewedAt: string;
}

/** Context type for appraisal state management */
export interface AppraisalContextType {
  templates: AppraisalTemplate[];
  submissions: AppraisalSubmission[];
  reviews: AppraisalReview[];
  employees: AssignableEmployee[];
  performanceTrackings: OfficerPerformanceTracking[];
  isLoading: boolean;
  isLoadingEmployees: boolean;
  isLoadingPerformance: boolean;
  lastRefreshTime: number;
  // Data refresh
  refreshData: () => Promise<void>;
  // Template operations (admin/manager)
  createTemplate: (template: Omit<AppraisalTemplate, 'id' | 'createdAt'>) => Promise<void>;
  updateTemplate: (id: string, updates: Partial<AppraisalTemplate>) => Promise<void>;
  assignEmployeesToTemplate: (templateId: string, employeeIds: string[]) => Promise<void>;
  publishTemplate: (id: string) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  // Submission operations (employee)
  saveSubmission: (submission: Omit<AppraisalSubmission, 'id'>) => Promise<AppraisalSubmission | undefined>;
  submitAppraisal: (submissionId: string) => Promise<void>;
  // Review operations (admin/manager)
  submitReview: (review: Omit<AppraisalReview, 'id' | 'reviewedAt'>) => Promise<void>;
  // Performance tracking operations (admin/manager)
  loadPerformanceTrackings: () => Promise<void>;
  getEligibleOfficers: (type: 'increment' | 'presidential_award') => Promise<OfficerPerformanceTracking[]>;
  // Employee operations
  loadEmployees: () => Promise<void>;
  // Queries
  getTemplatesForUser: (user: User) => AppraisalTemplate[];
  getSubmissionsForTemplate: (templateId: string) => AppraisalSubmission[];
  getSubmissionForEmployee: (templateId: string, employeeId: string) => AppraisalSubmission | undefined;
  getReviewForSubmission: (submissionId: string) => AppraisalReview | undefined;
}

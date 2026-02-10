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
  overallScore: number; // 0-100
  overallComment: string;
  reviewedAt: string;
}

/** Context type for appraisal state management */
export interface AppraisalContextType {
  templates: AppraisalTemplate[];
  submissions: AppraisalSubmission[];
  reviews: AppraisalReview[];
  employees: AssignableEmployee[];
  isLoading: boolean;
  isLoadingEmployees: boolean;
  // Template operations (admin/manager)
  createTemplate: (template: Omit<AppraisalTemplate, 'id' | 'createdAt'>) => void;
  updateTemplate: (id: string, updates: Partial<AppraisalTemplate>) => void;
  publishTemplate: (id: string) => void;
  deleteTemplate: (id: string) => void;
  // Submission operations (employee)
  saveSubmission: (submission: Omit<AppraisalSubmission, 'id'>) => void;
  submitAppraisal: (submissionId: string) => void;
  // Review operations (admin/manager)
  submitReview: (review: Omit<AppraisalReview, 'id' | 'reviewedAt'>) => void;
  // Employee operations
  loadEmployees: () => Promise<void>;
  // Queries
  getTemplatesForUser: (user: User) => AppraisalTemplate[];
  getSubmissionsForTemplate: (templateId: string) => AppraisalSubmission[];
  getSubmissionForEmployee: (templateId: string, employeeId: string) => AppraisalSubmission | undefined;
  getReviewForSubmission: (submissionId: string) => AppraisalReview | undefined;
}

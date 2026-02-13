import { PerformanceSection } from '@/constants/appraisal';
import { User } from './auth.types';

export interface AssignableEmployee {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'employee';
  department: string;
  position: string;
  createdAt: string;
}

export interface PerformanceClassification {
  key: string;
  min: number;
  max: number;
  label: string;
  color: string;
}

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

export type AppraisalStatus = 'draft' | 'published' | 'closed';

export type SubmissionStatus = 'pending' | 'inProgress' | 'submitted' | 'reviewed';

export interface AppraisalGoal {
  id: string;
  title: string;
  description: string;
  category: string;
  section: PerformanceSection;
  weightage: number;
}

export interface AppraisalTemplate {
  id: string;
  title: string;
  description: string;
  period: string;
  createdBy: string;
  createdByName: string;
  createdByRole: 'admin' | 'manager';
  assignedTo: string[];
  goals: AppraisalGoal[];
  status: AppraisalStatus;
  createdAt: string;
  deadline: string;
}

export interface GoalResponse {
  goalId: string;
  selfComment: string;
  attachments?: string[];
}

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

export interface GoalReview {
  goalId: string;
  score: number;
  comment: string;
}

export interface AppraisalReview {
  id: string;
  submissionId: string;
  templateId: string;
  employeeId: string;
  employeeName: string;
  reviewerId: string;
  reviewerName: string;
  goalReviews: GoalReview[];
  taskScore: number;
  competencyScore: number;
  overallScore: number;
  performanceClassification: PerformanceClassification;
  overallComment: string;
  reviewedAt: string;
}

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
  refreshData: () => Promise<void>;
  createTemplate: (template: Omit<AppraisalTemplate, 'id' | 'createdAt'>) => Promise<void>;
  updateTemplate: (id: string, updates: Partial<AppraisalTemplate>) => Promise<void>;
  assignEmployeesToTemplate: (templateId: string, employeeIds: string[]) => Promise<void>;
  publishTemplate: (id: string) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  saveSubmission: (submission: Omit<AppraisalSubmission, 'id'>) => Promise<AppraisalSubmission | undefined>;
  submitAppraisal: (submissionId: string) => Promise<void>;
  submitReview: (review: Omit<AppraisalReview, 'id' | 'reviewedAt'>) => Promise<void>;
  loadPerformanceTrackings: () => Promise<void>;
  getEligibleOfficers: (type: 'increment' | 'presidential_award') => Promise<OfficerPerformanceTracking[]>;
  loadEmployees: () => Promise<void>;
  getTemplatesForUser: (user: User) => AppraisalTemplate[];
  getSubmissionsForTemplate: (templateId: string) => AppraisalSubmission[];
  getSubmissionForEmployee: (templateId: string, employeeId: string) => AppraisalSubmission | undefined;
  getReviewForSubmission: (submissionId: string) => AppraisalReview | undefined;
}

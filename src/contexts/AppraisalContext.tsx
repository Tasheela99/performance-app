'use client';

import {
    AppraisalContextType,
    AppraisalReview,
    AppraisalSubmission,
    AppraisalTemplate,
    AssignableEmployee,
    OfficerPerformanceTracking,
} from '@/types/appraisal.types';
import { User } from '@/types/auth.types';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AppraisalContext = createContext<AppraisalContextType | undefined>(undefined);

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper function for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const response = await fetch(`/api/appraisals${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

// Helper function for employee API calls
const employeeApiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

export function AppraisalProvider({ children }: { children: React.ReactNode }) {
  const [templates, setTemplates] = useState<AppraisalTemplate[]>([]);
  const [submissions, setSubmissions] = useState<AppraisalSubmission[]>([]);
  const [reviews, setReviews] = useState<AppraisalReview[]>([]);
  const [employees, setEmployees] = useState<AssignableEmployee[]>([]);
  const [performanceTrackings, setPerformanceTrackings] = useState<OfficerPerformanceTracking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isLoadingPerformance, setIsLoadingPerformance] = useState(false);

  // Load data from APIs
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        // If no token, clear data and stop loading
        setTemplates([]);
        setSubmissions([]);
        setReviews([]);
        setIsLoading(false);
        return;
      }

      // Load templates, submissions, and reviews in parallel
      const [templatesData, submissionsData, reviewsData] = await Promise.all([
        apiCall('/templates'),
        apiCall('/submissions'),
        apiCall('/reviews')
      ]);

      setTemplates(templatesData.templates || []);
      setSubmissions(submissionsData.submissions || []);
      setReviews(reviewsData.reviews || []);
    } catch (error) {
      console.error('Failed to load appraisal data:', error);
      // Reset data on error
      setTemplates([]);
      setSubmissions([]);
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load employees from API
  const loadEmployees = useCallback(async () => {
    try {
      setIsLoadingEmployees(true);
      const token = getAuthToken();
      
      if (!token) {
        // If no token, clear employees and stop loading
        setEmployees([]);
        setIsLoadingEmployees(false);
        return;
      }

      const employeesData = await employeeApiCall('/employees');
      setEmployees(employeesData.employees || []);
    } catch (error) {
      console.error('Failed to load employees:', error);
      // Reset employees on error
      setEmployees([]);
    } finally {
      setIsLoadingEmployees(false);
    }
  }, []);

  // Load data on mount and when token changes
  useEffect(() => {
    loadData();
    
    // Listen for storage changes to reload data when token changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadData]);

  // ── Template operations (admin / manager) ────────────────────────
  const createTemplate = useCallback(
    async (template: Omit<AppraisalTemplate, 'id' | 'createdAt'>) => {
      try {
        const data = await apiCall('/templates', {
          method: 'POST',
          body: JSON.stringify(template),
        });
        
        // Add the new template to state
        setTemplates(prev => [data.template, ...prev]);
        return data.template;
      } catch (error) {
        console.error('Failed to create template:', error);
        throw error;
      }
    },
    [],
  );

  const updateTemplate = useCallback(
    async (id: string, updates: Partial<AppraisalTemplate>) => {
      try {
        const data = await apiCall(`/templates/${id}`, {
          method: 'PUT',
          body: JSON.stringify(updates),
        });

        // Update the template in state
        setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
        
        // Reload data to ensure consistency
        loadData();
        return data.template;
      } catch (error) {
        console.error('Failed to update template:', error);
        throw error;
      }
    },
    [loadData],
  );

  const publishTemplate = useCallback(
    async (id: string) => {
      try {
        await apiCall(`/templates/${id}/publish`, {
          method: 'POST',
        });

        // Update template status in state
        setTemplates(prev => prev.map(t => 
          t.id === id ? { ...t, status: 'published' as any } : t
        ));
        
        // Reload data to get new submissions
        loadData();
      } catch (error) {
        console.error('Failed to publish template:', error);
        throw error;
      }
    },
    [loadData],
  );

  const deleteTemplate = useCallback(
    async (id: string) => {
      try {
        await apiCall(`/templates/${id}`, {
          method: 'DELETE',
        });

        // Remove template from state
        setTemplates(prev => prev.filter(t => t.id !== id));
      } catch (error) {
        console.error('Failed to delete template:', error);
        throw error;
      }
    },
    [],
  );

  // ── Submission operations (employee) ─────────────────────────────
  const saveSubmission = useCallback(
    async (submission: Omit<AppraisalSubmission, 'id'>) => {
      try {
        // Find existing submission by templateId and employeeId
        const existingSubmission = submissions.find(s => 
          s.templateId === submission.templateId && 
          s.employeeId === submission.employeeId
        );

        if (existingSubmission) {
          // Update existing submission
          const data = await apiCall(`/submissions/${existingSubmission.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              responses: submission.responses,
              overallComment: submission.overallComment,
            }),
          });

          // Update submission in state
          setSubmissions(prev => prev.map(s => 
            s.id === existingSubmission.id 
              ? { ...s, responses: submission.responses, overallComment: submission.overallComment }
              : s
          ));
          
          return { ...existingSubmission, ...submission };
        } else {
          // This shouldn't happen as submissions are created when templates are published
          console.warn('Submission not found for template:', submission.templateId);
          // Reload data to ensure we have the latest submissions
          await loadData();
          throw new Error('Submission not found. Please refresh the page.');
        }
      } catch (error) {
        console.error('Failed to save submission:', error);
        throw error;
      }
    },
    [submissions, loadData],
  );

  const submitAppraisal = useCallback(
    async (submissionId: string) => {
      try {
        await apiCall(`/submissions/${submissionId}/submit`, {
          method: 'POST',
        });

        // Update submission status in state
        setSubmissions(prev => prev.map(s => 
          s.id === submissionId 
            ? { ...s, status: 'submitted' as any, submittedAt: new Date().toISOString() }
            : s
        ));
        
        // Reload data to ensure consistency across all views
        await loadData();
      } catch (error) {
        console.error('Failed to submit appraisal:', error);
        throw error;
      }
    },
    [loadData],
  );

  // ── Review operations (admin/manager) ────────────────────────────
  const submitReview = useCallback(
    async (review: Omit<AppraisalReview, 'id' | 'reviewedAt'>) => {
      try {
        const data = await apiCall('/reviews', {
          method: 'POST',
          body: JSON.stringify({
            submissionId: review.submissionId,
            goalReviews: review.goalReviews,
            overallComment: review.overallComment,
          }),
        });

        // Add review to state
        setReviews(prev => [data.review, ...prev]);
        
        // Update submission status
        setSubmissions(prev => prev.map(s => 
          s.id === review.submissionId 
            ? { ...s, status: 'reviewed' as any }
            : s
        ));

        return data.review;
      } catch (error) {
        console.error('Failed to submit review:', error);
        throw error;
      }
    },
    [],
  );

  // ── Performance tracking operations (admin/manager) ─────────────
  const loadPerformanceTrackings = useCallback(async () => {
    try {
      setIsLoadingPerformance(true);
      const token = getAuthToken();
      
      if (!token) {
        setPerformanceTrackings([]);
        setIsLoadingPerformance(false);
        return;
      }

      const data = await employeeApiCall('/officers/performance');
      setPerformanceTrackings(data.performanceTrackings || []);
    } catch (error) {
      console.error('Failed to load performance trackings:', error);
      setPerformanceTrackings([]);
    } finally {
      setIsLoadingPerformance(false);
    }
  }, []);

  const getEligibleOfficers = useCallback(async (type: 'increment' | 'presidential_award') => {
    try {
      const data = await employeeApiCall('/officers/performance', {
        method: 'POST',
        body: JSON.stringify({ type }),
      });
      return data.eligibleOfficers || [];
    } catch (error) {
      console.error('Failed to get eligible officers:', error);
      return [];
    }
  }, []);

  // ── Query helpers ─────────────────────────────────────────────────
  const getTemplatesForUser = useCallback(
    (user: User): AppraisalTemplate[] => {
      if (user.role === 'admin' || user.role === 'manager') {
        // Admin and Manager can see all templates (draft, published, closed)
        return templates;
      } else {
        // Employee can only see PUBLISHED templates assigned to them
        return templates.filter((t) => 
          t.assignedTo.includes(user.id) && t.status === 'published'
        );
      }
    },
    [templates],
  );

  const getSubmissionsForTemplate = useCallback(
    (templateId: string): AppraisalSubmission[] => {
      return submissions.filter((s) => s.templateId === templateId);
    },
    [submissions],
  );

  const getSubmissionForEmployee = useCallback(
    (templateId: string, employeeId: string): AppraisalSubmission | undefined => {
      return submissions.find((s) => s.templateId === templateId && s.employeeId === employeeId);
    },
    [submissions],
  );

  const getReviewForSubmission = useCallback(
    (submissionId: string): AppraisalReview | undefined => {
      return reviews.find((r) => r.submissionId === submissionId);
    },
    [reviews],
  );

  // Context value
  const contextValue = useMemo(
    (): AppraisalContextType => ({
      templates,
      submissions,
      reviews,
      employees,
      performanceTrackings,
      isLoading,
      isLoadingEmployees,
      isLoadingPerformance,
      createTemplate,
      updateTemplate,
      publishTemplate,
      deleteTemplate,
      saveSubmission,
      submitAppraisal,
      submitReview,
      loadPerformanceTrackings,
      getEligibleOfficers,
      loadEmployees,
      getTemplatesForUser,
      getSubmissionsForTemplate,
      getSubmissionForEmployee,
      getReviewForSubmission,
    }),
    [
      templates,
      submissions,
      reviews,
      employees,
      performanceTrackings,
      isLoading,
      isLoadingEmployees,
      isLoadingPerformance,
      createTemplate,
      updateTemplate,
      publishTemplate,
      deleteTemplate,
      saveSubmission,
      submitAppraisal,
      submitReview,
      loadPerformanceTrackings,
      getEligibleOfficers,
      loadEmployees,
      getTemplatesForUser,
      getSubmissionsForTemplate,
      getSubmissionForEmployee,
      getReviewForSubmission,
    ],
  );

  return <AppraisalContext.Provider value={contextValue}>{children}</AppraisalContext.Provider>;
}

export function useAppraisal() {
  const context = useContext(AppraisalContext);
  if (context === undefined) {
    throw new Error('useAppraisal must be used within an AppraisalProvider');
  }
  return context;
}

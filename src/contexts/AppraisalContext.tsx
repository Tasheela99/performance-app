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

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

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
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        setTemplates([]);
        setSubmissions([]);
        setReviews([]);
        setIsLoading(false);
        return;
      }

      const [templatesData, submissionsData, reviewsData] = await Promise.all([
        apiCall('/templates'),
        apiCall('/submissions'),
        apiCall('/reviews')
      ]);

      setTemplates(templatesData.templates || []);
      setSubmissions(submissionsData.submissions || []);
      setReviews(reviewsData.reviews || []);
      setLastRefreshTime(Date.now());
    } catch (error) {
      console.error('Failed to load appraisal data:', error);

      setTemplates([]);
      setSubmissions([]);
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadEmployees = useCallback(async () => {
    try {
      setIsLoadingEmployees(true);
      const token = getAuthToken();
      
      if (!token) {
        setEmployees([]);
        setIsLoadingEmployees(false);
        return;
      }

      const employeesData = await employeeApiCall('/employees');
      setEmployees(employeesData.employees || []);
    } catch (error) {
      console.error('Failed to load employees:', error);
      setEmployees([]);
    } finally {
      setIsLoadingEmployees(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    console.log('Manually refreshing appraisal data...');
    await loadData();
  }, [loadData]);

  useEffect(() => {
    loadData();
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadData]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : null;
    if (user?.role === 'employee') {
      console.log('Setting up auto-refresh for employee...');
      const interval = setInterval(() => {
        console.log('Auto-refreshing data for employee...');
        loadData();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [loadData]);

  const createTemplate = useCallback(
    async (template: Omit<AppraisalTemplate, 'id' | 'createdAt'>) => {
      try {
        const data = await apiCall('/templates', {
          method: 'POST',
          body: JSON.stringify(template),
        });
        
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

        setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
        
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

        setTemplates(prev => prev.map(t => 
          t.id === id ? { ...t, status: 'published' as any } : t
        ));
        
        await loadData();
        
        setTimeout(() => {
          console.log('Secondary refresh after template publish...');
          loadData();
        }, 1000);
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

        setTemplates(prev => prev.filter(t => t.id !== id));
      } catch (error) {
        console.error('Failed to delete template:', error);
        throw error;
      }
    },
    [],
  );
  const assignEmployeesToTemplate = useCallback(
    async (templateId: string, employeeIds: string[]) => {
      try {
        await apiCall(`/templates/${templateId}`, {
          method: 'PUT',
          body: JSON.stringify({ assignedTo: employeeIds }),
        });

        setTemplates(prev => prev.map(t => 
          t.id === templateId ? { ...t, assignedTo: employeeIds } : t
        ));
        
        await loadData();
      } catch (error) {
        console.error('Failed to assign employees:', error);
        throw error;
      }
    },
    [loadData],
  );

  const saveSubmission = useCallback(
    async (submission: Omit<AppraisalSubmission, 'id'>) => {
      try {
        let existingSubmission = submissions.find(s => 
          s.templateId === submission.templateId && 
          s.employeeId === submission.employeeId
        );

        if (existingSubmission) {
          const data = await apiCall(`/submissions/${existingSubmission.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              responses: submission.responses,
              overallComment: submission.overallComment,
            }),
          });

          setSubmissions(prev => prev.map(s => 
            s.id === existingSubmission.id 
              ? { ...s, responses: submission.responses, overallComment: submission.overallComment }
              : s
          ));

          return existingSubmission;
        } else {
          console.log('Creating new submission for template:', submission.templateId);
          
          const data = await apiCall('/submissions', {
            method: 'POST',
            body: JSON.stringify({
              templateId: submission.templateId,
              employeeId: submission.employeeId,
              employeeName: submission.employeeName,
              responses: submission.responses,
              overallComment: submission.overallComment,
              status: submission.status,
            }),
          });

          const newSubmission = data.submission;
          setSubmissions(prev => [...prev, newSubmission]);
          
          return newSubmission;
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

        setSubmissions(prev => prev.map(s => 
          s.id === submissionId 
            ? { ...s, status: 'submitted' as any, submittedAt: new Date().toISOString() }
            : s
        ));
        
        await loadData();
      } catch (error) {
        console.error('Failed to submit appraisal:', error);
        throw error;
      }
    },
    [loadData],
  );

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

        setReviews(prev => [data.review, ...prev]);
        
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

  const getTemplatesForUser = useCallback(
    (user: User): AppraisalTemplate[] => {
      if (user.role === 'admin' || user.role === 'manager') {
        return templates;
      } else {
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

  const contextValue = useMemo(
    (): AppraisalContextType => ({
      templates,
      submissions,
      reviews,
      employees,
      performanceTrackings,
      isLoading,
      isLoadingEmployees,
      isLoadingPerformance,      lastRefreshTime,
      refreshData,      createTemplate,
      updateTemplate,
      assignEmployeesToTemplate,
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
      lastRefreshTime,
      refreshData,
      createTemplate,
      updateTemplate,
      assignEmployeesToTemplate,
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

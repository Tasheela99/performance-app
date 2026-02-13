'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAppraisal } from '@/contexts/AppraisalContext';
import { useAuth } from '@/contexts/AuthContext';
import { GoalResponse } from '@/types/appraisal.types';
import {
    faArrowLeft,
    faCalendar,
    faCheckCircle,
    faClock,
    faFloppyDisk,
    faPaperPlane,
    faStar,
    faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function FillAppraisalPage() {
  const { user } = useAuth();
  const { templates, getSubmissionForEmployee, getReviewForSubmission, saveSubmission, submitAppraisal, refreshData } =
    useAppraisal();
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;

  const template = templates.find((t) => t.id === templateId);
  const existingSubmission = user ? getSubmissionForEmployee(templateId, user.id) : undefined;
  const review = existingSubmission ? getReviewForSubmission(existingSubmission.id) : undefined;

  const [responses, setResponses] = useState<GoalResponse[]>([]);
  const [overallComment, setOverallComment] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const isReadOnly = existingSubmission?.status === 'submitted' || existingSubmission?.status === 'reviewed';

  useEffect(() => {
    if (template) {
      if (existingSubmission) {
        setResponses(
          template.goals.map((g) => {
            const existing = existingSubmission.responses.find((r) => r.goalId === g.id);
            return existing || { goalId: g.id, selfComment: '' };
          }),
        );
        setOverallComment(existingSubmission.overallComment || '');
      } else {
        setResponses(template.goals.map((g) => ({ goalId: g.id, selfComment: '' })));
      }
    }
  }, [template, existingSubmission]);

  useEffect(() => {
    if (user && templateId && !template) {
      console.log('Template not found, refreshing data...');
      refreshData();
    }
  }, [user, templateId, template, refreshData]);

  if (!user || !template) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Appraisal not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard/my-appraisals')}>
          Back to My Appraisals
        </Button>
      </div>
    );
  }

  const updateResponse = (goalId: string, comment: string) => {
    setResponses((prev) => prev.map((r) => (r.goalId === goalId ? { ...r, selfComment: comment } : r)));
  };

  const completedCount = responses.filter((r) => r.selfComment.trim().length > 0).length;
  const progress = Math.round((completedCount / template.goals.length) * 100);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSubmission({
        templateId,
        employeeId: user.id,
        employeeName: user.name,
        responses,
        overallComment,
        status: 'inProgress',
      });
      setSavedMsg('Draft saved successfully!');
      setTimeout(() => setSavedMsg(''), 3000);
    } catch (error) {
      console.error('Failed to save draft:', error);
      alert('Failed to save draft. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const savedSubmission = await saveSubmission({
        templateId,
        employeeId: user.id,
        employeeName: user.name,
        responses,
        overallComment,
        status: 'inProgress',
      });
      
      const submissionId = savedSubmission?.id || existingSubmission?.id;
      if (!submissionId) {
        throw new Error('Unable to create or find submission');
      }
      
      await submitAppraisal(submissionId);
      
      setShowSubmitConfirm(false);
      router.push('/dashboard/my-appraisals');
    } catch (error: any) {
      console.error('Failed to submit appraisal:', error);
      alert(error.message || 'Failed to submit appraisal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-9xl mx-auto">
      <button
        onClick={() => router.push('/dashboard/my-appraisals')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition"
      >
        <FontAwesomeIcon icon={faArrowLeft} /> Back to My Appraisals
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{template.title}</h1>
        <p className="text-gray-500 text-sm">{template.description}</p>
        <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <FontAwesomeIcon icon={faCalendar} className="text-purple-500" />
            Period: {template.period}
          </span>
          <span className="flex items-center gap-1">
            <FontAwesomeIcon icon={faClock} className="text-orange-500" />
            Deadline: {new Date(template.deadline).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <FontAwesomeIcon icon={faUser} className="text-blue-500" />
            Assigned by: {template.createdByName}
          </span>
        </div>
      </div>

      <Card className="!p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Your Progress</span>
          <span className="text-sm font-bold text-purple-700">{completedCount}/{template.goals.length} goals</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-purple-500 to-purple-700 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </Card>

      {review && (
        <Card className="!p-5 mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faStar} className="text-white text-2xl" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800">Review Complete</p>
              <p className="text-3xl font-bold text-green-700">{review.overallScore}%</p>
              <p className="text-xs text-green-600 mt-1">{review.overallComment}</p>
            </div>
            <p className="text-xs text-green-500">Reviewed by {review.reviewerName}</p>
          </div>
        </Card>
      )}

      <div className="space-y-5 mb-8">
        {template.goals.map((goal, idx) => {
          const response = responses.find((r) => r.goalId === goal.id);
          const goalReview = review?.goalReviews.find((gr) => gr.goalId === goal.id);

          return (
            <Card key={goal.id} className="!p-0 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 px-5 py-4 border-b">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-sm">{goal.title}</h3>
                    <p className="text-gray-500 text-xs mt-1">{goal.description}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                        {goal.category}
                      </span>
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        Weight: {goal.weightage}%
                      </span>
                    </div>
                  </div>
                  {response && response.selfComment.trim() && (
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                  )}
                </div>
              </div>

              <div className="p-5">
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  Your Self-Assessment
                </label>
                {isReadOnly ? (
                  <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                    {response?.selfComment || <span className="text-gray-400 italic">No response provided</span>}
                  </div>
                ) : (
                  <textarea
                    value={response?.selfComment || ''}
                    onChange={(e) => updateResponse(goal.id, e.target.value)}
                    rows={3}
                    placeholder="Describe what you achieved for this goal, what steps you took, and any evidence of your progress..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                  />
                )}

                {goalReview && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-green-800">Manager's Review</span>
                      <span className={`text-sm font-bold ${goalReview.score >= 80 ? 'text-green-600' : goalReview.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {goalReview.score}%
                      </span>
                    </div>
                    <p className="text-xs text-green-700">{goalReview.comment}</p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="!p-5 mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Overall Comments
        </label>
        {isReadOnly ? (
          <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
            {overallComment || <span className="text-gray-400 italic">No overall comment</span>}
          </div>
        ) : (
          <textarea
            value={overallComment}
            onChange={(e) => setOverallComment(e.target.value)}
            rows={3}
            placeholder="Share any additional thoughts about your overall performance this period..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
          />
        )}
      </Card>

      {!isReadOnly && (
        <div className="flex items-center justify-between">
          <div>
            {savedMsg && (
              <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                <FontAwesomeIcon icon={faCheckCircle} /> {savedMsg}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              icon={faFloppyDisk}
              onClick={handleSave}
              isLoading={isSaving}
            >
              Save Draft
            </Button>
            <Button
              icon={faPaperPlane}
              onClick={() => setShowSubmitConfirm(true)}
              disabled={completedCount < template.goals.length || !overallComment.trim()}
            >
              Submit Appraisal
            </Button>
          </div>
        </div>
      )}

      {showSubmitConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="max-w-md w-full text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faPaperPlane} className="text-purple-600 text-2xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Submit Appraisal?</h3>
              <p className="text-sm text-gray-500">
                Once submitted, you won&apos;t be able to edit your responses. Your manager will review and score your appraisal.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => setShowSubmitConfirm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} isLoading={isSubmitting} icon={faPaperPlane}>
                Confirm Submit
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

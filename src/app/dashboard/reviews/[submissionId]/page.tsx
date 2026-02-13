'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { getPerformanceClassification, PERFORMANCE_SECTIONS, SECTION_WEIGHTAGES } from '@/constants/appraisal';
import { useAppraisal } from '@/contexts/AppraisalContext';
import { useAuth } from '@/contexts/AuthContext';
import { GoalReview } from '@/types/appraisal.types';
import {
    faArrowLeft,
    faCheckCircle,
    faClipboardList,
    faCogs,
    faStar,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export default function ReviewSubmissionPage() {
  const { user } = useAuth();
  const { submissions, templates, getReviewForSubmission, submitReview } = useAppraisal();
  const router = useRouter();
  const params = useParams();
  const submissionId = params.submissionId as string;

  const submission = submissions.find((s) => s.id === submissionId);
  const template = submission ? templates.find((t) => t.id === submission.templateId) : undefined;
  const existingReview = submission ? getReviewForSubmission(submission.id) : undefined;

  const [goalReviews, setGoalReviews] = useState<GoalReview[]>([]);
  const [overallComment, setOverallComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isReadOnly = !!existingReview;

  useEffect(() => {
    if (template && submission) {
      if (existingReview) {
        setGoalReviews(existingReview.goalReviews);
        setOverallComment(existingReview.overallComment);
      } else {
        setGoalReviews(template.goals.map((g) => ({ goalId: g.id, score: 0, comment: '' })));
      }
    }
  }, [template, submission, existingReview]);

  const { taskScore, competencyScore, overallScore, classification } = useMemo(() => {
    if (!template || goalReviews.length === 0) {
      return { taskScore: 0, competencyScore: 0, overallScore: 0, classification: getPerformanceClassification(0) };
    }

    const taskGoals = template.goals.filter(g => g.section === PERFORMANCE_SECTIONS.TASKS);
    const competencyGoals = template.goals.filter(g => g.section === PERFORMANCE_SECTIONS.COMPETENCIES);

    let taskWeightedSum = 0;
    let totalTaskWeightage = 0;
    taskGoals.forEach((goal) => {
      const gr = goalReviews.find((r) => r.goalId === goal.id);
      if (gr) {
        taskWeightedSum += gr.score * goal.weightage;
        totalTaskWeightage += goal.weightage;
      }
    });
    const calcTaskScore = totalTaskWeightage > 0 ? taskWeightedSum / totalTaskWeightage : 0;

    let compWeightedSum = 0;
    let totalCompWeightage = 0;
    competencyGoals.forEach((goal) => {
      const gr = goalReviews.find((r) => r.goalId === goal.id);
      if (gr) {
        compWeightedSum += gr.score * goal.weightage;
        totalCompWeightage += goal.weightage;
      }
    });
    const calcCompScore = totalCompWeightage > 0 ? compWeightedSum / totalCompWeightage : 0;

    const calcOverall = Math.round(
      (calcTaskScore * SECTION_WEIGHTAGES.tasks) / 100 +
      (calcCompScore * SECTION_WEIGHTAGES.competencies) / 100
    );

    return {
      taskScore: Math.round(calcTaskScore),
      competencyScore: Math.round(calcCompScore),
      overallScore: calcOverall,
      classification: getPerformanceClassification(calcOverall),
    };
  }, [goalReviews, template]);

  if (!user || !submission || !template) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Submission not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard/reviews')}>
          Back to Reviews
        </Button>
      </div>
    );
  }

  const updateGoalReview = (goalId: string, field: 'score' | 'comment', value: string | number) => {
    setGoalReviews((prev) =>
      prev.map((r) => (r.goalId === goalId ? { ...r, [field]: value } : r)),
    );
  };

  const canSubmit =
    goalReviews.every((r) => r.score > 0 && r.comment.trim().length > 0) &&
    overallComment.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      await submitReview({
        submissionId: submission.id,
        templateId: template.id,
        employeeId: submission.employeeId,
        employeeName: submission.employeeName,
        reviewerId: user.id,
        reviewerName: user.name,
        goalReviews,
        taskScore,
        competencyScore,
        overallScore,
        performanceClassification: {
          key: classification.key,
          min: classification.min,
          max: classification.max,
          label: classification.label,
          color: classification.color,
        },
        overallComment,
      });
      router.push('/dashboard/reviews');
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      alert(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score > 0) return 'text-red-600';
    return 'text-gray-400';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score > 0) return 'bg-red-500';
    return 'bg-gray-200';
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <button
        onClick={() => router.push('/dashboard/reviews')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition"
      >
        <FontAwesomeIcon icon={faArrowLeft} /> Back to Reviews
      </button>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {isReadOnly ? 'Review Summary' : 'Review Submission'}
          </h1>
          <p className="text-gray-500 text-sm">{template.title}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">
            {submission.employeeName
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{submission.employeeName}</p>
            <p className="text-xs text-gray-500">
              Submitted: {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <Card className="!p-5 mb-6 bg-gradient-to-r from-purple-50 to-purple-100/50 border-2 border-purple-200">
        <div className="flex items-center gap-3 mb-4">
          <FontAwesomeIcon icon={faStar} className="text-purple-600 text-xl" />
          <div>
            <p className="text-sm font-semibold text-purple-800">Performance Score Breakdown</p>
            <p className="text-xs text-purple-600">Tasks (80%) + Competencies (20%) = Overall Score</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/80 rounded-xl p-3 text-center border border-purple-100">
            <div className="flex items-center justify-center gap-1 mb-1">
              <FontAwesomeIcon icon={faClipboardList} className="text-blue-500 text-xs" />
              <p className="text-xs font-medium text-gray-600">Tasks (80%)</p>
            </div>
            <p className={`text-2xl font-bold ${getScoreColor(taskScore)}`}>{taskScore}%</p>
          </div>

          <div className="bg-white/80 rounded-xl p-3 text-center border border-purple-100">
            <div className="flex items-center justify-center gap-1 mb-1">
              <FontAwesomeIcon icon={faCogs} className="text-green-500 text-xs" />
              <p className="text-xs font-medium text-gray-600">Competencies (20%)</p>
            </div>
            <p className={`text-2xl font-bold ${getScoreColor(competencyScore)}`}>{competencyScore}%</p>
          </div>

          <div className="bg-white/80 rounded-xl p-3 text-center border border-purple-200">
            <p className="text-xs font-medium text-gray-600 mb-1">Overall</p>
            <p className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}%</p>
            {overallScore > 0 && (
              <ClassificationBadge color={classification.color} label={classification.label} />
            )}
          </div>
        </div>
      </Card>

      <div className="space-y-5 mb-8">
        {template.goals.some(g => g.section === PERFORMANCE_SECTIONS.TASKS) && (
          <div className="flex items-center gap-2 pt-2">
            <FontAwesomeIcon icon={faClipboardList} className="text-blue-500" />
            <h2 className="text-sm font-bold text-gray-700">Tasks Section</h2>
            <span className="text-xs text-gray-400">(80% of overall score)</span>
          </div>
        )}
        {template.goals.filter(g => g.section === PERFORMANCE_SECTIONS.TASKS).map((goal, idx) => {
          const response = submission.responses.find((r) => r.goalId === goal.id);
          const goalReview = goalReviews.find((r) => r.goalId === goal.id);
          const score = goalReview?.score || 0;

          return (
            <GoalReviewCard
              key={goal.id}
              goal={goal}
              index={idx}
              response={response}
              goalReview={goalReview}
              score={score}
              isReadOnly={isReadOnly}
              getScoreColor={getScoreColor}
              getScoreBarColor={getScoreBarColor}
              updateGoalReview={updateGoalReview}
            />
          );
        })}

        {template.goals.some(g => g.section === PERFORMANCE_SECTIONS.COMPETENCIES) && (
          <div className="flex items-center gap-2 pt-4">
            <FontAwesomeIcon icon={faCogs} className="text-green-500" />
            <h2 className="text-sm font-bold text-gray-700">Competencies Section</h2>
            <span className="text-xs text-gray-400">(20% of overall score)</span>
          </div>
        )}
        {template.goals.filter(g => g.section === PERFORMANCE_SECTIONS.COMPETENCIES).map((goal, idx) => {
          const response = submission.responses.find((r) => r.goalId === goal.id);
          const goalReview = goalReviews.find((r) => r.goalId === goal.id);
          const score = goalReview?.score || 0;

          return (
            <GoalReviewCard
              key={goal.id}
              goal={goal}
              index={idx}
              response={response}
              goalReview={goalReview}
              score={score}
              isReadOnly={isReadOnly}
              getScoreColor={getScoreColor}
              getScoreBarColor={getScoreBarColor}
              updateGoalReview={updateGoalReview}
            />
          );
        })}
      </div>

      <Card className="!p-5 mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Overall Review Comment
        </label>
        {isReadOnly ? (
          <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
            {overallComment}
          </div>
        ) : (
          <textarea
            value={overallComment}
            onChange={(e) => setOverallComment(e.target.value)}
            rows={3}
            placeholder="Provide an overall summary of the employee's performance..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
          />
        )}
      </Card>

      {!isReadOnly && (
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={() => router.push('/dashboard/reviews')}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={!canSubmit}
            icon={faCheckCircle}
          >
            Submit Review ({overallScore}% — {classification.label})
          </Button>
        </div>
      )}
    </div>
  );
}

function GoalReviewCard({
  goal,
  index,
  response,
  goalReview,
  score,
  isReadOnly,
  getScoreColor,
  getScoreBarColor,
  updateGoalReview,
}: {
  goal: { id: string; title: string; description: string; category: string; section: string; weightage: number };
  index: number;
  response: { selfComment: string } | undefined;
  goalReview: GoalReview | undefined;
  score: number;
  isReadOnly: boolean;
  getScoreColor: (score: number) => string;
  getScoreBarColor: (score: number) => string;
  updateGoalReview: (goalId: string, field: 'score' | 'comment', value: string | number) => void;
}) {
  return (
    <Card className="!p-0 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 px-5 py-4 border-b">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">
              {index + 1}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">{goal.title}</h3>
              <p className="text-gray-500 text-xs mt-1">{goal.description}</p>
              <div className="flex gap-2 mt-2">
                <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                  {goal.category}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  goal.section === PERFORMANCE_SECTIONS.TASKS
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {goal.section === PERFORMANCE_SECTIONS.TASKS ? 'Tasks (80%)' : 'Competencies (20%)'}
                </span>
                <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                  Weight: {goal.weightage}%
                </span>
              </div>
            </div>
          </div>
          <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
            {score > 0 ? `${score}%` : '—'}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Employee&apos;s Self-Assessment</label>
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-gray-700">
            {response?.selfComment || <span className="text-gray-400 italic">No response provided</span>}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 mb-2 block">
            Score (0-100)
          </label>
          {isReadOnly ? (
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-100 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${getScoreBarColor(score)}`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className={`text-sm font-bold min-w-[3rem] text-right ${getScoreColor(score)}`}>
                {score}%
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={score}
                onChange={(e) => updateGoalReview(goal.id, 'score', Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <input
                type="number"
                min={0}
                max={100}
                value={score}
                onChange={(e) => updateGoalReview(goal.id, 'score', Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Your Feedback</label>
          {isReadOnly ? (
            <div className="p-3 bg-green-50 border border-green-100 rounded-lg text-sm text-gray-700">
              {goalReview?.comment || <span className="text-gray-400 italic">No comment</span>}
            </div>
          ) : (
            <textarea
              value={goalReview?.comment || ''}
              onChange={(e) => updateGoalReview(goal.id, 'comment', e.target.value)}
              rows={2}
              placeholder="Provide constructive feedback for this goal..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
            />
          )}
        </div>
      </div>
    </Card>
  );
}

const CLASSIFICATION_COLOR_MAP: Record<string, string> = {
  purple: 'bg-purple-100 text-purple-800',
  green: 'bg-green-100 text-green-800',
  blue: 'bg-blue-100 text-blue-800',
  teal: 'bg-teal-100 text-teal-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  orange: 'bg-orange-100 text-orange-800',
  red: 'bg-red-100 text-red-800',
};

function ClassificationBadge({ color, label }: { readonly color: string; readonly label: string }) {
  const colorClass = CLASSIFICATION_COLOR_MAP[color] || CLASSIFICATION_COLOR_MAP.red;
  return (
    <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${colorClass}`}>
      {label}
    </span>
  );
}
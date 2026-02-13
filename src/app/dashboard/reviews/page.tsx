'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAppraisal } from '@/contexts/AppraisalContext';
import { useAuth } from '@/contexts/AuthContext';
import {
    faChartBar,
    faCheckCircle,
    faClock,
    faFileAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

export default function ReviewsPage() {
  const { user } = useAuth();
  const { templates, submissions, getReviewForSubmission } = useAppraisal();
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'reviewed'>('all');

  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    router.push('/dashboard');
    return null;
  }

  const reviewable = useMemo(() => {
    const submittedOrReviewed = submissions.filter((s) => {
      return s.status === 'submitted' || s.status === 'reviewed';
    });
    
    return submittedOrReviewed
      .map((s) => {
        const template = templates.find((t) => t.id === s.templateId);
        const review = getReviewForSubmission(s.id);
        return { submission: s, template, review };
      })
      .filter((item) => item.template !== undefined)
      .filter((item) => {
        if (filterStatus === 'all') return true;
        if (filterStatus === 'submitted') return !item.review;
        return !!item.review;
      });
  }, [submissions, templates, getReviewForSubmission, filterStatus]);

  const pendingCount = submissions.filter(
    (s) => s.status === 'submitted' && !getReviewForSubmission(s.id),
  ).length;
  const reviewedCount = submissions.filter((s) => s.status === 'reviewed').length;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Review Submissions</h1>
        <p className="text-gray-500 text-sm mt-1">Review and score employee appraisal submissions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faClock} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              <p className="text-xs text-gray-500">Pending Review</p>
            </div>
          </div>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{reviewedCount}</p>
              <p className="text-xs text-gray-500">Reviewed</p>
            </div>
          </div>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faChartBar} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingCount + reviewedCount}</p>
              <p className="text-xs text-gray-500">Total Submissions</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-2 mb-6">
        {(['all', 'submitted', 'reviewed'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
              filterStatus === s
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {s === 'submitted' ? 'Pending Review' : s}
          </button>
        ))}
      </div>

      {reviewable.length === 0 ? (
        <Card className="text-center py-16">
          <FontAwesomeIcon icon={faFileAlt} className="text-4xl text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No submissions found</p>
          <p className="text-gray-400 text-sm mt-1">Employee submissions will appear here once they submit their appraisals</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviewable.map(({ submission, template, review }) => (
            <Card key={submission.id} className="!p-5 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">
                    {submission.employeeName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{submission.employeeName}</p>
                    <p className="text-sm text-gray-600">{template!.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${review ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {review ? 'Reviewed' : 'Pending Review'}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        Period: {template!.period}
                      </span>
                      {submission.submittedAt && (
                        <span className="text-[10px] text-gray-400">
                          Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {review && (
                    <div className="text-right mr-2">
                      <p className="text-xs text-gray-500">Score</p>
                      <p className={`text-xl font-bold ${review.overallScore >= 80 ? 'text-green-600' : review.overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {review.overallScore}%
                      </p>
                    </div>
                  )}
                  <Button
                    onClick={() => router.push(`/dashboard/reviews/${submission.id}`)}
                    className="!py-2 !px-4 !text-xs"
                    variant={review ? 'outline' : 'primary'}
                  >
                    {review ? 'View Review' : 'Review Now'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

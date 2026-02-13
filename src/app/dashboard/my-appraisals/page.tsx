'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAppraisal } from '@/contexts/AppraisalContext';
import { useAuth } from '@/contexts/AuthContext';
import {
    faCalendarAlt,
    faCheckCircle,
    faClock,
    faExclamationTriangle,
    faFileAlt,
    faPenToSquare,
    faRefresh,
    faStar,
    faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/navigation';

export default function MyAppraisalsPage() {
  const { user } = useAuth();
  const { getTemplatesForUser, getSubmissionForEmployee, getReviewForSubmission, refreshData, isLoading, lastRefreshTime } = useAppraisal();
  const router = useRouter();

  if (!user) return null;

  const myTemplates = getTemplatesForUser(user);

  const handleRefresh = async () => {
    try {
      await refreshData();
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Appraisals</h1>
          <p className="text-gray-500 text-sm mt-1">View and complete the appraisals assigned to you</p>
        </div>
        <div className="text-right">
          <Button
            variant="outline"
            icon={faRefresh}
            onClick={handleRefresh}
            isLoading={isLoading}
            className="flex items-center gap-2"
          >
            Refresh
          </Button>
          {lastRefreshTime && (
            <p className="text-xs text-gray-400 mt-1">
              Last updated: {new Date(lastRefreshTime).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {myTemplates.length === 0 ? (
        <Card className="text-center py-16">
          <FontAwesomeIcon icon={faFileAlt} className="text-4xl text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No appraisals assigned yet</p>
          <p className="text-gray-400 text-sm mt-1">Check back later for new appraisals from your manager</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {myTemplates.map((template) => {
            const submission = getSubmissionForEmployee(template.id, user.id);
            const review = submission ? getReviewForSubmission(submission.id) : undefined;

            let statusLabel: string;
            let statusColor: string;
            let statusIcon: typeof faClock;

            if (review) {
              statusLabel = 'Reviewed';
              statusColor = 'bg-green-100 text-green-800';
              statusIcon = faCheckCircle;
            } else if (submission?.status === 'submitted') {
              statusLabel = 'Submitted – Awaiting Review';
              statusColor = 'bg-yellow-100 text-yellow-800';
              statusIcon = faClock;
            } else if (submission?.status === 'inProgress') {
              statusLabel = 'In Progress';
              statusColor = 'bg-blue-100 text-blue-700';
              statusIcon = faPenToSquare;
            } else {
              statusLabel = 'Not Started';
              statusColor = 'bg-gray-100 text-gray-600';
              statusIcon = faFileAlt;
            }

            const isDeadlineSoon =
              new Date(template.deadline).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 &&
              !submission?.submittedAt;

            return (
              <Card key={template.id} className="!p-0 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row">

                  <div className={`w-full lg:w-1.5 h-1.5 lg:h-auto ${review ? 'bg-green-500' : submission ? 'bg-yellow-500' : 'bg-purple-500'}`} />

                  <div className="flex-1 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900">{template.title}</h3>
                          {isDeadlineSoon && (
                            <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium animate-pulse flex items-center gap-1">
                              <FontAwesomeIcon icon={faExclamationTriangle} />
                              Due Soon
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 text-xs line-clamp-1">{template.description}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 whitespace-nowrap ${statusColor}`}>
                        <FontAwesomeIcon icon={statusIcon} />
                        {statusLabel}
                      </span>
                    </div>


                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-4">
                      <span className="flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
                      Period: {template.period}
                      </span>
                      <span className="flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faClock} className="text-gray-400" />
                      Deadline: {new Date(template.deadline).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faFileAlt} className="text-gray-400" />
                      {template.goals.length} Goals
                      </span>
                      <span className="flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                      By: {template.createdByName}
                      </span>
                    </div>


                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {template.goals.map((g) => (
                        <span key={g.id} className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                          {g.title} ({g.weightage}%)
                        </span>
                      ))}
                    </div>


                    {review && (
                      <div className="p-3 bg-green-50 border border-green-100 rounded-lg mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
                            <span className="text-lg font-bold text-green-800">{review.overallScore}%</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-green-800">Overall Score</p>
                            <p className="text-xs text-green-600 line-clamp-1">{review.overallComment}</p>
                          </div>
                        </div>
                      </div>
                    )}


                    <div className="flex gap-2">
                      {!submission || submission.status === 'pending' || submission.status === 'inProgress' ? (
                        <Button
                          onClick={() => router.push(`/dashboard/my-appraisals/${template.id}`)}
                          className="!py-2 !px-4 !text-xs"
                          icon={faPenToSquare}
                        >
                          {submission ? 'Continue Filling' : 'Start Appraisal'}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/dashboard/my-appraisals/${template.id}`)}
                          className="!py-2 !px-4 !text-xs"
                          icon={faFileAlt}
                        >
                          View Submission
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

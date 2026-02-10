'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAppraisal } from '@/contexts/AppraisalContext';
import { useAuth } from '@/contexts/AuthContext';
import {
    faArrowLeft,
    faCheckCircle,
    faClock,
    faFileAlt,
    faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useParams, useRouter } from 'next/navigation';

export default function AppraisalDetailPage() {
  const { user } = useAuth();
  const { templates, getSubmissionsForTemplate, getReviewForSubmission } = useAppraisal();
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;

  const template = templates.find((t) => t.id === templateId);
  const submissions = getSubmissionsForTemplate(templateId);

  if (!user || !template) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Template not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard/appraisals')}>
          Back to Templates
        </Button>
      </div>
    );
  }

  const statusColor = {
    draft: 'bg-yellow-100 text-yellow-800',
    published: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  }[template.status];

  return (
    <div className="p-6 lg:p-8">
      {/* Back & header */}
      <button
        onClick={() => router.push('/dashboard/appraisals')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition"
      >
        <FontAwesomeIcon icon={faArrowLeft} /> Back to Templates
      </button>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{template.title}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${statusColor}`}>
              {template.status}
            </span>
          </div>
          <p className="text-gray-500 text-sm max-w-2xl">{template.description}</p>
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
            <span>📅 Period: {template.period}</span>
            <span>⏰ Deadline: {new Date(template.deadline).toLocaleDateString()}</span>
            <span>👤 Created by: {template.createdByName}</span>
          </div>
        </div>
      </div>

      {/* Goals */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Goals / KPIs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {template.goals.map((goal, idx) => (
            <Card key={goal.id} className="!p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">{goal.title}</h3>
                  <p className="text-gray-500 text-xs mt-1">{goal.description}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                      {goal.category}
                    </span>
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      Weight: {goal.weightage}%
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Submissions */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faUsers} className="text-purple-600" />
          Employee Submissions ({submissions.length} / {template.assignedTo.length})
        </h2>

        {submissions.length === 0 ? (
          <Card className="text-center py-10">
            <FontAwesomeIcon icon={faFileAlt} className="text-3xl text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No submissions yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => {
              const review = getReviewForSubmission(sub.id);
              const statusBadge = {
                pending: { color: 'bg-gray-100 text-gray-600', icon: faClock },
                'inProgress': { color: 'bg-blue-100 text-blue-700', icon: faFileAlt },
                submitted: { color: 'bg-yellow-100 text-yellow-800', icon: faFileAlt },
                reviewed: { color: 'bg-green-100 text-green-800', icon: faCheckCircle },
              }[sub.status];

              // Fallback for unknown status
              const safeBadge = statusBadge || { 
                color: 'bg-gray-100 text-gray-600', 
                icon: faClock 
              };

              return (
                <Card key={sub.id} className="!p-5 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm">
                        {sub.employeeName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{sub.employeeName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${safeBadge.color}`}>
                            <FontAwesomeIcon icon={safeBadge.icon} className="mr-1" />
                            {sub.status}
                          </span>
                          {sub.submittedAt && (
                            <span className="text-[10px] text-gray-400">
                              Submitted {new Date(sub.submittedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {review && (
                        <div className="text-right mr-2">
                          <p className="text-xs text-gray-500">Score</p>
                          <p className={`text-lg font-bold ${review.overallScore >= 80 ? 'text-green-600' : review.overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {review.overallScore}%
                          </p>
                        </div>
                      )}
                      {sub.status === 'submitted' && !review && (
                        <Button
                          onClick={() => router.push(`/dashboard/reviews/${sub.id}`)}
                          className="!py-2 !px-4 !text-xs"
                        >
                          Review
                        </Button>
                      )}
                      {review && (
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/dashboard/reviews/${sub.id}`)}
                          className="!py-2 !px-4 !text-xs"
                        >
                          View Review
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Quick peek at responses */}
                  {sub.status !== 'pending' && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs font-medium text-gray-500 mb-2">Self-Assessment Summary:</p>
                      <p className="text-xs text-gray-600 line-clamp-2">{sub.overallComment || 'No overall comment provided.'}</p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

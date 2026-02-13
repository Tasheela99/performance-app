'use client';

import { AdminManagerCharts, EmployeeCharts } from '@/components/dashboard/DashboardCharts';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAppraisal } from '@/contexts/AppraisalContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  faArrowRight,
  faChartLine,
  faCheckCircle,
  faClipboardList,
  faClock,
  faFileAlt,
  faPenToSquare,
  faStar,
  faTrophy,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/navigation';

function roleBadgeClass(role: string) {
  if (role === 'admin') return 'bg-red-500/30 border-red-300/50';
  if (role === 'manager') return 'bg-blue-500/30 border-blue-300/50';
  return 'bg-green-500/30 border-green-300/50';
}

function templateStatusClass(status: string) {
  if (status === 'draft') return 'bg-yellow-100 text-yellow-800';
  if (status === 'published') return 'bg-green-100 text-green-800';
  return 'bg-gray-100 text-gray-600';
}

function scoreTextClass(score: number) {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

function scoreBarClass(score: number) {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
}

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.name.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here&apos;s your performance management overview</p>
      </div>
      {user.role === 'admin' || user.role === 'manager' ? (
        <AdminManagerDashboard />
      ) : (
        <EmployeeDashboard />
      )}
    </div>
  );
}

function AdminManagerDashboard() {
  const { user } = useAuth();
  const { templates, submissions, reviews, getTemplatesForUser } = useAppraisal();
  const router = useRouter();

  if (!user) return null;

  const myTemplates = getTemplatesForUser(user);
  const pendingReviews = submissions.filter(
    (s) => s.status === 'submitted' && !reviews.some((r) => r.submissionId === s.id),
  );
  const completedReviews = reviews.length;
  const avgScore =
    reviews.length > 0
      ? Math.round(reviews.reduce((sum, r) => sum + r.overallScore, 0) / reviews.length)
      : 0;

  const stats = [
    { key: 'tmpl', icon: faClipboardList, label: 'Templates Created', value: myTemplates.length, color: 'bg-purple-500' },
    { key: 'pending', icon: faClock, label: 'Pending Reviews', value: pendingReviews.length, color: 'bg-yellow-500' },
    { key: 'done', icon: faCheckCircle, label: 'Reviews Completed', value: completedReviews, color: 'bg-green-500' },
    { key: 'avg', icon: faChartLine, label: 'Avg. Score', value: avgScore > 0 ? `${avgScore}%` : '—', color: 'bg-purple-700' },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.key} className="!p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                <FontAwesomeIcon icon={stat.icon} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <AdminManagerCharts />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Pending Reviews</h3>
            <Button
              variant="outline"
              className="!py-1.5 !px-3 !text-xs"
              onClick={() => router.push('/dashboard/reviews')}
            >
              View All <FontAwesomeIcon icon={faArrowRight} className="ml-1" />
            </Button>
          </div>
          {pendingReviews.length === 0 ? (
            <div className="text-center py-8">
              <FontAwesomeIcon icon={faCheckCircle} className="text-3xl text-green-300 mb-2" />
              <p className="text-gray-400 text-sm">All caught up! No pending reviews.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingReviews.slice(0, 4).map((sub) => {
                const tmpl = templates.find((t) => t.id === sub.templateId);
                const go = () => router.push(`/dashboard/reviews/${sub.id}`);
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={go}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-purple-50 cursor-pointer transition w-full text-left"
                  >
                    <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold">
                      {sub.employeeName.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{sub.employeeName}</p>
                      <p className="text-xs text-gray-500 truncate">{tmpl?.title}</p>
                    </div>
                    <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                      Pending
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Recent Templates</h3>
            <Button
              variant="outline"
              className="!py-1.5 !px-3 !text-xs"
              onClick={() => router.push('/dashboard/appraisals')}
            >
              Manage <FontAwesomeIcon icon={faArrowRight} className="ml-1" />
            </Button>
          </div>
          {myTemplates.length === 0 ? (
            <div className="text-center py-8">
              <FontAwesomeIcon icon={faClipboardList} className="text-3xl text-gray-300 mb-2" />
              <p className="text-gray-400 text-sm">No templates created yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myTemplates.slice(0, 4).map((t) => {
                const go = () => router.push(`/dashboard/appraisals/${t.id}`);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={go}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-purple-50 cursor-pointer transition w-full text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{t.title}</p>
                      <p className="text-xs text-gray-500">{t.period} • {t.goals.length} goals</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${templateStatusClass(t.status)}`}>
                      {t.status}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

function EmployeeDashboard() {
  const { user } = useAuth();
  const {
    getTemplatesForUser,
    getSubmissionForEmployee,
    getReviewForSubmission,
  } = useAppraisal();
  const router = useRouter();

  if (!user) return null;

  const myTemplates = getTemplatesForUser(user);
  const mySubmissions = myTemplates.map((t) => ({
    template: t,
    submission: getSubmissionForEmployee(t.id, user.id),
  }));

  const pending = mySubmissions.filter((s) => !s.submission || s.submission.status === 'pending' || s.submission.status === 'inProgress');
  const submitted = mySubmissions.filter((s) => s.submission?.status === 'submitted');
  const reviewed = mySubmissions.filter((s) => s.submission?.status === 'reviewed');

  const myReviews = reviewed
    .map((r) => (r.submission ? getReviewForSubmission(r.submission.id) : undefined))
    .filter(Boolean);
  const avgScore =
    myReviews.length > 0
      ? Math.round(myReviews.reduce((sum, r) => sum + (r?.overallScore || 0), 0) / myReviews.length)
      : 0;

  const stats = [
    { key: 'assigned', icon: faFileAlt, label: 'Assigned Appraisals', value: myTemplates.length, color: 'bg-purple-500' },
    { key: 'todo', icon: faPenToSquare, label: 'To Complete', value: pending.length, color: 'bg-yellow-500' },
    { key: 'waiting', icon: faClock, label: 'Awaiting Review', value: submitted.length, color: 'bg-blue-500' },
    { key: 'avg', icon: faStar, label: 'Avg. Score', value: avgScore > 0 ? `${avgScore}%` : '—', color: 'bg-green-500' },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.key} className="!p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                <FontAwesomeIcon icon={stat.icon} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <EmployeeCharts />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Appraisals To Complete</h3>
            <Button
              variant="outline"
              className="!py-1.5 !px-3 !text-xs"
              onClick={() => router.push('/dashboard/my-appraisals')}
            >
              View All <FontAwesomeIcon icon={faArrowRight} className="ml-1" />
            </Button>
          </div>
          {pending.length === 0 ? (
            <div className="text-center py-8">
              <FontAwesomeIcon icon={faCheckCircle} className="text-3xl text-green-300 mb-2" />
              <p className="text-gray-400 text-sm">All appraisals completed!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map(({ template }) => {
                const go = () => router.push(`/dashboard/my-appraisals/${template.id}`);
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={go}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-purple-50 cursor-pointer transition w-full text-left"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900 text-sm">{template.title}</p>
                      <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                        Pending
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {template.goals.length} goals • Deadline: {new Date(template.deadline).toLocaleDateString()}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Your Scores</h3>
            {avgScore > 0 && (
              <div className="flex items-center gap-1">
                <FontAwesomeIcon icon={faTrophy} className="text-yellow-500" />
                <span className="text-sm font-bold text-gray-900">Avg: {avgScore}%</span>
              </div>
            )}
          </div>
          {reviewed.length === 0 ? (
            <div className="text-center py-8">
              <FontAwesomeIcon icon={faStar} className="text-3xl text-gray-300 mb-2" />
              <p className="text-gray-400 text-sm">No reviewed appraisals yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviewed.map(({ template, submission }) => {
                const review = submission ? getReviewForSubmission(submission.id) : undefined;
                const score = review?.overallScore || 0;
                const go = () => router.push(`/dashboard/my-appraisals/${template.id}`);
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={go}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-green-50 cursor-pointer transition w-full text-left"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900 text-sm">{template.title}</p>
                      {review && (
                        <span className={`text-sm font-bold ${scoreTextClass(score)}`}>
                          {score}%
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className={`h-2 rounded-full ${scoreBarClass(score)}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{template.period}</p>
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

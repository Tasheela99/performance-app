'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import {
    faArrowLeft,
    faAward,
    faCalendar,
    faChartLine,
    faCheckCircle,
    faClock,
    faEnvelope,
    faStar,
    faTasks,
    faTrophy,
    faUser
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

interface EmployeeProgress {
  employee: {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
    position?: string;
    createdAt: string;
  };
  statistics: {
    totalSubmissions: number;
    completedSubmissions: number;
    reviewedSubmissions: number;
    pendingSubmissions: number;
    averageScore: number;
    completionRate: number;
  };
  scoreTrend: Array<{
    period: string;
    score: number;
    reviewedAt: string;
  }>;
  categoryPerformance: Array<{
    category: string;
    averageScore: number;
    count: number;
  }>;
  statusDistribution: {
    pending: number;
    inProgress: number;
    submitted: number;
    reviewed: number;
  };
  recentSubmissions: Array<{
    id: string;
    templateTitle: string;
    period: string;
    status: string;
    submittedAt?: string;
    score?: number;
    reviewedAt?: string;
    reviewerName?: string;
  }>;
}

const CHART_COLORS = {
  primary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  purple: '#A78BFA',
  green: '#34D399',
  yellow: '#FBBF24',
  red: '#F87171',
};

export default function EmployeeProgressPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;
  
  const [progressData, setProgressData] = useState<EmployeeProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      router.push('/dashboard');
      return;
    }
    fetchEmployeeProgress();
  }, [user, employeeId]);

  const fetchEmployeeProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/employees/${employeeId}/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProgressData(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch employee progress');
      }
    } catch (err) {
      console.error('Error fetching employee progress:', err);
      setError('An error occurred while fetching employee progress');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading employee progress...</p>
        </div>
      </div>
    );
  }

  if (error || !progressData) {
    return (
      <div className="p-6 lg:p-8">
        <Card className="text-center py-16">
          <p className="text-red-500 font-medium mb-4">{error || 'Employee not found'}</p>
          <Button onClick={() => router.push('/dashboard/users')}>
            Back to Users
          </Button>
        </Card>
      </div>
    );
  }

  const { employee, statistics, scoreTrend, categoryPerformance, statusDistribution, recentSubmissions } = progressData;

  // Prepare status distribution data for pie chart
  const statusPieData = [
    { name: 'Pending', value: statusDistribution.pending, color: CHART_COLORS.warning },
    { name: 'In Progress', value: statusDistribution.inProgress, color: CHART_COLORS.info },
    { name: 'Submitted', value: statusDistribution.submitted, color: CHART_COLORS.yellow },
    { name: 'Reviewed', value: statusDistribution.reviewed, color: CHART_COLORS.success },
  ].filter(item => item.value > 0);

  // Get performance status based on average score
  const getPerformanceStatus = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-600 bg-green-100' };
    if (score >= 60) return { label: 'Good', color: 'text-blue-600 bg-blue-100' };
    if (score >= 40) return { label: 'Fair', color: 'text-yellow-600 bg-yellow-100' };
    return { label: 'Needs Improvement', color: 'text-red-600 bg-red-100' };
  };

  const performanceStatus = getPerformanceStatus(statistics.averageScore);

  return (
    <div className="p-6 lg:p-8 max-w-9xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard/users')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Users
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Employee Performance Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Comprehensive performance overview and analytics</p>
      </div>

      {/* Employee Info Card */}
      <Card className="!p-6 mb-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center flex-shrink-0">
            <FontAwesomeIcon icon={faUser} className="text-white text-3xl" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{employee.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                {employee.email}
              </div>
              {employee.department && (
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faTasks} className="text-gray-400" />
                  {employee.department}
                </div>
              )}
              {employee.position && (
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faAward} className="text-gray-400" />
                  {employee.position}
                </div>
              )}
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendar} className="text-gray-400" />
                Joined {new Date(employee.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-lg text-sm font-semibold ${performanceStatus.color}`}>
            {performanceStatus.label}
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faTasks} className="text-purple-600 text-xl" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{statistics.totalSubmissions}</p>
              <p className="text-xs text-gray-500">Total Appraisals</p>
            </div>
          </div>
        </Card>

        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{statistics.reviewedSubmissions}</p>
              <p className="text-xs text-gray-500">Reviewed</p>
            </div>
          </div>
        </Card>

        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faClock} className="text-yellow-600 text-xl" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{statistics.pendingSubmissions}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
          </div>
        </Card>

        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faStar} className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{statistics.averageScore}%</p>
              <p className="text-xs text-gray-500">Average Score</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Score Trend Line Chart */}
        <Card className="!p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faChartLine} className="text-purple-600" />
            Performance Trend
          </h3>
          {scoreTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={scoreTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="period" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Performance Score"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No performance data available yet
            </div>
          )}
        </Card>

        {/* Status Distribution Pie Chart */}
        <Card className="!p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faTrophy} className="text-purple-600" />
            Submission Status
          </h3>
          {statusPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusPieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No submissions available yet
            </div>
          )}
        </Card>
      </div>

      {/* Category Performance Bar Chart */}
      {categoryPerformance.length > 0 && (
        <Card className="!p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faAward} className="text-purple-600" />
            Performance by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="category" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="averageScore" fill={CHART_COLORS.primary} name="Average Score" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Recent Submissions Table */}
      <Card className="!p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Submissions</h3>
        {recentSubmissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Template</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Period</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Score</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentSubmissions.map((submission) => {
                  const statusColors = {
                    pending: 'bg-gray-100 text-gray-700',
                    inProgress: 'bg-blue-100 text-blue-700',
                    submitted: 'bg-yellow-100 text-yellow-700',
                    reviewed: 'bg-green-100 text-green-700',
                  };

                  return (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{submission.templateTitle}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{submission.period}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[submission.status as keyof typeof statusColors]}`}>
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {submission.score ? `${submission.score}%` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            No submissions available yet
          </div>
        )}
      </Card>
    </div>
  );
}

'use client';

import Card from '@/components/ui/Card';
import { useAppraisal } from '@/contexts/AppraisalContext';
import { useAuth } from '@/contexts/AuthContext';
import { faArrowUp, faCalendarAlt, faChartLine, faStar, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMemo } from 'react';
import {
    Area,
    AreaChart,
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

const CHART_COLORS = {
  primary: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'],
  success: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
  warning: ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A'],
  error: ['#EF4444', '#F87171', '#FCA5A5', '#FECACA'],
  info: ['#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'],
  mixed: ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#6366F1']
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


export function AdminManagerCharts() {
  const { templates, submissions, reviews } = useAppraisal();
  const { user } = useAuth();

  const submissionStatusData = useMemo(() => {
    const statusCounts = {
      pending: 0,
      'inProgress': 0,
      submitted: 0,
      reviewed: 0
    };
    
    submissions.forEach(sub => {
      statusCounts[sub.status as keyof typeof statusCounts]++;
    });
    
    return [
      { name: 'Pending', value: statusCounts.pending, color: CHART_COLORS.warning[0] },
      { name: 'In Progress', value: statusCounts['inProgress'], color: CHART_COLORS.info[0] },
      { name: 'Submitted', value: statusCounts.submitted, color: CHART_COLORS.warning[1] },
      { name: 'Reviewed', value: statusCounts.reviewed, color: CHART_COLORS.success[0] },
    ].filter(item => item.value > 0);
  }, [submissions]);

  const scoreDistData = useMemo(() => {
    const ranges = {
      'Excellent (80-100)': 0,
      'Good (60-79)': 0,
      'Needs Improvement (<60)': 0
    };
    
    reviews.forEach(review => {
      if (review.overallScore >= 80) ranges['Excellent (80-100)']++;
      else if (review.overallScore >= 60) ranges['Good (60-79)']++;
      else ranges['Needs Improvement (<60)']++;
    });
    
    return [
      { range: 'Excellent', count: ranges['Excellent (80-100)'], fill: CHART_COLORS.success[0] },
      { range: 'Good', count: ranges['Good (60-79)'], fill: CHART_COLORS.info[0] },
      { range: 'Needs Improvement', count: ranges['Needs Improvement (<60)'], fill: CHART_COLORS.error[0] },
    ];
  }, [reviews]);

  const monthlyData = useMemo(() => {
    const currentDate = new Date();
    const months = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const monthSubmissions = submissions.filter(sub => {
        const subDate = new Date(sub.submittedAt || '');
        const subMonthStr = `${subDate.getFullYear()}-${String(subDate.getMonth() + 1).padStart(2, '0')}`;
        return subMonthStr === monthStr;
      });
      
      const monthReviews = reviews.filter(review => {
        const reviewDate = new Date(review.reviewedAt);
        const reviewMonthStr = `${reviewDate.getFullYear()}-${String(reviewDate.getMonth() + 1).padStart(2, '0')}`;
        return reviewMonthStr === monthStr;
      });
      
      months.push({
        month: MONTH_NAMES[date.getMonth()],
        submissions: monthSubmissions.length,
        reviews: monthReviews.length,
        avgScore: monthReviews.length > 0 
          ? Math.round(monthReviews.reduce((sum, r) => sum + r.overallScore, 0) / monthReviews.length)
          : 0
      });
    }
    
    return months;
  }, [submissions, reviews]);

  return (
    <>
      <Card className="col-span-1">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faUsers} className="text-purple-600" />
          Submission Status
        </h3>
        <div className="h-48">
          {submissionStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={submissionStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={80}
                  dataKey="value"
                >
                  {submissionStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <FontAwesomeIcon icon={faUsers} className="text-3xl mb-2" />
                <p className="text-sm">No submission data yet</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="col-span-1">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faArrowUp} className="text-green-600" />
          Score Distribution
        </h3>
        <div className="h-48">
          {reviews.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <FontAwesomeIcon icon={faArrowUp} className="text-3xl mb-2" />
                <p className="text-sm">No review data yet</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="col-span-1">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-600" />
          Monthly Progress
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="reviews"
                stackId="1"
                stroke={CHART_COLORS.success[0]}
                fill={CHART_COLORS.success[0]}
                name="Reviews"
              />
              <Area
                type="monotone"
                dataKey="submissions"
                stackId="1"
                stroke={CHART_COLORS.primary[0]}
                fill={CHART_COLORS.primary[0]}
                name="Submissions"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </>
  );
}


export function EmployeeCharts() {
  const { user } = useAuth();
  const { getTemplatesForUser, getSubmissionForEmployee, getReviewForSubmission } = useAppraisal();

  const myTemplates = getTemplatesForUser(user!);
  const mySubmissions = myTemplates.map((t) => ({
    template: t,
    submission: getSubmissionForEmployee(t.id, user!.id),
  }));

  const personalPerformance = useMemo(() => {
    return mySubmissions
      .filter(item => item.submission?.status === 'reviewed')
      .map(item => {
        const review = item.submission ? getReviewForSubmission(item.submission.id) : undefined;
        return {
          period: item.template.period,
          score: review?.overallScore || 0,
          template: item.template.title.substring(0, 20) + (item.template.title.length > 20 ? '...' : '')
        };
      })
      .sort((a, b) => a.period.localeCompare(b.period));
  }, [mySubmissions, getReviewForSubmission]);

  const goalProgress = useMemo(() => {
    const completed = mySubmissions.filter(item => item.submission?.status === 'reviewed' || item.submission?.status === 'submitted').length;
    const total = mySubmissions.length;
    const pending = total - completed;
    
    return [
      { name: 'Completed', value: completed, color: CHART_COLORS.success[0] },
      { name: 'Pending', value: pending, color: CHART_COLORS.warning[0] },
    ].filter(item => item.value > 0);
  }, [mySubmissions]);

  return (
    <>
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faChartLine} className="text-purple-600" />
          Your Performance Trend
        </h3>
        <div className="h-64">
          {personalPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={personalPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" fontSize={12} />
                <YAxis domain={[0, 100]} fontSize={12} />
                <Tooltip 
                  formatter={(value, name) => [`${value}%`, 'Score']}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return `${label} - ${payload[0].payload.template}`;
                    }
                    return label;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke={CHART_COLORS.primary[0]} 
                  strokeWidth={3}
                  dot={{ fill: CHART_COLORS.primary[0], strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <FontAwesomeIcon icon={faChartLine} className="text-3xl mb-2" />
                <p className="text-sm">No performance data yet</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faStar} className="text-yellow-600" />
          Goal Completion
        </h3>
        <div className="h-64">
          {goalProgress.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={goalProgress}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={100}
                  dataKey="value"
                  label={({name, value}) => `${name}: ${value}`}
                >
                  {goalProgress.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <FontAwesomeIcon icon={faStar} className="text-3xl mb-2" />
                <p className="text-sm">No appraisals assigned yet</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </>
  );
}
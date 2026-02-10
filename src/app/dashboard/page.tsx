'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import {
    faChartLine,
    faClipboardCheck,
    faGauge,
    faRightFromBracket,
    faTrophy,
    faUsers
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function DashboardPage() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  const stats = [
    { icon: faChartLine, label: 'Performance Score', value: '8.5/10', color: 'bg-blue-500' },
    { icon: faClipboardCheck, label: 'Completed Reviews', value: '12', color: 'bg-green-500' },
    { icon: faUsers, label: 'Team Members', value: '24', color: 'bg-purple-500' },
    { icon: faTrophy, label: 'Achievements', value: '8', color: 'bg-yellow-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faGauge} className="text-white text-xl" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Performance Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
              </div>
              <Button
                variant="outline"
                icon={faRightFromBracket}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-600">
            Here's an overview of your performance and activities
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <FontAwesomeIcon icon={stat.icon} className="text-white text-xl" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Reviews</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Q{index + 1} Performance Review</p>
                    <p className="text-sm text-gray-600">Completed {index + 1} weeks ago</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Completed
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Upcoming Tasks</h3>
            <div className="space-y-3">
              {[
                { task: 'Self-assessment due', date: 'In 5 days' },
                { task: 'Peer review for John', date: 'In 1 week' },
                { task: 'Goal setting meeting', date: 'In 2 weeks' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.task}</p>
                    <p className="text-sm text-gray-600">{item.date}</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

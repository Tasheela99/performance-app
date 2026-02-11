'use client';

import { Button, Card } from '@/components/ui';
import { PERFORMANCE_CLASSIFICATIONS } from '@/constants/appraisal';
import { useAppraisal } from '@/contexts/AppraisalContext';
import { useAuth } from '@/contexts/AuthContext';
import { OfficerPerformanceTracking } from '@/types/appraisal.types';
import {
    faAward,
    faChartBar,
    faCog,
    faRefresh,
    faStarOfDavid,
    faTrophy
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useState } from 'react';

// Helper function for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
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

export const PerformanceInsights: React.FC = () => {
  const { user } = useAuth();
  const { reviews, isLoading } = useAppraisal();
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationSuccess, setMigrationSuccess] = useState<string | null>(null);
  const [eligibleForIncrements, setEligibleForIncrements] = useState<OfficerPerformanceTracking[]>([]);
  const [eligibleForAwards, setEligibleForAwards] = useState<OfficerPerformanceTracking[]>([]);

  // Calculate performance distribution
  const performanceDistribution = React.useMemo(() => {
    const distribution = Object.keys(PERFORMANCE_CLASSIFICATIONS).reduce((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {} as Record<string, number>);

    reviews.forEach(review => {
      if (review.performanceClassification?.key) {
        distribution[review.performanceClassification.key]++;
      }
    });

    return distribution;
  }, [reviews]);

  // Load eligible officers
  const loadEligibleOfficers = useCallback(async () => {
    try {
      const [incrementsData, awardsData] = await Promise.all([
        apiCall('/officers/performance', {
          method: 'POST',
          body: JSON.stringify({ type: 'increment' }),
        }),
        apiCall('/officers/performance', {
          method: 'POST',
          body: JSON.stringify({ type: 'presidential_award' }),
        })
      ]);

      setEligibleForIncrements(incrementsData.eligibleOfficers || []);
      setEligibleForAwards(awardsData.eligibleOfficers || []);
    } catch (error) {
      console.error('Failed to load eligible officers:', error);
    }
  }, []);

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'manager')) {
      loadEligibleOfficers();
    }
  }, [user, loadEligibleOfficers]);

  const runMigration = async () => {
    if (!window.confirm('Are you sure you want to run the performance system migration? This action cannot be undone.')) {
      return;
    }

    try {
      setIsMigrating(true);
      setMigrationSuccess(null);
      
      await apiCall('/admin/migrate-performance-system', {
        method: 'POST',
      });
      
      setMigrationSuccess('Performance system migration completed successfully!');
      setTimeout(() => setMigrationSuccess(null), 5000);
    } catch (error) {
      console.error('Migration failed:', error);
      alert(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsMigrating(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </Card>
    );
  }

  // Only show to admin and manager
  if (user?.role !== 'admin' && user?.role !== 'manager') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Performance Distribution */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FontAwesomeIcon icon={faChartBar} className="text-blue-500" />
            Performance Distribution
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(PERFORMANCE_CLASSIFICATIONS).map(([key, classification]) => {
            const count = performanceDistribution[key] || 0;
            const percentage = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
            
            return (
              <div key={key} className="p-3 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">{classification.label}</span>
                  <span className="text-lg font-bold text-gray-900">{count}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300`}
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: `var(--${classification.color}-500)`
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Awards and Recognition */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Eligible for Increments */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FontAwesomeIcon icon={faAward} className="text-yellow-500" />
                Eligible for Increments
              </h3>
              <Button 
                variant="outline" 
                className="!py-1.5 !px-3 !text-xs"
                onClick={loadEligibleOfficers}
              >
                <FontAwesomeIcon icon={faRefresh} className="mr-1" />
                Refresh
              </Button>
            </div>
            {eligibleForIncrements.length === 0 ? (
              <div className="text-center py-6">
                <FontAwesomeIcon icon={faStarOfDavid} className="text-3xl text-gray-300 mb-2" />
                <p className="text-gray-400 text-sm">No officers eligible for increments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {eligibleForIncrements.slice(0, 3).map((tracking) => (
                  <div key={tracking.officerId} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{tracking.officer?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-600">{tracking.officer?.department || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-yellow-600">
                          {tracking.consecutiveExcellentYears} years
                        </p>
                        <p className="text-xs text-gray-500">consecutive excellent</p>
                      </div>
                    </div>
                  </div>
                ))}
                {eligibleForIncrements.length > 3 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{eligibleForIncrements.length - 3} more officers eligible
                  </p>
                )}
              </div>
            )}
          </Card>

          {/* Eligible for Presidential Award */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FontAwesomeIcon icon={faTrophy} className="text-purple-500" />
                Presidential Award Eligible
              </h3>
            </div>
            {eligibleForAwards.length === 0 ? (
              <div className="text-center py-6">
                <FontAwesomeIcon icon={faTrophy} className="text-3xl text-gray-300 mb-2" />
                <p className="text-gray-400 text-sm">No officers eligible for Presidential Awards</p>
              </div>
            ) : (
              <div className="space-y-3">
                {eligibleForAwards.map((tracking) => (
                  <div key={tracking.officerId} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{tracking.officer?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-600">{tracking.officer?.department || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-purple-600">
                          {tracking.totalIncrements} increments
                        </p>
                        <p className="text-xs text-gray-500">earned</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Migration Tool - Admin Only */}
      {user?.role === 'admin' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FontAwesomeIcon icon={faCog} className="text-gray-500" />
                Performance System Migration
              </h3>
              <p className="text-sm text-gray-600">
                Run this once to migrate existing data to the new performance system
              </p>
            </div>
            <Button
              onClick={runMigration}
              disabled={isMigrating}
              className={`${isMigrating ? '!bg-gray-400' : '!bg-orange-500 hover:!bg-orange-600'}`}
            >
              {isMigrating ? (
                <>
                  <FontAwesomeIcon icon={faRefresh} className="mr-2 animate-spin" />
                  Migrating...
                </>
              ) : (
                'Run Migration'
              )}
            </Button>
          </div>
          {migrationSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">{migrationSuccess}</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
import { getPerformanceClassification } from '@/constants/appraisal';
import React from 'react';

interface PerformanceClassificationBadgeProps {
  score: number;
  className?: string;
}

export const PerformanceClassificationBadge: React.FC<PerformanceClassificationBadgeProps> = ({
  score,
  className = '',
}) => {
  const classification = getPerformanceClassification(score);
  
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    teal: 'bg-teal-100 text-teal-800 border-teal-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    red: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
        colorClasses[classification.color as keyof typeof colorClasses] || colorClasses.red
      } ${className}`}
      title={`Score: ${score}%`}
    >
      {classification.label}
    </span>
  );
};

interface PerformanceSectionScoresProps {
  taskScore: number;
  competencyScore: number;
  overallScore: number;
  className?: string;
}

export const PerformanceSectionScores: React.FC<PerformanceSectionScoresProps> = ({
  taskScore,
  competencyScore,
  overallScore,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Tasks (80%)</span>
        <span className="font-medium text-gray-900">{taskScore}%</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Competencies (20%)</span>
        <span className="font-medium text-gray-900">{competencyScore}%</span>
      </div>
      <div className="pt-2 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">Overall Score</span>
          <span className="text-lg font-bold text-gray-900">{overallScore}%</span>
        </div>
        <div className="mt-1">
          <PerformanceClassificationBadge score={overallScore} />
        </div>
      </div>
    </div>
  );
};

interface RecognitionStatusProps {
  consecutiveExcellentYears: number;
  totalIncrements: number;
  eligibleForPresidentialAward: boolean;
  yearsToIncrement?: number;
  incrementsToPresidentialAward?: number;
  className?: string;
}

export const RecognitionStatus: React.FC<RecognitionStatusProps> = ({
  consecutiveExcellentYears,
  totalIncrements,
  eligibleForPresidentialAward,
  yearsToIncrement = 0,
  incrementsToPresidentialAward = 0,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
        <div>
          <p className="text-sm font-medium text-gray-900">Consecutive Excellent Years</p>
          <p className="text-xs text-gray-600">3 years required for increment</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-blue-600">{consecutiveExcellentYears}</p>
          {yearsToIncrement > 0 && (
            <p className="text-xs text-gray-500">{yearsToIncrement} more needed</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
        <div>
          <p className="text-sm font-medium text-gray-900">Performance Increments</p>
          <p className="text-xs text-gray-600">3 increments for Presidential Award</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-green-600">{totalIncrements}</p>
          {incrementsToPresidentialAward > 0 && (
            <p className="text-xs text-gray-500">{incrementsToPresidentialAward} more needed</p>
          )}
        </div>
      </div>

      {eligibleForPresidentialAward && (
        <div className="flex items-center justify-center p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="text-center">
            <p className="text-sm font-bold text-purple-900">🏆 Eligible for Presidential Award</p>
            <p className="text-xs text-purple-700">For Governance and Public Administration</p>
          </div>
        </div>
      )}
    </div>
  );
};
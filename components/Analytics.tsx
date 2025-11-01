import React from 'react';
import { StoredReport } from '../types';
import { AnalyticsDashboard } from './AnalyticsDashboard';

interface AnalyticsProps {
  reports: StoredReport[];
  onViewReport: (report: StoredReport) => void;
}

export const Analytics: React.FC<AnalyticsProps> = ({ reports, onViewReport }) => {
  if (reports.length === 0) {
    return (
      <div className="text-center p-8 bg-[#161b22] border border-dashed border-gray-700 rounded-lg animate-fade-in">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto h-16 w-16 text-gray-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
        </svg>
        <h2 className="mt-4 text-2xl font-semibold text-gray-300">No Analytics Data</h2>
        <p className="mt-2 text-gray-500">
          Run a few vendor analyses to start building your analytics dashboard.
        </p>
      </div>
    );
  }

  return <AnalyticsDashboard reports={reports} onViewReport={onViewReport} />;
};

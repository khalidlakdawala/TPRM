import React from 'react';
import { StoredReport } from '../types';

interface HistoryProps {
  reports: StoredReport[];
  onSelect: (report: StoredReport) => void;
  onReanalyze: (domain: string, name: string, scanType: 'quick' | 'full') => void;
  onClear: () => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
  currentReportId?: number | null;
}

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);

const ViewIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 10.224 5.96 7.5 9 7.5c3.04 0 5.577 2.724 6.964 4.183.375.46.375 1.152 0 1.612C14.577 14.776 12.04 17.5 9 17.5c-3.04 0-5.577-2.724-6.964-4.183a1.012 1.012 0 0 1 0-.639ZM9 12a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" />
    </svg>
);

const ReanalyzeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001a.75.75 0 0 1 .748.748c-.004 1.516-.484 2.94-1.32 4.144a.75.75 0 0 1-1.12.355l-2.09-1.207a.75.75 0 0 1-.355-1.12z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.01 3.75a.75.75 0 0 1 .748.748v.001c-1.516.004-2.94.484-4.144 1.32a.75.75 0 0 1-1.12-.355L2.81 3.42a.75.75 0 0 1 .355-1.12zM4.224 16.023a.75.75 0 0 1 .355 1.12l-2.09 1.207a.75.75 0 0 1-1.12-.355c-.836-1.204-1.316-2.628-1.32-4.144a.75.75 0 0 1 .748-.748h.001v4.992zM18.676 4.224a.75.75 0 0 1 1.12-.355l1.207 2.09a.75.75 0 0 1-.355 1.12c-1.204.836-2.628 1.316-4.144 1.32a.75.75 0 0 1-.748-.748v-.001h4.992z" />
    </svg>
);

const IconButton: React.FC<{onClick: () => void; disabled: boolean; label: string; children: React.ReactNode; className?: string}> = 
({ onClick, disabled, label, children, className = '' }) => (
    <div className="relative group">
        <button
            onClick={onClick}
            disabled={disabled}
            className={`p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            aria-label={label}
        >
            {children}
        </button>
        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900 border border-gray-700 text-white text-xs px-2 py-1 rounded-md opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none z-10">
            {label}
        </span>
    </div>
);

export const History: React.FC<HistoryProps> = ({ reports, onSelect, onReanalyze, onClear, onDelete, isLoading, currentReportId }) => {
  if (reports.length === 0) {
    return (
        <div className="bg-[#161b22] p-6 rounded-lg border border-gray-800 shadow-xl h-full">
            <h2 className="text-xl font-bold text-gray-200 mb-4">Analysis History</h2>
            <div className="text-center text-gray-500 pt-8">
                <p>No reports yet.</p>
                <p className="text-sm">Your analysis history will appear here.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="bg-[#161b22] p-6 rounded-lg border border-gray-800 shadow-xl h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h2 className="text-xl font-bold text-gray-200">Analysis History</h2>
        <button
          onClick={onClear}
          disabled={isLoading}
          className="text-sm text-gray-500 hover:text-red-400 disabled:opacity-50 transition-colors"
        >
          Clear History
        </button>
      </div>
      <ul className="space-y-3 overflow-y-auto flex-grow pr-2">
        {reports.map((report) => (
          <li key={report.id} className={`bg-[#0d1117] p-3 rounded-md border flex justify-between items-center transition-colors ${
              currentReportId === report.id ? 'border-cyan-600' : 'border-gray-700/50'
          }`}>
            <div className="flex-grow min-w-0">
              <p className="font-semibold text-gray-300 flex items-center flex-wrap gap-x-3">
                <span className="truncate">{report.vendorName}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${
                    report.scanType === 'full' 
                    ? 'bg-cyan-500/20 text-cyan-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                    {report.scanType}
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1 truncate">
                {report.domain} &bull; {new Date(report.timestamp).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                <IconButton
                    onClick={() => onSelect(report)}
                    disabled={isLoading}
                    label="View Report"
                >
                    <ViewIcon />
                </IconButton>
                <IconButton
                    onClick={() => onReanalyze(report.domain, report.vendorName, report.scanType)}
                    disabled={isLoading}
                    label="Re-analyze"
                >
                    <ReanalyzeIcon />
                </IconButton>
                <IconButton
                    onClick={() => {
                        if (report.id && window.confirm(`Are you sure you want to delete the report for ${report.vendorName}?`)) {
                            onDelete(report.id);
                        }
                    }}
                    disabled={isLoading}
                    label="Delete Report"
                    className="hover:text-red-400"
                >
                    <TrashIcon />
                </IconButton>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
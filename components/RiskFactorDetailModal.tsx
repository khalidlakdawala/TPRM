import React, { useMemo } from 'react';
import { StoredReport } from '../types';

interface RiskFactorDetailModalProps {
  factorName: string;
  reports: StoredReport[];
  onClose: () => void;
}

const getScoreColorClass = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
};

export const RiskFactorDetailModal: React.FC<RiskFactorDetailModalProps> = ({ factorName, reports, onClose }) => {
  const vendorScores = useMemo(() => {
    const latestReports = new Map<string, StoredReport>();
    reports.forEach(report => {
        const key = report.vendorName || report.domain;
        if (!latestReports.has(key) || report.timestamp > latestReports.get(key)!.timestamp) {
            latestReports.set(key, report);
        }
    });

    return Array.from(latestReports.values())
      .map(report => {
        const factor = report.result.riskFactors.find(f => f.name === factorName);
        return {
          name: report.vendorName || report.domain,
          score: factor?.score,
        };
      })
      .filter((item): item is { name: string; score: number } => typeof item.score === 'number')
      .sort((a, b) => a.score - b.score);
  }, [factorName, reports]);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
      <div className="bg-[#161b22] border border-gray-700 rounded-lg shadow-2xl w-full max-w-lg p-6 m-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Scores for: <span className="text-cyan-400">{factorName}</span></h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          {vendorScores.length > 0 ? (
            <ul className="space-y-2">
              <li className="flex justify-between items-center text-xs text-gray-500 font-semibold px-3">
                <span>VENDOR</span>
                <span>SCORE</span>
              </li>
              {vendorScores.map(({ name, score }) => (
                <li key={name} className="flex justify-between items-center bg-[#0d1117] p-3 rounded-md border border-gray-800">
                  <span className="text-gray-300 font-medium">{name}</span>
                  <span className={`font-bold text-lg ${getScoreColorClass(score)}`}>{score}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">No data available for this risk factor.</p>
          )}
        </div>
      </div>
    </div>
  );
};

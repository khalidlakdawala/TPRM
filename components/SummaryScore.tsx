
import React from 'react';

interface SummaryScoreProps {
  score: number;
  summary: string;
  vendorName: string;
  onExportPdf: () => void;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-400';
  if (score >= 50) return 'text-yellow-400';
  return 'text-red-400';
};

const PdfIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);


export const SummaryScore: React.FC<SummaryScoreProps> = ({ score, summary, vendorName, onExportPdf }) => {
  const scoreColor = getScoreColor(score);

  return (
    <div className="bg-[#161b22] p-6 rounded-lg border border-gray-800 h-full flex flex-col justify-between shadow-xl">
      <div>
        <div className="flex justify-between items-start mb-4">
            <div>
                <h2 className="text-lg font-semibold text-gray-400 mb-1">Overall Risk Score for</h2>
                <p className="text-2xl font-bold text-white truncate">{vendorName}</p>
            </div>
            <button onClick={onExportPdf} className="flex-shrink-0 flex items-center text-sm bg-gray-700 hover:bg-gray-600 text-white font-medium py-1.5 px-3 rounded-md transition" aria-label="Export report as PDF">
                <PdfIcon />
                Export
            </button>
        </div>
      </div>
      <div className="text-center my-4">
        <div className={`relative inline-flex items-center justify-center w-40 h-40`}>
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              className="text-gray-700"
              strokeWidth="2"
              fill="none"
              stroke="currentColor"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={scoreColor.replace('text-', 'stroke-')}
              strokeWidth="2"
              fill="none"
              strokeDasharray={`${score}, 100`}
              strokeLinecap="round"
              stroke="currentColor"
              transform="rotate(-90 18 18)"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className={`absolute text-5xl font-bold ${scoreColor}`}>{score}</span>
        </div>
        <p className={`mt-2 text-xl font-semibold ${scoreColor}`}>
          {score >= 80 ? 'Low Risk' : score >= 50 ? 'Medium Risk' : 'High Risk'}
        </p>
      </div>
      <div>
        <h3 className="font-semibold text-gray-400 mb-2">AI Summary</h3>
        <p className="text-sm text-gray-300">{summary}</p>
      </div>
    </div>
  );
};
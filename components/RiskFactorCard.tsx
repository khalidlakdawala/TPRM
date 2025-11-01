
import React from 'react';
import { RiskFactor } from '../types';
import { RISK_FACTOR_ICONS } from '../constants';

interface RiskFactorCardProps {
  factor: RiskFactor;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' };
  if (score >= 50) return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' };
  return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' };
};

export const RiskFactorCard: React.FC<RiskFactorCardProps> = ({ factor }) => {
  const { bg, text, border } = getScoreColor(factor.score);
  const Icon = RISK_FACTOR_ICONS[factor.name] || RISK_FACTOR_ICONS['Cubit Score'];

  return (
    <div className={`bg-[#161b22] p-5 rounded-lg border ${border} flex flex-col h-full shadow-lg transition-transform hover:scale-105 duration-300`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
            <div className={`mr-4 p-2 rounded-full ${bg} ${text}`}>
                {Icon}
            </div>
            <h3 className="text-md font-semibold text-gray-200">{factor.name}</h3>
        </div>
        <div className={`text-2xl font-bold ${text}`}>{factor.score}</div>
      </div>
      <p className="text-sm text-gray-400 flex-grow">{factor.summary}</p>

      {factor.references && factor.references.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-700/50">
          <h4 className="text-xs font-semibold text-gray-500 mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.502a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Key Findings
          </h4>
          <ul className="space-y-1.5 pl-1">
            {factor.references.map((ref, index) => (
              <li key={index} className="flex items-start">
                  <span className="text-cyan-500 mr-2 mt-1">&#8227;</span> 
                  <span className="text-xs text-gray-400">{ref}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
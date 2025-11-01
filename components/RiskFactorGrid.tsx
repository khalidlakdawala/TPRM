
import React from 'react';
import { RiskFactor } from '../types';
import { RiskFactorCard } from './RiskFactorCard';

interface RiskFactorGridProps {
  riskFactors: RiskFactor[];
}

export const RiskFactorGrid: React.FC<RiskFactorGridProps> = ({ riskFactors }) => {
  return (
    <div>
        <h2 className="text-xl font-bold text-gray-200 mb-4">Detailed Risk Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {riskFactors.map((factor) => (
            <RiskFactorCard key={factor.name} factor={factor} />
        ))}
        </div>
    </div>
  );
};

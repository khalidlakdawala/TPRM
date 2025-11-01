import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { RiskFactor } from '../types';

interface RiskRadarChartProps {
  title: string;
  data: RiskFactor[];
  color: string;
  score?: number;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-400';
  if (score >= 50) return 'text-yellow-400';
  return 'text-red-400';
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0d1117] p-2 border border-gray-700 rounded-md shadow-lg">
                <p className="label font-bold text-cyan-400">{`${label}`}</p>
                <p className="intro text-gray-300">{`Score: ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};

// NEW: Custom tick component for wrapping long labels
const CustomizedAngleTick = ({ x, y, textAnchor, payload }: any) => {
    const words = payload.value.split(' ');
    
    // If it's a single word, just render it.
    if (words.length <= 1) {
      return (
        <text x={x} y={y} textAnchor={textAnchor} fill="#c9d1d9" fontSize={11} dominantBaseline="central">
          {payload.value}
        </text>
      );
    }
    
    // For multi-word labels, split into two lines.
    const line1 = words[0];
    const line2 = words.slice(1).join(' ');
  
    return (
        <text x={x} y={y} textAnchor={textAnchor} fill="#c9d1d9" fontSize={11} dominantBaseline="central">
          <tspan x={x} dy="-0.6em">{line1}</tspan>
          <tspan x={x} dy="1.2em">{line2}</tspan>
        </text>
    );
};


export const RiskRadarChart: React.FC<RiskRadarChartProps> = ({ title, data, color, score }) => {
  const scoreColor = score !== undefined ? getScoreColor(score) : '';

  return (
    <div className="bg-[#161b22] p-6 rounded-lg border border-gray-800 h-full shadow-xl flex flex-col">
        <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-semibold text-gray-200">{title}</h2>
            {score !== undefined && (
                <div className="text-right">
                    <p className={`text-3xl font-bold ${scoreColor}`}>{score}</p>
                    <p className={`text-xs font-semibold ${scoreColor}`}>
                        {score >= 80 ? 'Low Risk' : score >= 50 ? 'Medium Risk' : 'High Risk'}
                    </p>
                </div>
            )}
        </div>
        <div className="flex-grow">
            <ResponsiveContainer width="100%" height={250}>
                {/* MODIFIED: Reduced outerRadius and updated PolarAngleAxis */}
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
                    <PolarGrid stroke="#4a5568" />
                    <PolarAngleAxis dataKey="name" tick={<CustomizedAngleTick />} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'transparent' }} />
                    <Radar name="Score" dataKey="score" stroke={color} fill={color} fillOpacity={0.6} />
                    <Tooltip content={<CustomTooltip />} />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
};
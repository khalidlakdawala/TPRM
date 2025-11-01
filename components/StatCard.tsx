import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  onClick?: () => void;
  colorClass?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtext, onClick, colorClass = 'text-white' }) => {
  const cardClasses = `bg-[#161b22] p-6 rounded-lg border border-gray-800 ${onClick ? 'cursor-pointer hover:bg-[#1c2128] transition-colors' : ''}`;
  
  return (
    <div className={cardClasses} onClick={onClick}>
      <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
      <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
      {subtext && <p className="text-xs text-gray-500 mt-1 truncate">{subtext}</p>}
    </div>
  );
};

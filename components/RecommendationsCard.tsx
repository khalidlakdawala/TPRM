import React from 'react';

interface RecommendationsCardProps {
  recommendations: string[];
}

const LightBulbIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-3 text-yellow-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.311a7.5 7.5 0 0 1-7.5 0c-1.453 0-2.824.22-4.125.608M12 3.75a3.75 3.75 0 0 1 3.75 3.75v1.5a3.75 3.75 0 0 1-7.5 0v-1.5A3.75 3.75 0 0 1 12 3.75Z" />
    </svg>
);

export const RecommendationsCard: React.FC<RecommendationsCardProps> = ({ recommendations }) => {
  return (
    <div className="bg-[#161b22] p-6 rounded-lg border border-gray-800 mt-8 shadow-xl">
        <h2 className="text-xl font-bold text-gray-200 mb-4 flex items-center">
            <LightBulbIcon />
            AI-Powered Recommendations
        </h2>
        <ul className="space-y-3">
            {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 mt-1 text-cyan-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-gray-300">{rec}</p>
                </li>
            ))}
        </ul>
    </div>
  );
};

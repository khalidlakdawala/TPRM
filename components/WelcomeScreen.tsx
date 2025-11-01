
import React from 'react';

export const WelcomeScreen: React.FC = () => {
  return (
    <div className="text-center p-8 bg-[#161b22] border border-dashed border-gray-700 rounded-lg animate-fade-in">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 10l.01.01" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 16l.01.01" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 12h.01" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h.01" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 8l.01.01" />
        </svg>
      <h2 className="mt-4 text-2xl font-semibold text-gray-300">Ready to Analyze</h2>
      <p className="mt-2 text-gray-500">
        Enter a vendor's domain above to begin the threat intelligence assessment. The AI will perform a live analysis and generate a comprehensive security report. Your reports will be saved locally for future reference.
      </p>
    </div>
  );
};
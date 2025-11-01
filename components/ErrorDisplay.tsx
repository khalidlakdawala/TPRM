
import React from 'react';

interface ErrorDisplayProps {
  message: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div className="bg-red-900/50 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg relative mt-6" role="alert">
        <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
                <strong className="font-bold">An Error Occurred</strong>
                <span className="block sm:inline ml-2">{message}</span>
            </div>
        </div>
    </div>
  );
};

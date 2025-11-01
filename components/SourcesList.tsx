
import React from 'react';
import { Source } from '../types';

interface SourcesListProps {
  sources: Source[];
}

export const SourcesList: React.FC<SourcesListProps> = ({ sources }) => {
  if (sources.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#161b22] p-6 rounded-lg border border-gray-800 mt-8 shadow-xl">
      <h2 className="text-xl font-bold text-gray-200 mb-4">Intelligence Sources</h2>
      <ul className="space-y-3">
        {sources.map((source, index) => (
          <li key={index} className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 mt-1 text-cyan-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
            </svg>
            <a
              href={source.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors duration-200 break-all"
            >
              {source.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

import React from 'react';
import { User } from '../types';

interface HeaderProps {
    onOpenSettings: () => void;
    currentUser: User | null;
    onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, currentUser, onLogout }) => {
  return (
    <header className="bg-[#161b22] border-b border-gray-800 p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mr-3 text-cyan-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-200 tracking-wide">
            Vendor Threat Intelligence Analyzer
            </h1>
        </div>
        <div className="flex items-center gap-4">
            {currentUser && (
                 <div className="flex items-center gap-4">
                    <div className="text-left hidden sm:block">
                        <p className="text-sm text-gray-300">{currentUser.email}</p>
                        <p className="text-xs text-gray-500">Signed In</p>
                    </div>
                     <button className="p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label="Profile">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-gray-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                    </button>
                    <button onClick={onOpenSettings} className="p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label="Settings">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.007 1.11-1.226l.28-.1c.34-.125.702-.125 1.043 0l.28.1c.55.219 1.02.684 1.11 1.226l.09.542-.09.542c-.09.542-.56 1.007-1.11 1.226l-.28.1c-.34.125-.702-.125-1.043 0l-.28-.1c-.55-.219-1.02-.684-1.11-1.226l-.09-.542.09-.542Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.25V7.5a2.25 2.25 0 0 1 2.25-2.25h1.5M3 15.75V16.5a2.25 2.25 0 0 0 2.25 2.25h1.5M21 8.25V7.5a2.25 2.25 0 0 0-2.25-2.25h-1.5M21 15.75V16.5a2.25 2.25 0 0 1-2.25-2.25h-1.5" />
                        </svg>
                    </button>
                    <button onClick={onLogout} className="p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label="Logout">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};

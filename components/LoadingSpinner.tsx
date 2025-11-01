
import React from 'react';

const loadingMessages = [
    "Contacting Threat Intelligence Satellites...",
    "Scanning the Deep Web for Chatter...",
    "Analyzing DNS Records and IP Reputations...",
    "Correlating Data from Global Security Feeds...",
    "Compiling Vulnerability Reports...",
    "Finalizing Risk Assessment Matrix..."
];

interface LoadingSpinnerProps {
    progressMessage?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ progressMessage }) => {
    const [messageIndex, setMessageIndex] = React.useState(0);

    React.useEffect(() => {
        if (progressMessage) return; // Don't cycle messages if a specific one is provided

        const intervalId = setInterval(() => {
            setMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length);
        }, 2500);

        return () => clearInterval(intervalId);
    }, [progressMessage]);

    return (
        <div className="text-center p-8 bg-[#161b22]/50 rounded-lg">
            <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-cyan-500 border-l-cyan-500 border-b-transparent border-r-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-xl font-semibold mt-6 text-gray-200">Analysis in Progress</h2>
            <p className="text-gray-400 mt-2 transition-opacity duration-500 h-6">
                {progressMessage || loadingMessages[messageIndex]}
            </p>
        </div>
    );
};
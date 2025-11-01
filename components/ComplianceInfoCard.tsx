import React from 'react';
import { ComplianceInfo } from '../types';

const LinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-gray-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
    </svg>
);

const BadgeCheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-gray-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const DocumentTextIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-gray-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
);

const isFound = (url?: string): boolean => {
    return !!url && url.toLowerCase() !== 'not found' && url.startsWith('http');
}

const InfoLink: React.FC<{label: string; url?: string}> = ({ label, url }) => (
    <div>
        <h4 className="font-semibold text-gray-400 mb-2 flex items-center">
            <LinkIcon /> {label}
        </h4>
        {isFound(url) ? (
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-400 hover:underline break-all">{url}</a>
        ) : (
            <p className="text-sm text-gray-500">Not Found</p>
        )}
    </div>
);

const InfoList: React.FC<{label: string; items?: string[]; icon: React.ReactElement}> = ({ label, items, icon }) => (
    <div>
        <h4 className="font-semibold text-gray-400 mb-2 flex items-center">
            {icon} {label}
        </h4>
        {(items && items.length > 0) ? (
            <ul className="space-y-1">
                {items.map((item, index) => (
                    <li key={index} className="text-sm text-gray-300 bg-gray-800/50 px-3 py-1 rounded-md">{item}</li>
                ))}
            </ul>
        ) : (
             <p className="text-sm text-gray-500">None specified</p>
        )}
    </div>
);

interface ComplianceInfoCardProps {
  compliance: ComplianceInfo;
}

export const ComplianceInfoCard: React.FC<ComplianceInfoCardProps> = ({ compliance }) => {
  return (
    <div className="bg-[#161b22] p-6 rounded-lg border border-gray-800 mt-8 shadow-xl">
        <h2 className="text-xl font-bold text-gray-200 mb-6">Compliance & Legal Posture</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <InfoLink label="Privacy Policy" url={compliance.privacyPolicyUrl} />
                <InfoLink label="Data Processing Agreement (DPA)" url={compliance.dpaUrl} />
            </div>
            <div className="space-y-6">
                <InfoList label="Published Certifications" items={compliance.certifications} icon={<BadgeCheckIcon />} />
                <InfoList label="Law Compliance" items={compliance.laws} icon={<DocumentTextIcon />} />
            </div>
        </div>
    </div>
  );
};
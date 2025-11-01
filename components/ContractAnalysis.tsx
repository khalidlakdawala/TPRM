import React, { useState } from 'react';
import { ContractAnalysisResult } from '../types';

// Add type definition for the pdf.js library when loaded via script tag
declare global {
    interface Window {
        pdfjsLib: any;
    }
}

// --- Icon Components ---
const FileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-3 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-green-400"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-red-400"><path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const LoadingSpinnerIcon = () => <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

// --- Type Definitions ---
interface ContractAnalysisProps {
    reportId: number;
    analysisData?: ContractAnalysisResult;
    onAnalyzeContract: (reportId: number, text: string) => void;
    isLoading: boolean;
}

// --- Main Component ---
export const ContractAnalysis: React.FC<ContractAnalysisProps> = ({ reportId, analysisData, onAnalyzeContract, isLoading }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isParsing, setIsParsing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type === 'text/plain' || selectedFile.type === 'application/pdf') {
                setFile(selectedFile);
                setError(null);
            } else {
                setError('Invalid file type. Please upload a .txt or .pdf file.');
                setFile(null);
            }
        }
    };

    const handleAnalyze = async () => {
        if (!file) return setError('Please select a file first.');
        
        setIsParsing(true);
        setError(null);

        try {
            let text = '';
            if (file.type === 'application/pdf') {
                // Use the pdf.js library loaded globally from the <script> tag in index.html
                const { pdfjsLib } = window;
                if (!pdfjsLib) {
                    throw new Error('PDF library is not loaded. Please check your internet connection and refresh the page.');
                }
                // Set the worker source to the same CDN and version.
                pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map((item: any) => ('str' in item ? item.str : null)).filter(Boolean).join(' ');
                    fullText += pageText + '\n\n';
                }
                text = fullText;
            } else {
                text = await file.text();
            }
            onAnalyzeContract(reportId, text);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to process file. It may be corrupt, password-protected, or a network error prevented the PDF reader from loading. Details: ${errorMessage}`);
            console.error("PDF Processing Error:", err);
        } finally {
            setIsParsing(false);
        }
    };
    
    // --- Render Logic ---
    const isProcessing = isLoading || isParsing;
    const isAnalyzeDisabled = !file || isProcessing;

    const renderUploadArea = () => {
        return (
            <div className="space-y-4">
                <p className="text-sm text-gray-400">
                    Upload the vendor's contract or MSA as a plain text (.txt) or PDF (.pdf) file. The AI will review it for key cybersecurity and data privacy clauses.
                </p>
                <div className="flex items-center gap-4">
                    <label htmlFor="contract-upload" className="cursor-pointer inline-flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition duration-200">
                        Upload File
                    </label>
                    <input id="contract-upload" type="file" accept=".txt,.pdf" className="hidden" onChange={handleFileChange} />
                    {file && <span className="text-sm text-gray-400">{file.name}</span>}
                </div>
                
                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzeDisabled}
                    className="w-full md:w-auto flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isProcessing ? <LoadingSpinnerIcon /> : null}
                    {isParsing ? 'Processing File...' : isLoading ? 'Analyzing...' : 'Analyze Contract'}
                </button>
            </div>
        );
    };

    const renderAnalysisResult = () => {
        if (!analysisData) return null;
        return (
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h3 className="text-lg font-semibold text-green-400 mb-2 flex items-center"><CheckCircleIcon />Strengths</h3>
                    <ul className="space-y-2 list-inside">
                        {analysisData.strengths.map((item, index) => <li key={index} className="text-gray-300 bg-green-900/20 p-2 rounded-md border-l-4 border-green-500">{item}</li>)}
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-red-400 mb-2 flex items-center"><XCircleIcon />Weaknesses</h3>
                    <ul className="space-y-2 list-inside">
                        {analysisData.weaknesses.map((item, index) => <li key={index} className="text-gray-300 bg-red-900/20 p-2 rounded-md border-l-4 border-red-500">{item}</li>)}
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">Overall Assessment</h3>
                    <p className="text-gray-300 bg-gray-800/50 p-3 rounded-md">{analysisData.overallAssessment}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-[#161b22] p-6 rounded-lg border border-gray-800 mt-8 shadow-xl">
            <h2 className="text-xl font-bold text-gray-200 mb-4 flex items-center">
                <FileIcon />
                Contract & MSA Analysis
            </h2>
            {analysisData ? renderAnalysisResult() : renderUploadArea()}
        </div>
    );
};
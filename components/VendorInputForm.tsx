import React, { useState, useEffect, useRef } from 'react';

type ScanType = 'quick' | 'full';
type Vendor = { name: string; domain: string };

interface VendorInputFormProps {
  onAnalyze: (domain: string, name: string, scanType: ScanType) => void;
  onBulkAnalyze: (vendors: Vendor[], scanType: ScanType) => void;
  isLoading: boolean;
  bulkScanProgress: { current: number; total: number } | null;
}

export const VendorInputForm: React.FC<VendorInputFormProps> = ({ onAnalyze, onBulkAnalyze, isLoading, bulkScanProgress }) => {
  const [domain, setDomain] = useState('');
  const [name, setName] = useState('');
  const [scanType, setScanType] = useState<ScanType>('full');
  const [bulkVendors, setBulkVendors] = useState<Vendor[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [csvError, setCsvError] = useState<string | null>(null);
  
  // FIX: Initialize useRef with a default value to resolve the error.
  const prevIsLoadingRef = useRef<boolean>(false);
  useEffect(() => {
    prevIsLoadingRef.current = isLoading;
  });
  const wasLoading = prevIsLoadingRef.current;

  useEffect(() => {
    // If we were loading and now we're not, the scan has finished.
    // If it was a bulk scan (bulkVendors had items), clear the state.
    if (wasLoading && !isLoading && bulkVendors.length > 0) {
      setBulkVendors([]);
      setFileName('');
      const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  }, [isLoading, wasLoading, bulkVendors.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkVendors.length > 0) {
      onBulkAnalyze(bulkVendors, scanType);
    } else {
      onAnalyze(domain, name, scanType);
    }
  };

  const parseCsv = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split(/[\r\n]+/).filter(row => row.trim() !== '').slice(1); // Assume header, split on new lines, ignore empty lines
      const parsed = rows
        .map(row => {
          const columns = row.split(',');
          const name = columns[0]?.trim().replace(/"/g, '') || '';
          const domain = columns[1]?.trim().replace(/"/g, '') || '';
          return { name, domain };
        })
        .filter(v => v.domain && v.domain.includes('.')); // Basic validation for domain
      
      if (parsed.length > 0) {
        setBulkVendors(parsed);
      } else {
        setCsvError("No valid vendors found. Ensure the CSV has a header row and is formatted as 'Vendor Name,vendor.domain'.");
        setFileName('');
        const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setCsvError(null); // Clear previous errors
    setBulkVendors([]); // Clear previous vendors
    
    if (file) {
      setFileName(file.name);
      parseCsv(file);
    } else {
      setFileName('');
    }
  };

  const ScanTypeButton: React.FC<{ type: ScanType; label: string }> = ({ type, label }) => (
    <button
      type="button"
      onClick={() => setScanType(type)}
      disabled={isLoading}
      className={`w-1/2 rounded py-1.5 text-sm font-semibold transition-colors duration-200 ${
        scanType === type
          ? 'bg-cyan-600 text-white'
          : 'text-gray-400 hover:bg-gray-700/50'
      }`}
    >
      {label}
    </button>
  );

  const hasBulkVendors = bulkVendors.length > 0;
  const isBulkScanning = isLoading && bulkScanProgress;

  return (
    <div className="bg-[#161b22] p-6 rounded-lg border border-gray-800 shadow-xl">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="vendor-name" className="block text-sm font-medium text-gray-400 mb-2">
              Vendor Name (Optional)
            </label>
            <input
              id="vendor-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Example Corp"
              className="w-full bg-[#0d1117] border border-gray-700 rounded-md px-4 py-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 disabled:opacity-50"
              disabled={isLoading || hasBulkVendors}
            />
          </div>
          <div>
            <label htmlFor="vendor-domain" className="block text-sm font-medium text-gray-400 mb-2">
              Vendor Domain (Required)
            </label>
            <input
              id="vendor-domain"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g., example.com"
              className="w-full bg-[#0d1117] border border-gray-700 rounded-md px-4 py-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 disabled:opacity-50"
              disabled={isLoading || hasBulkVendors}
              required={!hasBulkVendors}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Scan Type</label>
                 <div className="flex rounded-md bg-[#0d1117] border border-gray-700 p-1">
                    <ScanTypeButton type="full" label="Full Scan" />
                    <ScanTypeButton type="quick" label="Quick Scan" />
                </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading || (!hasBulkVendors && !domain)}
                className="w-full md:w-auto flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBulkScanning ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Scanning...
                  </>
                ) : hasBulkVendors ? `Analyze ${bulkVendors.length} Vendors` : 'Analyze Vendor'}
              </button>
            </div>
        </div>
      </form>
      <div className="mt-6 pt-6 border-t border-gray-800">
        <div className="flex items-center gap-4">
          <label htmlFor="csv-upload" className={`cursor-pointer inline-flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" /></svg>
            Upload CSV
          </label>
          <input id="csv-upload" type="file" accept=".csv" className="hidden" onChange={handleFileChange} disabled={isLoading} />
          {fileName && !csvError && <span className="text-sm text-gray-400">File: {fileName}</span>}
        </div>
        <p className="text-xs text-gray-500 mt-2 pl-1">Expected format: A CSV file with a header row, and columns for 'Name' and 'Domain'.</p>
        {csvError && <p className="text-sm text-red-400 mt-2">{csvError}</p>}
        {isBulkScanning && (
          <div className="mt-4 animate-fade-in">
            <div className="flex justify-between mb-1">
              <span className="text-base font-medium text-cyan-400">Bulk Scan Progress</span>
              <span className="text-sm font-medium text-cyan-400">{bulkScanProgress.current} of {bulkScanProgress.total}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-cyan-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${(bulkScanProgress.current / bulkScanProgress.total) * 100}%` }}>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
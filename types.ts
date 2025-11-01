
export interface User {
  id: number;
  email: string;
  passwordHash: string; // In this local-only setup, this will be plain text.
}

export interface ComplianceInfo {
    privacyPolicyUrl?: string;
    dpaUrl?: string;
    certifications?: string[];
    laws?: string[];
}

// NEW: Added interface for contract analysis results
export interface ContractAnalysisResult {
    strengths: string[];
    weaknesses: string[];
    overallAssessment: string;
}

export interface AnalysisResult {
  vendorName: string;
  overallScore: number;
  securityPostureScore: number;
  threatExposureScore: number;
  summary: string;
  riskFactors: RiskFactor[];
  compliance?: ComplianceInfo;
  recommendations?: string[];
}

export interface Source {
  title: string;
  uri: string;
}

export interface StoredReport {
  id?: number; // Add unique ID for IndexedDB key
  userId: number; // Foreign key to the user
  domain: string;
  vendorName:string;
  result: AnalysisResult;
  sources: Source[];
  timestamp: number;
  scanType: 'quick' | 'full';
  contractAnalysis?: ContractAnalysisResult; // NEW: Added optional field for contract analysis
}

export type AIProvider = 'gemini' | 'ollama';

export interface Settings {
    provider: AIProvider;
    ollamaModel: string;
    ollamaUrl: string;
    postureWeight: number;
    exposureWeight: number;
}

// Add the RiskFactor interface back in, as it was implicitly used but not exported.
export interface RiskFactor {
  name: string;
  score: number;
  summary: string;
  references?: string[];
}
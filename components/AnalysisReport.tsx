
import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { StoredReport, RiskFactor } from '../types';
import { SummaryScore } from './SummaryScore';
import { RiskRadarChart } from './ScoreChart';
import { RiskFactorGrid } from './RiskFactorGrid';
import { SourcesList } from './SourcesList';
import { ComplianceInfoCard } from './ComplianceInfoCard';
import { RecommendationsCard } from './RecommendationsCard';
import { ContractAnalysis } from './ContractAnalysis';

interface AnalysisReportProps {
  report: StoredReport;
  isContractLoading: boolean;
  onAnalyzeContract: (reportId: number, contractText: string) => void;
}

const POSTURE_FACTORS = [
  'Network Security',
  'DNS Health',
  'Patching Cadence',
  'Endpoint Security',
  'IP Reputation',
  'Application Security',
  'Cubit Score',
  'Privacy',
  'Email Security (SPF, DKIM, DMARC)',
  'SSL/TLS Configuration',
];

const THREAT_FACTORS = [
  'Hacker Chatter',
  'Information Leak',
  'Social Engineering',
  'Known Breach',
];

const filterFactors = (factors: RiskFactor[], factorList: string[]): RiskFactor[] => {
    return factors.filter(factor => factorList.includes(factor.name));
};

export const AnalysisReport: React.FC<AnalysisReportProps> = ({ report, isContractLoading, onAnalyzeContract }) => {
  const { result, sources, id: reportId } = report;
  const postureData = filterFactors(result.riskFactors, POSTURE_FACTORS);
  const threatData = filterFactors(result.riskFactors, THREAT_FACTORS);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleExportPdf = async () => {
    const element = reportRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, { 
      scale: 2,
      backgroundColor: '#0d1117'
    });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'px',
      format: [canvas.width, canvas.height],
      hotfixes: ['px_scaling'],
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`Vendor_Report_${result.vendorName.replace(/\s/g, '_')}.pdf`);
  };

  return (
    <div ref={reportRef} className="space-y-8 animate-fade-in bg-[#0d1117] p-1">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <SummaryScore score={result.overallScore} summary={result.summary} vendorName={result.vendorName} onExportPdf={handleExportPdf} />
        </div>
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            {postureData.length > 0 && 
                <RiskRadarChart 
                    title="Security Posture"
                    data={postureData} 
                    color="#2dd4bf" // Teal
                    score={result.securityPostureScore}
                />
            }
            {threatData.length > 0 &&
                <RiskRadarChart 
                    title="Threat Exposure"
                    data={threatData}
                    color="#f59e0b" // Amber
                    score={result.threatExposureScore}
                />
            }
        </div>
      </div>
      <RiskFactorGrid riskFactors={result.riskFactors} />
      {result.recommendations && result.recommendations.length > 0 && (
          <RecommendationsCard recommendations={result.recommendations} />
      )}
      {result.compliance && <ComplianceInfoCard compliance={result.compliance} />}
      <SourcesList sources={sources} />
      {reportId && (
        <ContractAnalysis 
          reportId={reportId}
          analysisData={report.contractAnalysis}
          onAnalyzeContract={onAnalyzeContract}
          isLoading={isContractLoading}
        />
      )}
    </div>
  );
};
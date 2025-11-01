import React, { useMemo, useState } from 'react';
import { StoredReport, ComplianceInfo } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { StatCard } from './StatCard';
import { RiskFactorDetailModal } from './RiskFactorDetailModal';

interface AnalyticsProps {
  reports: StoredReport[];
  onViewReport: (report: StoredReport) => void;
}

const ChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0d1117] p-2 border border-gray-700 rounded-md shadow-lg text-sm">
                <p className="label font-bold text-cyan-400">{label}</p>
                {payload.map((p: any, index: number) => (
                    <p key={index} style={{ color: p.color || '#c9d1d9' }}>
                        {`${p.name}: ${p.value.toFixed(1)}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return '#4ade80'; // green-400
  if (score >= 50) return '#facc15'; // yellow-400
  return '#f87171'; // red-400
};

const getScoreColorClass = (score: number): string => {
    if (score >= 80) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
};
const getScoreBgClass = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
};

const VENDOR_COLORS = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
    '#a4de6c', '#d0ed57', '#8dd1e1', '#83a6ed', '#8b4513', '#ffc0cb', '#fa8072', '#7b68ee'
];

type BadgeInfo = { key: string; label: string; value: string; color: string };

const Badge: React.FC<{badge: BadgeInfo}> = ({badge}) => (
    <div className="relative group flex-shrink-0">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.color}`}>
            {badge.key.length > 10 ? badge.key.substring(0, 8) + '...' : badge.key}
        </span>
        <span className="absolute bottom-full mb-2 w-max max-w-xs left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 text-white text-xs px-2 py-1 rounded-md opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none z-10 break-all">
            <strong className="font-bold">{badge.label}:</strong> {badge.value}
        </span>
    </div>
);

const ComplianceIndicators: React.FC<{ compliance?: ComplianceInfo }> = ({ compliance }) => {
    if (!compliance) return <span className="text-xs text-gray-500">N/A</span>;

    const indicators: BadgeInfo[] = [];

    const isFound = (url?: string) => url && url.toLowerCase() !== 'not found' && url.startsWith('http');

    if (isFound(compliance.privacyPolicyUrl)) {
        indicators.push({ key: 'P', label: 'Privacy Policy', value: compliance.privacyPolicyUrl!, color: 'bg-blue-900/50 text-blue-400 border border-blue-500/30' });
    }
    if (isFound(compliance.dpaUrl)) {
        indicators.push({ key: 'D', label: 'DPA', value: compliance.dpaUrl!, color: 'bg-indigo-900/50 text-indigo-400 border border-indigo-500/30' });
    }

    const certs = (compliance.certifications || []).map(c => ({ key: c, label: 'Certification', value: c, color: 'bg-teal-900/50 text-teal-400 border border-teal-500/30' }));
    const laws = (compliance.laws || []).map(l => ({ key: l, label: 'Law Compliance', value: l, color: 'bg-gray-700/50 text-gray-400 border border-gray-600/50' }));
    
    const allBadges: BadgeInfo[] = [...indicators, ...certs, ...laws];
    
    if (allBadges.length === 0) return <span className="text-xs text-gray-500">None Found</span>;

    return (
        <div className="flex flex-wrap gap-1.5 items-center max-w-xs">
            {allBadges.slice(0, 3).map(badge => <Badge key={badge.key + badge.value} badge={badge} />)}
            {allBadges.length > 3 && (
                <div className="relative group flex-shrink-0">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
                        +{allBadges.length - 3}
                    </span>
                     <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-56 bg-gray-900 border border-gray-700 text-white text-xs p-2 rounded-md opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none z-10 space-y-1">
                        <p className="font-bold border-b border-gray-600 pb-1 mb-1">Additional Items:</p>
                        {allBadges.slice(3).map(b => (
                            <div key={b.key + b.value} className="truncate">
                                <strong className="font-semibold">{b.label}:</strong> {b.value}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const AnalyticsDashboard: React.FC<AnalyticsProps> = ({ reports, onViewReport }) => {
  const [selectedFactor, setSelectedFactor] = useState<string | null>(null);

  const analyticsData = useMemo(() => {
    const totalReports = reports.length;
    const averageOverallScore = reports.length > 0 ? reports.reduce((acc, report) => acc + report.result.overallScore, 0) / totalReports : 0;

    const riskFactorScores: { [key: string]: { total: number; count: number } } = {};
    reports.forEach(report => {
      report.result.riskFactors.forEach(factor => {
        if (!riskFactorScores[factor.name]) {
          riskFactorScores[factor.name] = { total: 0, count: 0 };
        }
        riskFactorScores[factor.name].total += factor.score;
        riskFactorScores[factor.name].count += 1;
      });
    });

    const riskFactorAverages = Object.entries(riskFactorScores)
        .map(([name, data]) => ({ name, score: data.total / data.count }))
        .sort((a, b) => a.score - b.score);

    const latestReports = new Map<string, StoredReport>();
    reports.forEach(report => {
        const key = report.vendorName || report.domain;
        if (!latestReports.has(key) || report.timestamp > latestReports.get(key)!.timestamp) {
            latestReports.set(key, report);
        }
    });
    
    const uniqueVendors = Array.from(latestReports.values());
    const scoreDistribution = {
        low: uniqueVendors.filter(r => r.result.overallScore >= 80).length,
        medium: uniqueVendors.filter(r => r.result.overallScore >= 50 && r.result.overallScore < 80).length,
        high: uniqueVendors.filter(r => r.result.overallScore < 50).length,
    };

    const allVendorNames = [...new Set(reports.map(r => r.vendorName || r.domain))];
    const monthlyReports: { [month: string]: StoredReport[] } = {};
    reports.forEach(report => {
        const month = new Date(report.timestamp).toLocaleString('default', { month: 'short', year: '2-digit' });
        if (!monthlyReports[month]) {
            monthlyReports[month] = [];
        }
        monthlyReports[month].push(report);
    });

    const sortedTimestamps = [...new Set(reports.map(r => r.timestamp))].sort((a, b) => a - b);
    const uniqueMonths = [...new Set(sortedTimestamps.map(ts => new Date(ts).toLocaleString('default', { month: 'short', year: '2-digit' })))];
    
    const scoreTrend = uniqueMonths.map(month => {
        const monthReports = monthlyReports[month];
        const dataPoint: { [key: string]: string | number } = { name: month };

        const monthlyTotalScore = monthReports.reduce((acc, r) => acc + r.result.overallScore, 0);
        dataPoint['Average Score'] = monthlyTotalScore / monthReports.length;

        allVendorNames.forEach(vendorName => {
            const vendorReportsInMonth = monthReports.filter(r => (r.vendorName || r.domain) === vendorName);
            if (vendorReportsInMonth.length > 0) {
                const vendorTotalScore = vendorReportsInMonth.reduce((acc, r) => acc + r.result.overallScore, 0);
                dataPoint[vendorName] = vendorTotalScore / vendorReportsInMonth.length;
            }
        });
        return dataPoint;
    });

    const vendors = new Map<string, { reports: StoredReport[] }>();
    reports.forEach(report => {
        const name = report.vendorName || report.domain;
        if (!vendors.has(name)) {
            vendors.set(name, { reports: [] });
        }
        vendors.get(name)!.reports.push(report);
    });

    const vendorPerformance = Array.from(vendors.entries()).map(([name, data]) => {
        const latestReport = data.reports.sort((a, b) => b.timestamp - a.timestamp)[0];
        return {
            name,
            domain: latestReport.domain,
            lastScore: latestReport.result.overallScore,
            securityScore: latestReport.result.securityPostureScore,
            threatScore: latestReport.result.threatExposureScore,
            reportsCount: data.reports.length,
            latestReport: latestReport,
            compliance: latestReport.result.compliance,
        };
    }).sort((a, b) => a.name.localeCompare(b.name));

    const bestPerformingVendor = uniqueVendors.length > 0 ? [...uniqueVendors].sort((a, b) => b.result.overallScore - a.result.overallScore)[0] : null;
    const worstPerformingVendor = uniqueVendors.length > 0 ? [...uniqueVendors].sort((a, b) => a.result.overallScore - b.result.overallScore)[0] : null;

    return { totalReports, averageOverallScore, riskFactorAverages, vendorPerformance, bestPerformingVendor, worstPerformingVendor, scoreDistribution, scoreTrend, allVendorNames };
  }, [reports]);

  const { totalReports, averageOverallScore, riskFactorAverages, vendorPerformance, bestPerformingVendor, worstPerformingVendor, scoreDistribution, scoreTrend, allVendorNames } = analyticsData;
  const distributionData = [
      { name: 'Low Risk', value: scoreDistribution.low },
      { name: 'Medium Risk', value: scoreDistribution.medium },
      { name: 'High Risk', value: scoreDistribution.high },
  ];
  const COLORS = ['#4ade80', '#facc15', '#f87171'];

  return (
    <>
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-gray-200 mb-4">Dashboard Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Reports" value={totalReports} />
            <StatCard title="Average Overall Score" value={averageOverallScore.toFixed(1)} />
            {bestPerformingVendor && (
              <StatCard 
                title="Lowest Risk Vendor" 
                value={bestPerformingVendor.result.overallScore} 
                subtext={bestPerformingVendor.vendorName}
                colorClass="text-green-400"
                onClick={() => onViewReport(bestPerformingVendor)}
              />
            )}
            {worstPerformingVendor && (
              <StatCard 
                title="Highest Risk Vendor" 
                value={worstPerformingVendor.result.overallScore}
                subtext={worstPerformingVendor.vendorName}
                colorClass="text-red-400"
                onClick={() => onViewReport(worstPerformingVendor)}
              />
            )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-[#161b22] p-6 rounded-lg border border-gray-800">
            <h2 className="text-xl font-bold text-gray-200 mb-4">Risk Distribution</h2>
            <p className="text-sm text-gray-500 mb-6">Breakdown of vendors by risk category.</p>
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <Pie data={distributionData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name">
                        {distributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend formatter={(value, entry) => <span className="text-gray-300">{value} ({entry.payload?.value})</span>} />
                </PieChart>
            </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2 bg-[#161b22] p-6 rounded-lg border border-gray-800">
            <h2 className="text-xl font-bold text-gray-200 mb-4">Score Trend Over Time</h2>
            <p className="text-sm text-gray-500 mb-6">Average score of all reports generated per month.</p>
             <ResponsiveContainer width="100%" height={250}>
                <LineChart data={scoreTrend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                    <XAxis dataKey="name" stroke="#a0aec0" fontSize={12} />
                    <YAxis domain={[0, 100]} stroke="#a0aec0" fontSize={12} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="Average Score" stroke="#2dd4bf" strokeWidth={3} dot={{ r: 5, strokeWidth: 2, fill: '#2dd4bf' }} activeDot={{ r: 8 }} />
                    {allVendorNames.map((vendorName, index) => (
                        <Line key={vendorName} connectNulls type="monotone" dataKey={vendorName} stroke={VENDOR_COLORS[index % VENDOR_COLORS.length]} strokeWidth={1} dot={{r: 2}} activeDot={{r: 6}} />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-[#161b22] p-6 rounded-lg border border-gray-800">
        <h2 className="text-xl font-bold text-gray-200 mb-4">Vendor KPI Overview</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-[#0d1117]">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-300 sm:pl-6">Vendor Name</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300">Domain</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300">Overall Score</th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-300">Security Score</th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-300">Threat Score</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300">Compliance Indicators</th>
                <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-300">Reports #</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {vendorPerformance.map((vendor) => (
                <tr key={vendor.name} onClick={() => onViewReport(vendor.latestReport)} className="hover:bg-[#1c2128] cursor-pointer transition-colors">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">{vendor.name}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400 truncate max-w-xs">{vendor.domain}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-bold">
                    <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${getScoreBgClass(vendor.lastScore)}`}></span>
                        <span className={getScoreColorClass(vendor.lastScore)}>{vendor.lastScore}</span>
                    </div>
                  </td>
                  <td className={`whitespace-nowrap px-3 py-4 text-sm font-bold text-right ${getScoreColorClass(vendor.securityScore)}`}>{vendor.securityScore}</td>
                  <td className={`whitespace-nowrap px-3 py-4 text-sm font-bold text-right ${getScoreColorClass(vendor.threatScore)}`}>{vendor.threatScore}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm"><ComplianceIndicators compliance={vendor.compliance} /></td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400 text-center">{vendor.reportsCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-[#161b22] p-6 rounded-lg border border-gray-800">
        <h2 className="text-xl font-bold text-gray-200 mb-4">Weakest Risk Factors (Portfolio Average)</h2>
        <p className="text-sm text-gray-500 mb-6">Average score for each risk category across all vendors. Click a bar for details.</p>
        <ResponsiveContainer width="100%" height={400}>
            <BarChart data={riskFactorAverages} layout="vertical" margin={{ top: 5, right: 20, left: 120, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis type="number" domain={[0, 100]} stroke="#a0aec0" />
                <YAxis dataKey="name" type="category" stroke="#a0aec0" width={150} tick={{ fontSize: 12 }} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(45, 55, 72, 0.5)' }} />
                <Bar dataKey="score" background={{ fill: 'rgba(45, 55, 72, 0.3)' }} cursor="pointer" onClick={(data) => setSelectedFactor(data.name)}>
                    {riskFactorAverages.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
    {selectedFactor && (
        <RiskFactorDetailModal 
            factorName={selectedFactor}
            reports={reports}
            onClose={() => setSelectedFactor(null)}
        />
    )}
    </>
  );
};
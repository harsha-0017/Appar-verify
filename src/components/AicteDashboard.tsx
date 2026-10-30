import React, { useState } from 'react';
import { AnomalyAlert, Institution, Student, AuditLogItem } from '../types/apaar';
import { 
  AlertTriangle, CheckCircle, ShieldAlert, FileText, ArrowUpRight, 
  Search, Filter, Send, Download, Eye, RefreshCw, BarChart3, Users
} from 'lucide-react';

interface AicteDashboardProps {
  institutions: Institution[];
  students: Student[];
  anomalies: AnomalyAlert[];
  auditLogs: AuditLogItem[];
  onResolveAnomaly: (id: string, action: string) => void;
  onIssueShowCause: (institution: Institution, reason: string) => void;
  onSelectInstitutionForView: (instId: string) => void;
}

export const AicteDashboard: React.FC<AicteDashboardProps> = ({
  institutions,
  students,
  anomalies,
  auditLogs,
  onResolveAnomaly,
  onIssueShowCause,
  onSelectInstitutionForView,
}) => {
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeNoticeModal, setActiveNoticeModal] = useState<{ institution: Institution; reason: string } | null>(null);
  const [noticeDraftText, setNoticeDraftText] = useState<string>('');
  const [selectedAnomalyDetail, setSelectedAnomalyDetail] = useState<AnomalyAlert | null>(null);

  // Aggregates
  const totalApprovedSeats = institutions.reduce((acc, curr) => acc + curr.totalApprovedSeats, 0);
  const totalEnrolled = institutions.reduce((acc, curr) => acc + curr.totalEnrolled, 0);
  const overallUtilization = ((totalEnrolled / totalApprovedSeats) * 100).toFixed(1);
  const criticalAnomalies = anomalies.filter((a) => a.severity === 'critical' && a.status === 'OPEN').length;
  const highRiskInstitutions = institutions.filter((i) => i.riskScore >= 50);

  // Filtered institutions
  const filteredInstitutions = institutions.filter((inst) => {
    const matchesSearch = inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.aictePid.includes(searchQuery) ||
      inst.state.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedRiskFilter === 'all') return true;
    return inst.riskLevel.toLowerCase() === selectedRiskFilter.toLowerCase();
  });

  const handleOpenNotice = (institution: Institution, defaultReason: string) => {
    setActiveNoticeModal({ institution, reason: defaultReason });
    setNoticeDraftText(
      `NOTICE UNDER AICTE REGULATIONS 2026\n` +
      `Ref No: AICTE/ENF/2026/${institution.aictePid}\n` +
      `To: The Principal / Director, ${institution.name} (${institution.aictePid})\n\n` +
      `SUBJECT: Show-Cause Notice regarding Statutory Admission & APAAR Compliance Irregularities\n\n` +
      `1. Ground for Notice: ${defaultReason}\n` +
      `2. You are hereby called upon to show cause within 7 working days from receipt of this electronic notice as to why penal action under Section 10(k) of the AICTE Act 1987 (including withdrawal of approval or admission freeze) should not be initiated against your institution.\n\n` +
      `By Order of Member Secretary,\nAll India Council for Technical Education (AICTE), New Delhi.`
    );
  };

  const handleSendNotice = () => {
    if (activeNoticeModal) {
      onIssueShowCause(activeNoticeModal.institution, activeNoticeModal.reason);
      setActiveNoticeModal(null);
    }
  };

  const exportComplianceReport = () => {
    const reportData = institutions.map((i) => ({
      aictePid: i.aictePid,
      institutionName: i.name,
      state: i.state,
      approvedSeats: i.totalApprovedSeats,
      enrolledStudents: i.totalEnrolled,
      riskScore: i.riskScore,
      riskLevel: i.riskLevel,
      complianceStatus: i.complianceStatus,
      flaggedCount: i.activeFlaggedStudents,
    }));
    const jsonStr = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AICTE_APAAR_Compliance_Audit_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Executive Summary */}
      <div className="bg-slate-900 text-white rounded-xl p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-indigo-400">
              <span>All India Council for Technical Education</span>
              <span aria-hidden="true">·</span>
              <span>Central Student Verification Directorate</span>
              <span aria-hidden="true">·</span>
              <span>NEP 2020 Real-Time Engine</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mt-1 text-white">
              National APAAR Admission & Intake Monitoring Portal
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl">
              Automated audit of student-level records keyed by 12-digit APAAR ID across all AICTE approved technical colleges.
              Prevents duplicate admissions, seat cap overruns, and unverified supernumerary allocations.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={exportComplianceReport}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
            >
              <Download className="w-4 h-4" />
              <span>Export Audit Data</span>
            </button>
          </div>
        </div>

        {/* 4-Column Metric Strip with Tabular Figures */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6">
          <div>
            <div className="text-xs text-slate-400 font-medium">Approved Statutory Intake</div>
            <div className="text-2xl font-bold text-white font-mono tabular-nums mt-1">
              {totalApprovedSeats.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1">Sanctioned AICTE seats</div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">APAAR-Verified Enrolment</div>
            <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums mt-1">
              {totalEnrolled.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1">{overallUtilization}% national occupancy</div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Critical Concurrency Flags</div>
            <div className="text-2xl font-bold text-rose-400 font-mono tabular-nums mt-1">
              {criticalAnomalies}
            </div>
            <div className="text-xs text-slate-500 mt-1">Multi-college active cases</div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Institutions Under Scrutiny</div>
            <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums mt-1">
              {highRiskInstitutions.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">Risk index &ge; 50 / 100</div>
          </div>
        </div>
      </div>

      {/* Live Anomaly Detection Radar Strip */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>Real-Time Anomaly & Concurrency Radar</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live automated alerts detecting cross-institution duplicates, excess intake, and NRI quota spikes.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Automated checks active</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{anomalies.length} total events</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100 mt-4">
          {anomalies.map((alert) => (
            <div key={alert.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 p-2 rounded-lg transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                    alert.severity === 'critical' ? 'bg-rose-100 text-rose-800' :
                    alert.severity === 'high' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {alert.category.replace(/_/g, ' ')}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="font-semibold text-slate-800">{alert.institutionName}</span>
                  <span className="text-slate-400">·</span>
                  <span className="font-mono text-slate-500">{new Date(alert.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="font-semibold text-slate-900 text-sm">{alert.title}</div>
                <p className="text-xs text-slate-600 max-w-4xl">{alert.description}</p>
                {alert.actionTaken && (
                  <div className="text-xs text-indigo-700 bg-indigo-50 p-1.5 rounded font-mono">
                    {alert.actionTaken}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {alert.status === 'NOTICE_ISSUED' ? (
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-200">
                    Notice Dispatched
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        const targetInst = institutions.find((i) => i.id === alert.institutionId) || institutions[0];
                        handleOpenNotice(targetInst, alert.title);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors border border-rose-200"
                    >
                      Issue Show-Cause
                    </button>
                    <button
                      onClick={() => onResolveAnomaly(alert.id, 'Investigation closed: Verified through institute affidavit.')}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                    >
                      Mark Reviewed
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Institutional Risk Matrix & Seat Cap Auditing Table */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <span>Institution Risk Index & Statutory Seat Audits</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Algorithmically calculated risk scores based on seat cap excess, ghost students, and cross-college duplicates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search college, PID, state..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-52"
              />
            </div>

            {/* Risk Filter Segmented Tab Buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {['all', 'low', 'moderate', 'severe'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedRiskFilter(filter)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
                    selectedRiskFilter === filter
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* High-Density Data Grid */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">AICTE PID / College</th>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4 text-right">Intake vs Enrolled</th>
                <th className="py-3 px-4 text-center">Seat Cap Status</th>
                <th className="py-3 px-4 text-center">Risk Score (0-100)</th>
                <th className="py-3 px-4 text-center">Compliance</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredInstitutions.map((inst) => {
                const isOverCap = inst.totalEnrolled > inst.totalApprovedSeats;
                const excessSeats = inst.totalEnrolled - inst.totalApprovedSeats;
                return (
                  <tr key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 text-sm">{inst.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                        <span>PID: {inst.aictePid}</span>
                        <span>·</span>
                        <span>{inst.type}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {inst.city}, {inst.state}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                      <span className="font-semibold text-slate-900">{inst.totalEnrolled}</span>
                      <span className="text-slate-400"> / </span>
                      <span className="text-slate-600">{inst.totalApprovedSeats}</span>
                      <div className="text-[10px] text-slate-500">
                        {((inst.totalEnrolled / inst.totalApprovedSeats) * 100).toFixed(0)}% occupancy
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {isOverCap ? (
                        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-semibold text-[11px] border border-rose-200">
                          <AlertTriangle className="w-3 h-3" />
                          <span>+{excessSeats} Over Cap</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[11px] border border-emerald-200">
                          <CheckCircle className="w-3 h-3" />
                          <span>Within Cap</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <span className={`font-mono font-bold text-sm tabular-nums ${
                          inst.riskScore >= 75 ? 'text-rose-600' :
                          inst.riskScore >= 40 ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {inst.riskScore}
                        </span>
                        <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                          inst.riskScore >= 75 ? 'bg-rose-100 text-rose-800' :
                          inst.riskScore >= 40 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {inst.riskLevel}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`text-[11px] font-semibold ${
                        inst.complianceStatus === 'Notice Issued' ? 'text-rose-700' :
                        inst.complianceStatus === 'Under Review' ? 'text-amber-700' : 'text-slate-700'
                      }`}>
                        {inst.complianceStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectInstitutionForView(inst.id)}
                          title="Inspect Student Roster"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {inst.riskScore >= 50 && (
                          <button
                            onClick={() => handleOpenNotice(inst, `${inst.name} exhibits statutory violations with risk index ${inst.riskScore}/100.`)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition-colors"
                          >
                            Notice
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Show-Cause Notice Dialog Modal */}
      {activeNoticeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base">Issue AICTE Show-Cause Notice</h3>
              </div>
              <button
                onClick={() => setActiveNoticeModal(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Legally Binding Action:</strong> Issuing this notice triggers an automated compliance hold on the institution&apos;s AICTE Portal and requires statutory response within 7 days under Section 10(k).
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notice Content (Official Directorate Draft):
                </label>
                <textarea
                  rows={8}
                  value={noticeDraftText}
                  onChange={(e) => setNoticeDraftText(e.target.value)}
                  className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setActiveNoticeModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendNotice}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Dispatch Statutory Notice</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Institution, Student, ValidationIssue, BatchUploadResult } from '../types/apaar';
import { DEMO_CSV_BATCHES } from '../data/mockData';
import { validateBatchRecords, RawCsvRow, formatApaarId, generateDeterministicHash } from '../lib/apaarValidator';
import { 
  Upload, FileSpreadsheet, CheckCircle2, AlertCircle, AlertTriangle, 
  ArrowRight, Download, RefreshCw, Database, ShieldCheck, Filter, Search, UserCheck
} from 'lucide-react';

interface InstitutionPortalProps {
  institution: Institution;
  institutions: Institution[];
  onSelectInstitution: (instId: string) => void;
  allStudents: Student[];
  onCommitBatch: (newStudents: Student[], issues: ValidationIssue[]) => void;
}

export const InstitutionPortal: React.FC<InstitutionPortalProps> = ({
  institution,
  institutions,
  onSelectInstitution,
  allStudents,
  onCommitBatch,
}) => {
  const [csvContent, setCsvContent] = useState<string>(DEMO_CSV_BATCHES.clean);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [validationResult, setValidationResult] = useState<{
    issues: ValidationIssue[];
    validRows: Partial<Student>[];
    counts: { total: number; valid: number; warnings: number; errors: number };
  } | null>(null);
  const [rosterSearch, setRosterSearch] = useState<string>('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  const [commitSuccessMessage, setCommitSuccessMessage] = useState<string | null>(null);

  // Institution students
  const institutionStudents = allStudents.filter((s) => s.institutionId === institution.id);

  // Parse CSV text into row objects
  const parseCsvText = (text: string): RawCsvRow[] => {
    const lines = text.trim().split('\n').filter((l) => l.trim().length > 0);
    if (lines.length <= 1) return [];

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const rows: RawCsvRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim());
      const rowObj: any = {};
      headers.forEach((h, index) => {
        rowObj[h] = parts[index] || '';
      });
      rows.push({
        apaarId: rowObj.apaarid || rowObj.apaar_id || '',
        name: rowObj.name || rowObj.studentname || '',
        fatherName: rowObj.fathername || rowObj.father_name || '',
        dob: rowObj.dob || '',
        gender: rowObj.gender || 'Male',
        branch: rowObj.branch || '',
        admissionYear: rowObj.admissionyear || rowObj.year || 2026,
        admissionQuota: rowObj.admissionquota || rowObj.quota || 'General',
      });
    }
    return rows;
  };

  const handleRunValidation = () => {
    const rows = parseCsvText(csvContent);
    if (rows.length === 0) {
      alert('Please enter or select valid CSV rows with header');
      return;
    }
    const result = validateBatchRecords(rows, institution, allStudents);
    setValidationResult(result);
    setActiveStep(2);
    setCommitSuccessMessage(null);
  };

  const handleCommit = () => {
    if (!validationResult || validationResult.validRows.length === 0) return;

    const fullStudents: Student[] = validationResult.validRows.map((r, i) => {
      const cleanId = (r.apaarId || '').replace(/\s+/g, '');
      return {
        id: `std-batch-${Date.now()}-${i}`,
        apaarId: cleanId,
        formattedApaarId: formatApaarId(cleanId),
        name: r.name || 'Student',
        fatherName: r.fatherName || 'Not Stated',
        dob: r.dob || '2004-06-15',
        gender: (r.gender as any) || 'Male',
        institutionId: institution.id,
        institutionName: institution.name,
        aictePid: institution.aictePid,
        course: 'B.Tech',
        branch: r.branch || 'Engineering',
        admissionYear: 2026,
        semester: 1,
        admissionQuota: (r.admissionQuota as any) || 'General',
        status: 'Verified',
        digiLockerLinked: true,
        abcAccountId: `ABC-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100 + Math.random() * 900)}`,
        earnedCredits: 0,
        digitalSignatureHash: generateDeterministicHash(cleanId + institution.aictePid),
        signedTimestamp: new Date().toISOString(),
        aadhaarMasked: 'XXXX-XXXX-' + cleanId.slice(-4),
        mobileMasked: 'XXXXXX' + cleanId.slice(-4),
        emailMasked: (r.name || 'student').toLowerCase().replace(/\s+/g, '') + '@domain.edu.in',
        consentTokens: [],
      };
    });

    onCommitBatch(fullStudents, validationResult.issues);
    setCommitSuccessMessage(`Successfully committed ${fullStudents.length} verified student records to the AICTE National Database!`);
    setActiveStep(3);
  };

  const downloadSampleTemplate = () => {
    const headers = 'apaarId,name,fatherName,dob,gender,branch,admissionYear,admissionQuota\n';
    const sample = '984214902831,Aakash Gupta,Ramesh Gupta,2005-04-18,Male,Computer Science & Engineering,2026,General\n';
    const blob = new Blob([headers + sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AICTE_APAAR_Batch_Template.csv';
    a.click();
  };

  // Filtered Roster
  const filteredRoster = institutionStudents.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      s.apaarId.includes(rosterSearch) ||
      s.branch.toLowerCase().includes(rosterSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedBranchFilter === 'all') return true;
    return s.branch.toLowerCase() === selectedBranchFilter.toLowerCase();
  });

  return (
    <div className="space-y-8">
      {/* College Switcher & Profile Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Institution Administration Console</span>
              <span>·</span>
              <span>AICTE PID: <strong className="text-slate-800 font-mono">{institution.aictePid}</strong></span>
              <span>·</span>
              <span>{institution.state}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
              {institution.name}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Submit and validate student admission cohorts keyed by 12-digit APAAR ID. Replaces aggregate numbers with verified, auditable records.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">Switch Institution:</span>
            <select
              aria-label="Switch Current Institution"
              value={institution.id}
              onChange={(e) => onSelectInstitution(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {institutions.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} ({i.aictePid})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 5-Step Methodology Progression Indicator (Slide 3) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-6">
          <div className={`p-3 rounded-lg border text-xs transition-colors ${
            activeStep === 1 ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <div className="font-bold">1. Upload</div>
            <div className="text-[11px] text-slate-500 mt-0.5">CSV / API batch payload</div>
          </div>

          <div className={`p-3 rounded-lg border text-xs transition-colors ${
            activeStep === 2 ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <div className="font-bold">2. Validate</div>
            <div className="text-[11px] text-slate-500 mt-0.5">ID, duplicate & seat caps</div>
          </div>

          <div className={`p-3 rounded-lg border text-xs transition-colors ${
            activeStep === 3 ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <div className="font-bold">3. Store & Seal</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Cryptographic SHA-256 hash</div>
          </div>

          <div className="p-3 rounded-lg border bg-slate-50 border-slate-200 text-xs text-slate-600">
            <div className="font-bold">4. Monitor</div>
            <div className="text-[11px] text-slate-500 mt-0.5">AICTE live risk & caps</div>
          </div>

          <div className="p-3 rounded-lg border bg-slate-50 border-slate-200 text-xs text-slate-600">
            <div className="font-bold">5. Verify</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Signed QR with consent</div>
          </div>
        </div>
      </div>

      {/* Sanctioned Branch Seat Matrices & NRI Supernumerary Quota Tracker */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 flex items-center justify-between pb-4 border-b border-slate-100">
          <span>AICTE Sanctioned Intake vs. Enrolled Records</span>
          <span className="text-xs font-normal text-slate-500">
            Statutory 15% ceiling enforced for NRI / Supernumerary seats
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {institution.branches.map((b) => {
            const isOverIntake = b.currentEnrolled > b.approvedIntake;
            const isOverNri = b.currentNriFn > b.maxNriFnSupernumerary;
            const pct = Math.min(100, (b.currentEnrolled / b.approvedIntake) * 100);

            return (
              <div key={b.code} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-slate-900">{b.name}</span>
                    <div className="text-[11px] text-slate-500 font-mono">Code: {b.code}</div>
                  </div>
                  {isOverIntake ? (
                    <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded">
                      Breached
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                      Compliant
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Seat Occupancy:</span>
                    <span className="font-mono font-semibold tabular-nums text-slate-800">
                      {b.currentEnrolled} / {b.approvedIntake}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOverIntake ? 'bg-rose-500' : pct >= 95 ? 'bg-amber-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px]">
                  <span className="text-slate-500">NRI / Supernumerary:</span>
                  <span className={`font-mono font-semibold tabular-nums ${isOverNri ? 'text-rose-600' : 'text-slate-700'}`}>
                    {b.currentNriFn} / {b.maxNriFnSupernumerary} max (15%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Step 1 & Step 2: Batch Upload & Diagnostic Pre-Commit Engine */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              <span>Step 1: Batch Submission & Automated Pre-Commit Diagnostics</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Paste raw CSV data or select a preset demo batch to test real-time validation against APAAR checksums, duplicates, and seat caps.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadSampleTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV Template</span>
            </button>
          </div>
        </div>

        {/* Demo Batch Selectors for easy testing */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-700">Quick Test Batch Presets:</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setCsvContent(DEMO_CSV_BATCHES.clean);
                setActiveStep(1);
                setValidationResult(null);
                setCommitSuccessMessage(null);
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              Preset 1: Clean Batch (5 Valid Students)
            </button>
            <button
              onClick={() => {
                setCsvContent(DEMO_CSV_BATCHES.violations);
                setActiveStep(1);
                setValidationResult(null);
                setCommitSuccessMessage(null);
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition-colors"
            >
              Preset 2: Multi-Error Batch (Intra-batch + Cross-College Duplicate + Invalid Checksum)
            </button>
            <button
              onClick={() => {
                setCsvContent(DEMO_CSV_BATCHES.nriSpike);
                setActiveStep(1);
                setValidationResult(null);
                setCommitSuccessMessage(null);
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              Preset 3: Supernumerary Quota Spike Batch
            </button>
          </div>
        </div>

        {/* CSV Editor / Uploader Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <label className="font-semibold text-slate-700">Student Record CSV Data:</label>
            <span className="font-mono text-slate-500">Format: apaarId,name,fatherName,dob,gender,branch,admissionYear,admissionQuota</span>
          </div>
          <textarea
            rows={7}
            value={csvContent}
            onChange={(e) => {
              setCsvContent(e.target.value);
              setActiveStep(1);
              setValidationResult(null);
            }}
            className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-500">
            Pre-flight engine checks against 12-digit Verhoeff algorithm and national cross-institute database.
          </div>

          <button
            onClick={handleRunValidation}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <span>Run Automated Pre-Commit Diagnostics</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Diagnostic Results Table (Step 2 output) */}
        {validationResult && (
          <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Diagnostic Summary:</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {validationResult.counts.total} Rows Evaluated
                  </span>
                </h3>
                <div className="flex items-center gap-4 text-xs font-medium mt-1">
                  <span className="text-emerald-700 font-semibold font-mono tabular-nums">
                    ✓ {validationResult.counts.valid} Passed Verification
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-rose-700 font-semibold font-mono tabular-nums">
                    ✕ {validationResult.counts.errors} Critical Violations
                  </span>
                </div>
              </div>

              {validationResult.counts.valid > 0 && (
                <button
                  onClick={handleCommit}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
                >
                  <Database className="w-4 h-4" />
                  <span>Step 3: Commit {validationResult.counts.valid} Verified Records</span>
                </button>
              )}
            </div>

            {/* If there are issues, render detailed row-level error breakdown */}
            {validationResult.issues.length > 0 ? (
              <div className="border border-rose-200 rounded-lg overflow-hidden bg-rose-50/30">
                <div className="bg-rose-100/60 px-4 py-2.5 text-xs font-bold text-rose-900 flex items-center justify-between">
                  <span>Row-Level Violation Breakdown (Pre-Commit Blocks)</span>
                  <span>{validationResult.issues.length} Issues Identified</span>
                </div>
                <div className="divide-y divide-rose-100 max-h-72 overflow-y-auto">
                  {validationResult.issues.map((issue, idx) => (
                    <div key={idx} className="p-3 text-xs flex flex-col md:flex-row md:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-rose-900 bg-rose-100 px-1.5 py-0.5 rounded text-[11px]">
                            Row #{issue.rowNumber}
                          </span>
                          <span className="font-semibold text-slate-900">{issue.studentName}</span>
                          <span className="font-mono text-slate-500">({issue.apaarId})</span>
                          <span className="text-slate-400">·</span>
                          <span className="font-medium text-slate-600">{issue.branch}</span>
                        </div>
                        <div className="text-rose-800 font-medium">
                          {issue.message}
                        </div>
                        {issue.conflictingDetails && (
                          <div className="text-slate-600 text-[11px] font-mono bg-white/80 p-1.5 rounded border border-rose-200">
                            {issue.conflictingDetails}
                          </div>
                        )}
                      </div>

                      <div className="text-right text-[11px] text-slate-600 md:max-w-xs shrink-0">
                        <span className="font-semibold text-slate-700">Remedy: </span>
                        <span>{issue.suggestedAction}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3 text-emerald-900 text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <strong>All Records Validated:</strong> Zero checksum failures, zero duplicate APAAR registrations, and all branches are within statutory AICTE seat ceilings.
                </div>
              </div>
            )}

            {commitSuccessMessage && (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-900 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>{commitSuccessMessage}</span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Enrolled Student Roster for Institution */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              <span>Enrolled Student Roster ({institutionStudents.length} Records)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified APAAR-keyed student repository. In accordance with DPDP Act 2023, PII is masked for non-authorized roles.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, APAAR..."
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-52"
              />
            </div>

            <select
              aria-label="Filter Roster By Branch"
              value={selectedBranchFilter}
              onChange={(e) => setSelectedBranchFilter(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-hidden"
            >
              <option value="all">All Branches</option>
              {institution.branches.map((b) => (
                <option key={b.code} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Student & APAAR ID</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Admission Quota</th>
                <th className="py-3 px-4">DigiLocker / ABC</th>
                <th className="py-3 px-4">Cryptographic Proof</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRoster.map((std) => (
                <tr key={std.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{std.name}</div>
                    <div className="font-mono text-slate-600 text-[11px] mt-0.5">
                      {std.formattedApaarId}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-slate-700 font-medium">
                    {std.branch}
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {std.admissionQuota}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                    <div>{std.abcAccountId}</div>
                    <div className="text-[10px] text-emerald-700 font-semibold">
                      {std.digiLockerLinked ? '✓ DigiLocker Synced' : 'Unlinked'}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-mono text-[10px] text-slate-500 max-w-[140px] truncate block" title={std.digitalSignatureHash}>
                      {std.digitalSignatureHash.slice(0, 16)}...
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                      std.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' :
                      std.status === 'Duplicate' ? 'bg-rose-100 text-rose-800' :
                      std.status === 'Exceeds_Cap' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {std.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

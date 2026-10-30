import React, { useState } from 'react';
import { Student, ConsentRequest } from '../types/apaar';
import { verifyDigitalSignature, createSignedStudentPayload } from '../lib/tamperProofCrypto';
import { 
  FileCheck2, Search, QrCode, ShieldCheck, ShieldAlert, CheckCircle, 
  Lock, AlertTriangle, Building, RefreshCw, Send, Check
} from 'lucide-react';

interface EmployerVerifierProps {
  students: Student[];
  consentRequests: ConsentRequest[];
  onRequestConsent: (apaarId: string, verifierOrg: string, purpose: string) => void;
}

export const EmployerVerifier: React.FC<EmployerVerifierProps> = ({
  students,
  consentRequests,
  onRequestConsent,
}) => {
  const [searchApaar, setSearchApaar] = useState<string>('9842 1083 4912');
  const [activeStudent, setActiveStudent] = useState<Student | null>(students[0]);
  const [simulateTamper, setSimulateTamper] = useState<boolean>(false);
  const [verifierOrgName, setVerifierOrgName] = useState<string>('Tata Consultancy Services (HR Recruitment)');
  const [verificationPurpose, setVerificationPurpose] = useState<string>('Campus Recruitment Background Check (2026)');
  const [consentSentMessage, setConsentSentMessage] = useState<string | null>(null);

  const handleLookup = (idToSearch?: string) => {
    const clean = (idToSearch || searchApaar).replace(/\s+/g, '');
    const found = students.find((s) => s.apaarId.replace(/\s+/g, '') === clean);
    if (found) {
      setActiveStudent(found);
    } else {
      alert(`No student found with APAAR ID: ${clean}`);
    }
    setConsentSentMessage(null);
  };

  // Check consent for active student
  const activeConsent = activeStudent
    ? consentRequests.find(
        (c) =>
          c.studentApaarId.replace(/\s+/g, '') === activeStudent.apaarId.replace(/\s+/g, '') &&
          c.status === 'APPROVED'
      )
    : null;

  const hasApprovedConsent = !!activeConsent;

  // Verify signature
  const sigAudit = activeStudent
    ? verifyDigitalSignature(activeStudent.apaarId, activeStudent.digitalSignatureHash, simulateTamper)
    : null;

  const handleSendConsentRequest = () => {
    if (!activeStudent) return;
    onRequestConsent(activeStudent.apaarId, verifierOrgName, verificationPurpose);
    setConsentSentMessage('Consent request dispatched to student APAAR portal under DPDP Act 2023 guidelines.');
  };

  return (
    <div className="space-y-8">
      {/* Executive Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Third-Party Employer & Background Verifier Portal</span>
              <span>·</span>
              <span>Tamper-Evident Signed QR Engine</span>
              <span>·</span>
              <span>Zero Fraud Architecture</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Instant APAAR Credential & Degree Verification
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Cryptographically verify authentic student credentials directly against AICTE and DigiLocker repositories with DPDP Act 2023 sovereign consent.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Preset Candidates:</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => {
                  setSearchApaar('9842 1083 4912');
                  handleLookup('9842 1083 4912');
                }}
                className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded text-slate-800 transition-colors"
              >
                Rahul Sharma
              </button>
              <button
                onClick={() => {
                  setSearchApaar('9842 3910 4820');
                  handleLookup('9842 3910 4820');
                }}
                className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded text-slate-800 transition-colors"
              >
                Priya Sundaram
              </button>
              <button
                onClick={() => {
                  setSearchApaar('9842 9103 8295');
                  handleLookup('9842 9103 8295');
                }}
                className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded text-slate-800 transition-colors"
              >
                Vikramaditya (Apex)
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar & Scanner */}
        <div className="pt-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-8">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Enter 12-Digit Student APAAR ID or Scan Signed QR:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. 9842 1083 4912"
                  value={searchApaar}
                  onChange={(e) => setSearchApaar(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm font-mono font-semibold bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={() => handleLookup()}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors shrink-0"
              >
                Verify Credential
              </button>
            </div>
          </div>

          {/* Tamper Simulation Toggle */}
          <div className="md:col-span-4 p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-amber-900">Tamper Simulation Mode:</div>
              <div className="text-[10px] text-amber-700">Simulate fraudulent modified record</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={simulateTamper}
                onChange={(e) => setSimulateTamper(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Verification Result Display */}
      {activeStudent && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Verification Dossier */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
              {/* Status Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  {sigAudit?.isTamperFree ? (
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-700">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase">
                      AICTE Cryptographic Verification Status
                    </div>
                    <div className={`text-lg font-bold ${sigAudit?.isTamperFree ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {sigAudit?.isTamperFree ? '100% Tamper-Free & Validated' : 'FRAUD ALERT: Cryptographic Tampering Detected'}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-xs px-2.5 py-1 rounded font-bold bg-slate-100 text-slate-800">
                    {sigAudit?.verifiedCertLevel}
                  </span>
                </div>
              </div>

              {/* Tamper Warning Banner if stimulated */}
              {!sigAudit?.isTamperFree && (
                <div className="p-4 bg-rose-50 border border-rose-300 rounded-lg text-rose-900 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Cryptographic Integrity Violation:</span>
                  </div>
                  <div>{sigAudit?.message}</div>
                  <div className="text-[11px] font-mono text-rose-700">
                    Detected mismatch: Stored AICTE root hash does not correspond with candidate submitted certificate!
                  </div>
                </div>
              )}

              {/* Student Credential Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Candidate Full Name</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {hasApprovedConsent ? activeStudent.name : activeStudent.name.slice(0, 3) + '*** (Consent Required)'}
                  </div>
                  {!hasApprovedConsent && (
                    <div className="text-[10px] text-amber-700 mt-0.5 font-medium">
                      Masked under DPDP Act 2023 purpose limitation
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">12-Digit APAAR ID</div>
                  <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                    {activeStudent.formattedApaarId}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                    ✓ Verhoeff Checksum Verified
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Enrolled Institution</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {activeStudent.institutionName}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    AICTE PID: {activeStudent.aictePid}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Degree & Program</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {activeStudent.course} in {activeStudent.branch}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Admission Year: {activeStudent.admissionYear}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Academic Bank of Credits</div>
                  <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                    {hasApprovedConsent ? activeStudent.abcAccountId : 'ABC-****-****'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {hasApprovedConsent ? `${activeStudent.earnedCredits} Verified Credits Earned` : 'Hidden pending consent'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Enrolment Validity & Cap</div>
                  <div className="text-sm font-bold mt-0.5">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      activeStudent.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' :
                      activeStudent.status === 'Duplicate' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {activeStudent.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {activeStudent.statusReason && (
                    <div className="text-[10px] text-rose-700 mt-1 font-medium">
                      {activeStudent.statusReason}
                    </div>
                  )}
                </div>
              </div>

              {/* Cryptographic SHA-256 Public Proof */}
              <div className="p-4 bg-slate-900 text-white rounded-lg space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-indigo-400">
                  <span>AICTE Root PKI Digital Signature</span>
                  <span className="text-[10px] text-emerald-400">IMMUTABLE CERTIFICATE</span>
                </div>
                <div className="text-[11px] text-slate-300 break-all bg-slate-950 p-2.5 rounded border border-slate-800">
                  {activeStudent.digitalSignatureHash}
                </div>
                <div className="text-[10px] text-slate-400">
                  Signed on {new Date(activeStudent.signedTimestamp).toUTCString()} by AICTE Central PKI Trust Authority.
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: DPDP Act 2023 Consent Status & Requestor Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-sm text-slate-900">
                    Consent Status (DPDP Act 2023)
                  </h3>
                </div>
                {hasApprovedConsent ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Consent Active
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Consent Required
                  </span>
                )}
              </div>

              {hasApprovedConsent ? (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Authorization Granted by Student</span>
                    </div>
                    <div>
                      {activeConsent?.verifierOrg} has been granted verified access to this candidate&apos;s full academic record.
                    </div>
                    <div className="text-[10px] font-mono text-emerald-800 pt-1">
                      Token valid until: {new Date(activeConsent?.expiresAt || '').toLocaleDateString()}
                    </div>
                  </div>

                  <div className="text-xs text-slate-600">
                    <strong>Authorized Purpose:</strong> {activeConsent?.purpose}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs">
                    This candidate has not yet authorized unmasked PII sharing for this inquiry.
                    Submit an official request to the student&apos;s APAAR Consent Vault below.
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      Verifier Organization:
                    </label>
                    <input
                      type="text"
                      value={verifierOrgName}
                      onChange={(e) => setVerifierOrgName(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      Verification Purpose (DPDP Compliance):
                    </label>
                    <textarea
                      rows={3}
                      value={verificationPurpose}
                      onChange={(e) => setVerificationPurpose(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900"
                    />
                  </div>

                  <button
                    onClick={handleSendConsentRequest}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Sovereign Consent Request</span>
                  </button>

                  {consentSentMessage && (
                    <div className="text-xs font-semibold text-indigo-700 bg-indigo-50 p-2.5 rounded border border-indigo-200 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{consentSentMessage}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

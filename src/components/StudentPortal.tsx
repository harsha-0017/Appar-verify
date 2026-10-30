import React, { useState } from 'react';
import { Student, ConsentRequest } from '../types/apaar';
import { generateQRMatrix, createSignedStudentPayload } from '../lib/tamperProofCrypto';
import { 
  QrCode, Shield, CheckCircle2, Lock, Eye, Check, X, 
  ExternalLink, Download, Clock, ShieldCheck, KeyRound
} from 'lucide-react';

interface StudentPortalProps {
  student: Student;
  allStudents: Student[];
  onSelectStudent: (id: string) => void;
  consentRequests: ConsentRequest[];
  onUpdateConsent: (requestId: string, status: 'APPROVED' | 'REJECTED') => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  student,
  allStudents,
  onSelectStudent,
  consentRequests,
  onUpdateConsent,
}) => {
  const [showQrDetails, setShowQrDetails] = useState<boolean>(false);
  const [showMaskedPii, setShowMaskedPii] = useState<boolean>(false);

  // Student specific requests
  const studentRequests = consentRequests.filter(
    (r) => r.studentApaarId.replace(/\s+/g, '') === student.apaarId.replace(/\s+/g, '')
  );

  // QR Matrix generated from cryptographic payload
  const signedPayload = createSignedStudentPayload(student, true);
  const qrMatrix = generateQRMatrix(signedPayload.digitalSignature, 21);

  return (
    <div className="space-y-8">
      {/* Top Banner & Switcher */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>National Education Policy (NEP 2020)</span>
              <span>·</span>
              <span>DigiLocker / Academic Bank of Credits</span>
              <span>·</span>
              <span>DPDP Act 2023 Aligned</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Student APAAR Digital Identity & Consent Vault
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Your lifelong 12-digit academic identity. Secure, tamper-evident, and sovereignly controlled by you.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">Switch Student View:</span>
            <select
              aria-label="Switch Current Student Profile"
              value={student.id}
              onChange={(e) => onSelectStudent(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {allStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.formattedApaarId}) - {s.institutionName.split(' ')[0]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: The Digital APAAR Card (Government Standard Format) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-indigo-800/40 overflow-hidden">
            {/* Subtle background security guilloche pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            {/* Card Header: AICTE & Ministry of Education */}
            <div className="relative z-10 flex items-start justify-between pb-6 border-b border-indigo-800/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                  <ShieldCheck className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-amber-300 tracking-wider uppercase">
                    Ministry of Education · Govt. of India
                  </div>
                  <div className="text-sm font-bold tracking-tight text-white">
                    APAAR ID CARD (Automated Permanent Academic Account Registry)
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  AICTE VERIFIED
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="relative z-10 pt-6 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {/* Photo & QR */}
              <div className="sm:col-span-5 flex flex-col items-center text-center space-y-3">
                <div className="w-24 h-24 rounded-xl bg-slate-800 border-2 border-indigo-400/40 flex items-center justify-center overflow-hidden shadow-inner">
                  <div className="w-full h-full bg-slate-700 flex flex-col items-center justify-center text-indigo-300">
                    <span className="text-2xl font-bold">{student.name.charAt(0)}</span>
                    <span className="text-[10px] text-slate-400 mt-1">Photo KYC</span>
                  </div>
                </div>

                {/* Live Verifiable QR Code Component */}
                <div className="p-2.5 bg-white rounded-xl shadow-lg border border-slate-200">
                  <svg width="120" height="120" viewBox="0 0 21 21" className="shape-rendering-crispEdges">
                    {qrMatrix.map((row, r) =>
                      row.map((isBlack, c) =>
                        isBlack ? (
                          <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#0f172a" />
                        ) : null
                      )
                    )}
                  </svg>
                  <div className="text-[9px] font-mono text-slate-600 font-bold mt-1">
                    SIGNED QR RECORD
                  </div>
                </div>
              </div>

              {/* Student Metadata */}
              <div className="sm:col-span-7 space-y-3 text-xs">
                <div>
                  <div className="text-slate-400 text-[11px]">Student Full Name</div>
                  <div className="text-base font-bold text-white tracking-tight">{student.name}</div>
                </div>

                <div>
                  <div className="text-slate-400 text-[11px]">12-Digit APAAR ID</div>
                  <div className="font-mono text-lg font-bold text-amber-300 tracking-wider">
                    {student.formattedApaarId}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-indigo-900/60">
                  <div>
                    <div className="text-slate-400 text-[10px]">Academic Institution</div>
                    <div className="font-medium text-slate-200 text-[11px] leading-tight">
                      {student.institutionName}
                    </div>
                    <div className="text-[10px] font-mono text-indigo-300 mt-0.5">
                      PID: {student.aictePid}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-400 text-[10px]">Course & Branch</div>
                    <div className="font-medium text-slate-200 text-[11px]">
                      {student.course} · {student.branch.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Batch of {student.admissionYear}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="text-slate-400 text-[10px]">Academic Bank of Credits</div>
                    <div className="font-mono text-indigo-300 font-bold text-[11px]">
                      {student.abcAccountId}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Credits: {student.earnedCredits} Earned
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-400 text-[10px]">DigiLocker Status</div>
                    <div className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>DigiLocker Linked</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cryptographic Signature Bar */}
            <div className="relative z-10 mt-6 pt-4 border-t border-indigo-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-slate-400 font-mono">
              <div className="truncate max-w-sm">
                <span className="text-slate-500">SHA-256 Sig: </span>
                <span className="text-indigo-300">{student.digitalSignatureHash}</span>
              </div>
              <button
                onClick={() => setShowQrDetails(!showQrDetails)}
                className="text-amber-300 hover:text-amber-200 font-semibold underline shrink-0"
              >
                {showQrDetails ? 'Hide Cryptographic Inspector' : 'Inspect Cryptographic Payload'}
              </button>
            </div>
          </div>

          {/* Cryptographic Inspector Expansion */}
          {showQrDetails && (
            <div className="bg-slate-900 text-slate-200 rounded-xl p-5 text-xs font-mono border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-indigo-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4" />
                  <span>AICTE Public Key Infrastructure (PKI) Verification Certificate</span>
                </span>
                <span className="text-emerald-400 text-[10px]">CLASS-3 GOVT SIGNED</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg overflow-x-auto text-[11px] text-slate-300">
                <pre>{JSON.stringify(signedPayload, null, 2)}</pre>
              </div>
              <div className="text-[11px] text-slate-400">
                This signed JSON token is encoded in the QR code. When scanned by employers, the verifier validates the digital signature with AICTE&apos;s published public key without revealing unauthorized PII.
              </div>
            </div>
          )}
        </div>

        {/* Right Col: DPDP Act 2023 Consent Management & Permissions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Consent Vault (DPDP Act 2023)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                Sovereign Consent
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Under India&apos;s Digital Personal Data Protection Act (2023), third-party employers, recruiters, and background verification agencies
              <strong> cannot access your degree credentials without your express prior consent</strong>.
            </p>

            {/* Pending Requests Queue */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Pending Verification Inquiries:
              </div>

              {studentRequests.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs text-slate-500">
                  No pending verification requests at this time.
                </div>
              ) : (
                studentRequests.map((req) => (
                  <div key={req.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-xs text-slate-900">{req.verifierOrg}</div>
                        <div className="text-[11px] text-slate-500">{req.verifierName} ({req.verifierType})</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        req.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200">
                      <strong>Purpose:</strong> {req.purpose}
                    </div>

                    <div className="text-[10px] text-slate-500 font-mono">
                      Requested: {req.requestedFields.join(', ')}
                    </div>

                    {req.status === 'PENDING' ? (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => onUpdateConsent(req.id, 'APPROVED')}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-xs transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Grant Token</span>
                        </button>
                        <button
                          onClick={() => onUpdateConsent(req.id, 'REJECTED')}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-semibold transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Deny Request</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                        <span>Valid until: {new Date(req.expiresAt).toLocaleDateString()}</span>
                        <button
                          onClick={() => onUpdateConsent(req.id, req.status === 'APPROVED' ? 'REJECTED' : 'APPROVED')}
                          className="text-indigo-600 hover:underline font-semibold"
                        >
                          {req.status === 'APPROVED' ? 'Revoke Access' : 'Re-grant'}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Privacy Redaction / Masking Settings */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="text-xs font-bold text-slate-800">DPDP Privacy Masking Preview:</div>
              <div className="space-y-1 text-xs text-slate-600 font-mono bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex justify-between">
                  <span>Aadhaar Token:</span>
                  <span className="font-bold text-slate-800">{student.aadhaarMasked}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mobile Contact:</span>
                  <span className="font-bold text-slate-800">{student.mobileMasked}</span>
                </div>
                <div className="flex justify-between">
                  <span>Institutional Email:</span>
                  <span className="font-bold text-slate-800">{student.emailMasked}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

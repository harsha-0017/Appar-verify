import React from 'react';
import { 
  Check, X, Shield, FileCheck, Users, Building, Laptop, 
  ExternalLink, Layers, ArrowRight, Sparkles, Scale, Lock
} from 'lucide-react';

interface SihPresentationViewProps {
  onNavigateTab: (tab: string) => void;
}

export const SihPresentationView: React.FC<SihPresentationViewProps> = ({ onNavigateTab }) => {
  return (
    <div className="space-y-8">
      {/* Title & Hackathon Header */}
      <div className="bg-slate-900 text-white rounded-xl p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <span>Smart India Hackathon (SIH) 2026</span>
              <span>·</span>
              <span>Problem Statement ID: SIH26263</span>
              <span>·</span>
              <span>Team Phoenix</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white mt-1">
              APAAR-VERIFY: System Architecture & Specification
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl">
              APAAR ID-Based Student Data Management and Verification Platform for AICTE-Approved Institutions under the Smart Automation theme.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-lg text-xs font-mono font-bold">
              NEP 2020 Compliant
            </span>
          </div>
        </div>

        {/* 5-Step Methodology Cards (Slide 3) */}
        <div className="pt-6">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            End-to-End Methodology (Slide 3 of Submission):
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="p-4 bg-slate-800/80 rounded-lg border border-slate-700">
              <div className="text-indigo-400 font-bold text-xs">Step 1: Upload</div>
              <div className="text-white text-sm font-semibold mt-1">Batch Submission</div>
              <p className="text-slate-400 text-xs mt-1">Institutions submit CSV / API student-level records keyed by APAAR ID.</p>
              <button
                onClick={() => onNavigateTab('institution')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 mt-3"
              >
                <span>Try Uploader</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-lg border border-slate-700">
              <div className="text-indigo-400 font-bold text-xs">Step 2: Validate</div>
              <div className="text-white text-sm font-semibold mt-1">Row-Level Diagnostics</div>
              <p className="text-slate-400 text-xs mt-1">Verhoeff checksum, cross-college concurrency, and seat cap checks.</p>
              <button
                onClick={() => onNavigateTab('institution')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 mt-3"
              >
                <span>View Diagnostics</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-lg border border-slate-700">
              <div className="text-indigo-400 font-bold text-xs">Step 3: Store</div>
              <div className="text-white text-sm font-semibold mt-1">Central Repository</div>
              <p className="text-slate-400 text-xs mt-1">Verified records saved with cryptographic SHA-256 digital seals.</p>
              <button
                onClick={() => onNavigateTab('institution')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 mt-3"
              >
                <span>Check Hashes</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-lg border border-slate-700">
              <div className="text-indigo-400 font-bold text-xs">Step 4: Monitor</div>
              <div className="text-white text-sm font-semibold mt-1">AICTE Oversight</div>
              <p className="text-slate-400 text-xs mt-1">Real-time seat cap radar, ghost student detection, and risk scoring.</p>
              <button
                onClick={() => onNavigateTab('aicte')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 mt-3"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-lg border border-slate-700">
              <div className="text-indigo-400 font-bold text-xs">Step 5: Verify</div>
              <div className="text-white text-sm font-semibold mt-1">Consent-Backed QR</div>
              <p className="text-slate-400 text-xs mt-1">Signed QR check requiring student sovereign consent under DPDP 2023.</p>
              <button
                onClick={() => onNavigateTab('employer')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 mt-3"
              >
                <span>Test Verifier</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison with Existing Systems Matrix (Directly from Slide 6) */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-600" />
            <span>Comparison with Existing Systems (Slide 6 Matrix)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Why current portals (AICTE Portal, AISHE, DigiLocker) fall short of preventing ghost admissions and duplicate seat hoarding.
          </p>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Feature / Capability</th>
                <th className="py-3 px-4 bg-indigo-50/70 text-indigo-900 font-bold">
                  APAAR-Verify (Proposed)
                </th>
                <th className="py-3 px-4">AICTE Portal</th>
                <th className="py-3 px-4">AISHE</th>
                <th className="py-3 px-4">DigiLocker</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-900">Student-level data by APAAR ID</td>
                <td className="py-3.5 px-4 bg-indigo-50/40 text-emerald-700 font-bold">
                  ✓ Yes (Mandatory 12-digit key)
                </td>
                <td className="py-3.5 px-4 text-slate-500">✕ No (Aggregate totals)</td>
                <td className="py-3.5 px-4 text-slate-500">✕ No (Statistical bulk)</td>
                <td className="py-3.5 px-4 text-slate-600">~ Partial (Document storage)</td>
              </tr>

              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-900">Intake vs. enrolment check</td>
                <td className="py-3.5 px-4 bg-indigo-50/40 text-emerald-700 font-bold">
                  ✓ Yes (Automated pre-commit check)
                </td>
                <td className="py-3.5 px-4 text-slate-600">~ Partial (Post-admission self-report)</td>
                <td className="py-3.5 px-4 text-slate-500">✕ No</td>
                <td className="py-3.5 px-4 text-slate-500">✕ No</td>
              </tr>

              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-900">Cross-institution duplicates</td>
                <td className="py-3.5 px-4 bg-indigo-50/40 text-emerald-700 font-bold">
                  ✓ Yes (Real-time national prober)
                </td>
                <td className="py-3.5 px-4 text-slate-500">✕ No (Siloed by college)</td>
                <td className="py-3.5 px-4 text-slate-500">✕ No</td>
                <td className="py-3.5 px-4 text-slate-500">✕ No</td>
              </tr>

              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-900">Real-time dashboards & alerts</td>
                <td className="py-3.5 px-4 bg-indigo-50/40 text-emerald-700 font-bold">
                  ✓ Yes (Live concurrency radar)
                </td>
                <td className="py-3.5 px-4 text-slate-600">~ Partial (Static annual reports)</td>
                <td className="py-3.5 px-4 text-slate-500">✕ No (Annual survey)</td>
                <td className="py-3.5 px-4 text-slate-500">✕ No</td>
              </tr>

              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-900">Anomaly detection & risk score</td>
                <td className="py-3.5 px-4 bg-indigo-50/40 text-emerald-700 font-bold">
                  ✓ Yes (0-100 institutional score)
                </td>
                <td className="py-3.5 px-4 text-slate-500">✕ No</td>
                <td className="py-3.5 px-4 text-slate-500">✕ No</td>
                <td className="py-3.5 px-4 text-slate-500">✕ No</td>
              </tr>

              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-900">Employer verification</td>
                <td className="py-3.5 px-4 bg-indigo-50/40 text-emerald-700 font-bold">
                  ✓ Yes (Instant consent-gated API)
                </td>
                <td className="py-3.5 px-4 text-slate-500">✕ No</td>
                <td className="py-3.5 px-4 text-slate-500">✕ No</td>
                <td className="py-3.5 px-4 text-emerald-700 font-semibold">✓ Yes</td>
              </tr>

              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-900">Signed QR records with consent</td>
                <td className="py-3.5 px-4 bg-indigo-50/40 text-emerald-700 font-bold">
                  ✓ Yes (Tamper-evident PKI hash)
                </td>
                <td className="py-3.5 px-4 text-slate-500">✕ No</td>
                <td className="py-3.5 px-4 text-slate-500">✕ No</td>
                <td className="py-3.5 px-4 text-slate-600">~ Partial</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Impact & Multi-Stakeholder Value (Slide 5) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>Impact on Target Stakeholders (Slide 5)</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <strong className="text-slate-900">AICTE:</strong> Real-time intake vs. enrolment visibility, automated seat-cap alerts, and ghost enrolment elimination.
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <strong className="text-slate-900">Institutions:</strong> Standardized bulk upload with instant row-level error feedback and frictionless compliance.
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <strong className="text-slate-900">Employers:</strong> Instant, tamper-evident degree verification without waiting weeks for university registrar stamps.
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <strong className="text-slate-900">Students:</strong> Unified lifelong academic identity with sovereign control over who can view academic records.
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-600" />
            <span>DPDP Act 2023 & Security by Design (Slide 2 & 4)</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-200">
              <strong className="text-indigo-950">Purpose Limitation:</strong> Verifiers specify explicit purpose (e.g. SDE Internship) and access expires automatically.
            </div>
            <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-200">
              <strong className="text-indigo-950">Data Masking & Redaction:</strong> Sensitive identifiers (Aadhaar, contact details) are masked by default to prevent surveillance.
            </div>
            <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-200">
              <strong className="text-indigo-950">Cryptographic Non-Repudiation:</strong> Records signed using SHA-256 PKI roots; any post-hoc database tampering fails validation.
            </div>
            <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-200">
              <strong className="text-indigo-950">Auditable Event Chain:</strong> Every consent grant, verification check, and anomaly alert is immutably logged.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

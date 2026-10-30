/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserRole, Institution, Student, AnomalyAlert, ConsentRequest, AuditLogItem, ValidationIssue } from './types/apaar';
import { 
  INITIAL_INSTITUTIONS, INITIAL_STUDENTS, INITIAL_ANOMALIES, 
  INITIAL_CONSENT_REQUESTS, INITIAL_AUDIT_LOGS 
} from './data/mockData';
import { calculateInstitutionRiskScore } from './lib/apaarValidator';
import { Header } from './components/Header';
import { AicteDashboard } from './components/AicteDashboard';
import { InstitutionPortal } from './components/InstitutionPortal';
import { StudentPortal } from './components/StudentPortal';
import { EmployerVerifier } from './components/EmployerVerifier';
import { SihPresentationView } from './components/SihPresentationView';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('aicte');
  const [activeRole, setActiveRole] = useState<UserRole>('aicte_officer');

  // Application state
  const [institutions, setInstitutions] = useState<Institution[]>(INITIAL_INSTITUTIONS);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>(INITIAL_ANOMALIES);
  const [consentRequests, setConsentRequests] = useState<ConsentRequest[]>(INITIAL_CONSENT_REQUESTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);

  // Selected entities
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>(INITIAL_INSTITUTIONS[0].id);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(INITIAL_STUDENTS[0].id);

  const currentInstitution = institutions.find((i) => i.id === selectedInstitutionId) || institutions[0];
  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  // Helper to append audit item
  const recordAudit = (action: string, actor: string, role: string, details: string, dpdpCategory: AuditLogItem['dpdpCategory']) => {
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      actorName: actor,
      actorRole: role,
      dpdpCategory,
      details,
      tamperProofHash: `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Handler: Anomaly resolution
  const handleResolveAnomaly = (id: string, actionNote: string) => {
    setAnomalies((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'RESOLVED', actionTaken: actionNote } : a))
    );
    recordAudit('ANOMALY_RESOLVED', 'AICTE Compliance Officer', 'AICTE Central', `Resolved anomaly ${id}: ${actionNote}`, 'DATA_VALIDATION');
  };

  // Handler: Issue official AICTE Show-Cause Notice
  const handleIssueShowCause = (institution: Institution, reason: string) => {
    const noticeRef = `AICTE/NWR/2026/SC-${Math.floor(100 + Math.random() * 900)}`;

    setInstitutions((prev) =>
      prev.map((inst) =>
        inst.id === institution.id
          ? {
              ...inst,
              complianceStatus: 'Notice Issued',
              riskScore: Math.min(100, inst.riskScore + 10),
            }
          : inst
      )
    );

    setAnomalies((prev) =>
      prev.map((a) =>
        a.institutionId === institution.id
          ? { ...a, status: 'NOTICE_ISSUED', actionTaken: `Official Show-Cause dispatched (${noticeRef})` }
          : a
      )
    );

    recordAudit(
      'SHOW_CAUSE_NOTICE_DISPATCHED',
      'AICTE Member Secretary',
      'AICTE Central',
      `Issued statutory Show-Cause Notice ${noticeRef} to ${institution.name} (${institution.aictePid}) for: ${reason}`,
      'DATA_VALIDATION'
    );
  };

  // Handler: Institution commits verified batch
  const handleCommitBatch = (newStudents: Student[], issues: ValidationIssue[]) => {
    setStudents((prev) => [...newStudents, ...prev]);

    // Update current institution branch metrics
    setInstitutions((prev) =>
      prev.map((inst) => {
        if (inst.id !== currentInstitution.id) return inst;

        const updatedBranches = inst.branches.map((b) => {
          const addedInBranch = newStudents.filter((s) => s.branch.toLowerCase() === b.name.toLowerCase()).length;
          const addedNriInBranch = newStudents.filter(
            (s) => s.branch.toLowerCase() === b.name.toLowerCase() && (s.admissionQuota === 'NRI' || s.admissionQuota === 'OCI_FN')
          ).length;

          return {
            ...b,
            currentEnrolled: b.currentEnrolled + addedInBranch,
            currentNriFn: b.currentNriFn + addedNriInBranch,
          };
        });

        const totalEnrolled = updatedBranches.reduce((acc, curr) => acc + curr.currentEnrolled, 0);
        const { score, level, factors } = calculateInstitutionRiskScore(
          { ...inst, branches: updatedBranches, totalEnrolled },
          inst.activeFlaggedStudents,
          inst.crossInstitutionDuplicateCount
        );

        return {
          ...inst,
          branches: updatedBranches,
          totalEnrolled,
          riskScore: score,
          riskLevel: level,
          riskFactors: factors,
          lastBatchUploadedAt: new Date().toISOString(),
        };
      })
    );

    // If there were critical cross-college issues, record new Anomaly
    const crossDuplicates = issues.filter((i) => i.type === 'CROSS_INSTITUTE_DUPLICATE');
    if (crossDuplicates.length > 0) {
      crossDuplicates.forEach((cd) => {
        const newAlert: AnomalyAlert = {
          id: `alert-batch-${Date.now()}-${Math.random()}`,
          institutionId: currentInstitution.id,
          institutionName: currentInstitution.name,
          severity: 'critical',
          category: 'CROSS_COLLEGE_DOUBLE_ADMISSION',
          title: `Concurrent Admission Attempt: ${cd.studentName}`,
          description: `Student with APAAR ${cd.apaarId} attempted registration at ${currentInstitution.name} while already flagged active elsewhere. ${cd.conflictingDetails || ''}`,
          detectedAt: new Date().toISOString(),
          affectedApaarId: cd.apaarId,
          affectedStudentName: cd.studentName,
          status: 'OPEN',
        };
        setAnomalies((prev) => [newAlert, ...prev]);
      });
    }

    recordAudit(
      'BATCH_COMMIT_COMPLETED',
      `${currentInstitution.name} Admissions Desk`,
      'Institution Admin',
      `Committed ${newStudents.length} verified student records with cryptographic hashes. Ingested into AICTE National Repository.`,
      'ENROLMENT_VERIFICATION'
    );
  };

  // Handler: Update Consent Request (Student decision)
  const handleUpdateConsent = (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    setConsentRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status } : r))
    );

    const targetReq = consentRequests.find((r) => r.id === requestId);
    if (targetReq) {
      recordAudit(
        status === 'APPROVED' ? 'CONSENT_GRANTED' : 'CONSENT_DENIED',
        targetReq.studentName,
        'Student',
        `Student ${status.toLowerCase()} credential verification request from ${targetReq.verifierOrg} under DPDP Act 2023.`,
        'CONSENT'
      );
    }
  };

  // Handler: Employer initiates consent request
  const handleRequestConsent = (apaarId: string, verifierOrg: string, purpose: string) => {
    const student = students.find((s) => s.apaarId.replace(/\s+/g, '') === apaarId.replace(/\s+/g, ''));
    if (!student) return;

    const newRequest: ConsentRequest = {
      id: `cr-${Date.now()}`,
      studentApaarId: student.apaarId,
      studentName: student.name,
      verifierName: 'Talent Acquisition Team',
      verifierOrg,
      verifierType: 'Employer',
      requestedFields: ['Full Name', 'Institution', 'Course & Branch', 'ABC Credits', 'AICTE Verification Seal'],
      purpose,
      requestedAt: new Date().toISOString(),
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    setConsentRequests((prev) => [newRequest, ...prev]);

    recordAudit(
      'CONSENT_REQUEST_DISPATCHED',
      verifierOrg,
      'Employer / Verifier',
      `Dispatched DPDP 2023 verification inquiry for APAAR ${student.formattedApaarId}. Purpose: ${purpose}`,
      'CONSENT'
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Universal Top Bar */}
      <Header
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        openAnomalyCount={anomalies.filter((a) => a.status === 'OPEN').length}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'aicte' && (
          <AicteDashboard
            institutions={institutions}
            students={students}
            anomalies={anomalies}
            auditLogs={auditLogs}
            onResolveAnomaly={handleResolveAnomaly}
            onIssueShowCause={handleIssueShowCause}
            onSelectInstitutionForView={(instId) => {
              setSelectedInstitutionId(instId);
              setActiveRole('institution_admin');
              setActiveTab('institution');
            }}
          />
        )}

        {activeTab === 'institution' && (
          <InstitutionPortal
            institution={currentInstitution}
            institutions={institutions}
            onSelectInstitution={setSelectedInstitutionId}
            allStudents={students}
            onCommitBatch={handleCommitBatch}
          />
        )}

        {activeTab === 'student' && (
          <StudentPortal
            student={currentStudent}
            allStudents={students}
            onSelectStudent={setSelectedStudentId}
            consentRequests={consentRequests}
            onUpdateConsent={handleUpdateConsent}
          />
        )}

        {activeTab === 'employer' && (
          <EmployerVerifier
            students={students}
            consentRequests={consentRequests}
            onRequestConsent={handleRequestConsent}
          />
        )}

        {activeTab === 'sih_spec' && (
          <SihPresentationView onNavigateTab={setActiveTab} />
        )}
      </main>

      {/* Clean Domain Footer with Reference & Compliance Notice */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">APAAR-VERIFY</span>
            <span>·</span>
            <span>Smart India Hackathon 2026 (SIH26263)</span>
            <span>·</span>
            <span>Team Phoenix</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Aligned with NEP 2020 & DPDP Act 2023</span>
            <span>·</span>
            <span>National Academic Depository (DigiLocker / ABC)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

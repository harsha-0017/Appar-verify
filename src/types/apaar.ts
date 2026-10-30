export type UserRole = 'aicte_officer' | 'institution_admin' | 'student' | 'employer';

export type AdmissionQuota = 'General' | 'OBC' | 'SC' | 'ST' | 'EWS' | 'TFW' | 'NRI' | 'OCI_FN';

export type StudentStatus = 'Verified' | 'Flagged' | 'Duplicate' | 'Exceeds_Cap' | 'Ghost_Suspect';

export interface ConsentToken {
  id: string;
  employerName: string;
  verifierType: 'Employer' | 'Higher Education' | 'Background Verifier';
  purpose: string;
  grantedAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
}

export interface Student {
  id: string;
  apaarId: string; // 12-digit string "123456789012"
  formattedApaarId: string; // "1234 5678 9012"
  name: string;
  fatherName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  institutionId: string;
  institutionName: string;
  aictePid: string;
  course: string;
  branch: string;
  admissionYear: number;
  semester: number;
  admissionQuota: AdmissionQuota;
  status: StudentStatus;
  statusReason?: string;
  digiLockerLinked: boolean;
  abcAccountId: string; // Academic Bank of Credits ID
  earnedCredits: number;
  digitalSignatureHash: string;
  signedTimestamp: string;
  aadhaarMasked: string; // "XXXX-XXXX-8912"
  mobileMasked: string; // "XXXXXX9012"
  emailMasked: string; // "r***@gmail.com"
  consentTokens: ConsentToken[];
}

export interface BranchQuota {
  code: string;
  name: string;
  approvedIntake: number;
  currentEnrolled: number;
  maxNriFnSupernumerary: number; // typically 15% of approved intake
  currentNriFn: number;
}

export interface Institution {
  id: string;
  aictePid: string;
  name: string;
  code: string;
  state: string;
  city: string;
  type: 'Government' | 'Govt-Aided' | 'Autonomous' | 'Private';
  contactEmail: string;
  branches: BranchQuota[];
  riskScore: number; // 0 - 100
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  riskFactors: {
    factor: string;
    weight: number;
    description: string;
  }[];
  totalApprovedSeats: number;
  totalEnrolled: number;
  activeFlaggedStudents: number;
  crossInstitutionDuplicateCount: number;
  lastBatchUploadedAt: string;
  complianceStatus: 'Fully Compliant' | 'Under Review' | 'Notice Issued' | 'Suspended';
}

export interface ValidationIssue {
  rowNumber: number;
  apaarId: string;
  studentName: string;
  branch: string;
  type: 'INVALID_APAAR_FORMAT' | 'CHECKSUM_FAILED' | 'INTRA_BATCH_DUPLICATE' | 'CROSS_INSTITUTE_DUPLICATE' | 'SEAT_CAP_EXCEEDED' | 'NRI_QUOTA_EXCEEDED' | 'GHOST_ENROLMENT_FLAG';
  severity: 'CRITICAL' | 'WARNING';
  message: string;
  conflictingDetails?: string;
  suggestedAction: string;
}

export interface BatchUploadResult {
  batchId: string;
  timestamp: string;
  institutionId: string;
  fileName: string;
  totalRows: number;
  validCount: number;
  warningCount: number;
  errorCount: number;
  issues: ValidationIssue[];
  passedRows: Partial<Student>[];
}

export interface AnomalyAlert {
  id: string;
  institutionId: string;
  institutionName: string;
  severity: 'critical' | 'high' | 'medium' | 'info';
  category: 'SEAT_CAP_BREACH' | 'CROSS_COLLEGE_DOUBLE_ADMISSION' | 'NRI_QUOTA_SPIKE' | 'GHOST_ENROLMENT' | 'BATCH_VALIDATION_FAILURE';
  title: string;
  description: string;
  detectedAt: string;
  affectedApaarId?: string;
  affectedStudentName?: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'NOTICE_ISSUED';
  actionTaken?: string;
}

export interface ConsentRequest {
  id: string;
  studentApaarId: string;
  studentName: string;
  verifierName: string;
  verifierOrg: string;
  verifierType: 'Employer' | 'Higher Education' | 'Background Verifier';
  requestedFields: string[];
  purpose: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  expiresAt: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  action: string;
  actorName: string;
  actorRole: string;
  targetApaarId?: string;
  dpdpCategory: 'CONSENT' | 'ACCESS_CONTROL' | 'DATA_VALIDATION' | 'ENROLMENT_VERIFICATION' | 'DISPUTE_LOG';
  details: string;
  tamperProofHash: string;
}

export interface QRVerificationPayload {
  apaarId: string;
  fullName: string;
  institutionName: string;
  aictePid: string;
  courseBranch: string;
  admissionYear: number;
  status: StudentStatus;
  digitalSignature: string;
  issuedAt: string;
  consentGranted: boolean;
  tamperVerificationUrl: string;
}

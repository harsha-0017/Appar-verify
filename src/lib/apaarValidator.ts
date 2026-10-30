/**
 * APAAR ID validation and verification logic
 * 12-digit lifelong student ID under NEP 2020 (One Nation, One Student ID)
 * Uses Verhoeff Checksum Algorithm as standardized by Indian Digital Identity systems.
 */

import { Institution, Student, ValidationIssue } from '../types/apaar';

// Verhoeff multiplication table 'd'
const verhoeffD = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

// Verhoeff permutation table 'p'
const verhoeffP = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

// Verhoeff inverse table 'inv'
const verhoeffInv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

/**
 * Validates a number string using the Verhoeff check algorithm
 */
export function validateVerhoeff(numStr: string): boolean {
  const clean = numStr.replace(/\s+/g, '');
  if (!/^\d{12}$/.test(clean)) return false;

  let c = 0;
  const reversed = clean.split('').reverse().map(Number);
  for (let i = 0; i < reversed.length; i++) {
    c = verhoeffD[c][verhoeffP[i % 8][reversed[i]]];
  }
  return c === 0;
}

/**
 * Compute the Verhoeff checksum digit for an 11-digit base
 */
export function generateVerhoeffChecksum(elevenDigits: string): number {
  let c = 0;
  const reversed = elevenDigits.split('').reverse().map(Number);
  for (let i = 0; i < reversed.length; i++) {
    c = verhoeffD[c][verhoeffP[(i + 1) % 8][reversed[i]]];
  }
  return verhoeffInv[c];
}

/**
 * Generates a structurally valid 12-digit APAAR ID
 */
export function generateValidApaarId(prefixSeed: string = '9842'): string {
  // Generate 11 random digits starting with seed
  let eleven = prefixSeed;
  while (eleven.length < 11) {
    eleven += Math.floor(Math.random() * 10).toString();
  }
  const checkDigit = generateVerhoeffChecksum(eleven);
  return eleven + checkDigit.toString();
}

/**
 * Format 12-digit ID with spaces: "9842 1083 4912"
 */
export function formatApaarId(id: string): string {
  const clean = id.replace(/\s+/g, '');
  if (clean.length !== 12) return id;
  return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8, 12)}`;
}

/**
 * Validates format and checksum
 */
export function validateApaarStructure(apaarId: string): { isValid: boolean; message?: string } {
  const clean = apaarId.replace(/\s+/g, '');
  if (!clean) {
    return { isValid: false, message: 'APAAR ID cannot be empty' };
  }
  if (!/^\d+$/.test(clean)) {
    return { isValid: false, message: 'APAAR ID must contain only digits (0-9)' };
  }
  if (clean.length !== 12) {
    return { isValid: false, message: `Expected 12 digits, found ${clean.length} digits` };
  }
  if (clean.startsWith('0') || clean.startsWith('1000')) {
    return { isValid: false, message: 'Invalid APAAR prefix. Government IDs cannot begin with reserved sequence' };
  }
  const isValidCheck = validateVerhoeff(clean);
  if (!isValidCheck) {
    return { isValid: false, message: 'Verhoeff checksum failure: Invalid digit configuration or transcription error' };
  }
  return { isValid: true };
}

export interface RawCsvRow {
  apaarId: string;
  name: string;
  fatherName?: string;
  dob?: string;
  gender?: string;
  branch: string;
  admissionYear?: string | number;
  admissionQuota?: string;
}

/**
 * Validates a batch of student records against:
 * 1. APAAR ID structure & checksum
 * 2. Intra-batch duplicates (same batch submitting student twice)
 * 3. Cross-institution concurrency (student already marked active at another AICTE college!)
 * 4. Institution approved seat cap per branch
 * 5. NRI/OCI supernumerary quota cap (max 15% supernumerary)
 */
export function validateBatchRecords(
  rows: RawCsvRow[],
  currentInstitution: Institution,
  allGlobalStudents: Student[]
): {
  issues: ValidationIssue[];
  validRows: Partial<Student>[];
  counts: { total: number; valid: number; warnings: number; errors: number };
} {
  const issues: ValidationIssue[] = [];
  const validRows: Partial<Student>[] = [];
  const batchApaarSeen = new Map<string, number>(); // apaar -> row number

  // Track branch counts dynamically in this batch
  const branchEnrolledTracker = new Map<string, number>();
  const branchNriTracker = new Map<string, number>();

  currentInstitution.branches.forEach((b) => {
    branchEnrolledTracker.set(b.name.toLowerCase(), b.currentEnrolled);
    branchNriTracker.set(b.name.toLowerCase(), b.currentNriFn);
  });

  rows.forEach((row, index) => {
    const rowNum = index + 1;
    const cleanId = (row.apaarId || '').replace(/\s+/g, '');
    let hasCriticalError = false;

    // Check 1: Format & Checksum
    const structCheck = validateApaarStructure(cleanId);
    if (!structCheck.isValid) {
      issues.push({
        rowNumber: rowNum,
        apaarId: cleanId || 'EMPTY',
        studentName: row.name || 'Unknown',
        branch: row.branch || 'Unassigned',
        type: structCheck.message?.includes('checksum') ? 'CHECKSUM_FAILED' : 'INVALID_APAAR_FORMAT',
        severity: 'CRITICAL',
        message: structCheck.message || 'Invalid APAAR ID',
        suggestedAction: 'Verify against student Aadhaar-linked DigiLocker APAAR card',
      });
      hasCriticalError = true;
    }

    // Check 2: Intra-Batch Duplicate
    if (cleanId && batchApaarSeen.has(cleanId)) {
      const priorRow = batchApaarSeen.get(cleanId);
      issues.push({
        rowNumber: rowNum,
        apaarId: cleanId,
        studentName: row.name || 'Unknown',
        branch: row.branch || 'Unassigned',
        type: 'INTRA_BATCH_DUPLICATE',
        severity: 'CRITICAL',
        message: `Duplicate APAAR ID within this batch (previously submitted at row #${priorRow})`,
        suggestedAction: 'Remove duplicate row before final submission',
      });
      hasCriticalError = true;
    } else if (cleanId) {
      batchApaarSeen.set(cleanId, rowNum);
    }

    // Check 3: Cross-Institution Duplicate
    // Check if student is actively enrolled at ANOTHER institution
    const conflictingEnrollment = allGlobalStudents.find(
      (s) => s.apaarId.replace(/\s+/g, '') === cleanId && s.institutionId !== currentInstitution.id && s.status === 'Verified'
    );
    if (conflictingEnrollment) {
      issues.push({
        rowNumber: rowNum,
        apaarId: cleanId,
        studentName: row.name || 'Unknown',
        branch: row.branch || 'Unassigned',
        type: 'CROSS_INSTITUTE_DUPLICATE',
        severity: 'CRITICAL',
        message: `Student concurrently enrolled in another AICTE institution!`,
        conflictingDetails: `Enrolled at "${conflictingEnrollment.institutionName}" (${conflictingEnrollment.aictePid}) in ${conflictingEnrollment.branch}`,
        suggestedAction: 'Require student migration/cancellation NOC from prior institute before onboarding',
      });
      hasCriticalError = true;
    }

    // Check 4: Approved Intake Seat Cap
    const branchObj = currentInstitution.branches.find(
      (b) => b.name.toLowerCase() === (row.branch || '').toLowerCase() || b.code.toLowerCase() === (row.branch || '').toLowerCase()
    );

    if (branchObj) {
      const currentCount = branchEnrolledTracker.get(branchObj.name.toLowerCase()) || 0;
      if (currentCount >= branchObj.approvedIntake) {
        issues.push({
          rowNumber: rowNum,
          apaarId: cleanId,
          studentName: row.name || 'Unknown',
          branch: branchObj.name,
          type: 'SEAT_CAP_EXCEEDED',
          severity: 'CRITICAL',
          message: `Intake exceeds AICTE Approved Seat Cap of ${branchObj.approvedIntake} for ${branchObj.name}`,
          conflictingDetails: `Capacity: ${branchObj.approvedIntake} | Attempting row ${currentCount + 1}`,
          suggestedAction: 'Apply for AICTE supernumerary expansion or reassign student to unfilled branch',
        });
        hasCriticalError = true;
      } else {
        // Increment for batch calculation
        branchEnrolledTracker.set(branchObj.name.toLowerCase(), currentCount + 1);
      }

      // Check 5: Supernumerary NRI/OCI/FN Quota check
      const quota = (row.admissionQuota || 'General').toUpperCase();
      if (quota === 'NRI' || quota === 'OCI_FN') {
        const currentNri = branchNriTracker.get(branchObj.name.toLowerCase()) || 0;
        if (currentNri >= branchObj.maxNriFnSupernumerary) {
          issues.push({
            rowNumber: rowNum,
            apaarId: cleanId,
            studentName: row.name || 'Unknown',
            branch: branchObj.name,
            type: 'NRI_QUOTA_EXCEEDED',
            severity: 'CRITICAL',
            message: `NRI/OCI/FN quota exceeded AICTE 15% supernumerary ceiling (${branchObj.maxNriFnSupernumerary} max seats)`,
            suggestedAction: 'Must be verified by AICTE NRI Admissions Committee',
          });
          hasCriticalError = true;
        } else {
          branchNriTracker.set(branchObj.name.toLowerCase(), currentNri + 1);
        }
      }
    }

    if (!hasCriticalError) {
      validRows.push({
        apaarId: cleanId,
        formattedApaarId: formatApaarId(cleanId),
        name: row.name,
        fatherName: row.fatherName || 'Not Provided',
        dob: row.dob || '2004-06-15',
        gender: (row.gender as any) || 'Male',
        institutionId: currentInstitution.id,
        institutionName: currentInstitution.name,
        aictePid: currentInstitution.aictePid,
        course: 'B.Tech',
        branch: branchObj ? branchObj.name : row.branch,
        admissionYear: Number(row.admissionYear) || 2026,
        semester: 1,
        admissionQuota: (row.admissionQuota as any) || 'General',
        status: 'Verified',
        digiLockerLinked: true,
        abcAccountId: `ABC-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100 + Math.random() * 900)}`,
        earnedCredits: 0,
        digitalSignatureHash: generateDeterministicHash(cleanId + currentInstitution.aictePid),
        signedTimestamp: new Date().toISOString(),
        aadhaarMasked: 'XXXX-XXXX-' + cleanId.slice(-4),
        mobileMasked: 'XXXXXX' + cleanId.slice(-4),
        emailMasked: (row.name || 'student').toLowerCase().replace(/\s+/g, '') + '@domain.edu.in',
        consentTokens: [],
      });
    }
  });

  const criticalIssues = issues.filter((i) => i.severity === 'CRITICAL');
  const warningIssues = issues.filter((i) => i.severity === 'WARNING');

  return {
    issues,
    validRows,
    counts: {
      total: rows.length,
      valid: validRows.length,
      warnings: warningIssues.length,
      errors: criticalIssues.length,
    },
  };
}

/**
 * Deterministic SHA-256 simulation helper for client-side tamper-proof demonstration
 */
export function generateDeterministicHash(seed: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  const h1 = (hash >>> 0).toString(16).padStart(8, '0');
  
  let hash2 = 0x5a17b2e9;
  for (let i = seed.length - 1; i >= 0; i--) {
    hash2 ^= seed.charCodeAt(i);
    hash2 += (hash2 << 2) + (hash2 << 5) + (hash2 << 9) + (hash2 << 13) + (hash2 << 21);
  }
  const h2 = (hash2 >>> 0).toString(16).padStart(8, '0');
  const salt = 'a8f7e2c901bd49ef554a326190beac4d';
  return `0x${h1}${h2}${salt}`.slice(0, 66);
}

/**
 * Institution Risk Scoring Engine (0 to 100)
 * Evaluates:
 * - Seat Cap Overages (Weight: 40)
 * - Cross-Institution Concurrency Rate (Weight: 30)
 * - NRI/Supernumerary Quota anomalies (Weight: 20)
 * - Batch rejection history (Weight: 10)
 */
export function calculateInstitutionRiskScore(
  institution: Institution,
  flaggedCount: number,
  duplicateCount: number
): { score: number; level: 'Low' | 'Moderate' | 'High' | 'Severe'; factors: { factor: string; weight: number; description: string }[] } {
  let score = 5; // baseline nominal
  const factors: { factor: string; weight: number; description: string }[] = [];

  // Check seat occupancy vs cap
  let seatOvershoot = 0;
  institution.branches.forEach((b) => {
    if (b.currentEnrolled > b.approvedIntake) {
      seatOvershoot += b.currentEnrolled - b.approvedIntake;
    }
  });

  if (seatOvershoot > 0) {
    const impact = Math.min(45, seatOvershoot * 15);
    score += impact;
    factors.push({
      factor: 'Seat Cap Breach',
      weight: impact,
      description: `${seatOvershoot} student(s) enrolled beyond AICTE approved intake`,
    });
  }

  // Cross institution duplicate rate
  if (duplicateCount > 0) {
    const impact = Math.min(35, duplicateCount * 18);
    score += impact;
    factors.push({
      factor: 'Cross-College Concurrency',
      weight: impact,
      description: `${duplicateCount} student(s) concurrently flagged in other universities`,
    });
  }

  // NRI / Supernumerary quota check
  let nriExcess = 0;
  institution.branches.forEach((b) => {
    if (b.currentNriFn > b.maxNriFnSupernumerary) {
      nriExcess += b.currentNriFn - b.maxNriFnSupernumerary;
    }
  });

  if (nriExcess > 0) {
    const impact = Math.min(25, nriExcess * 12);
    score += impact;
    factors.push({
      factor: 'Supernumerary Quota Anomaly',
      weight: impact,
      description: `NRI/OCI admissions exceed AICTE statutory 15% threshold`,
    });
  }

  if (flaggedCount > 3) {
    score += 10;
    factors.push({
      factor: 'Identity Mismatch History',
      weight: 10,
      description: 'Multiple APAAR checksum and DigiLocker linkage failures recorded',
    });
  }

  score = Math.min(100, Math.max(0, score));

  let level: 'Low' | 'Moderate' | 'High' | 'Severe' = 'Low';
  if (score >= 75) level = 'Severe';
  else if (score >= 50) level = 'High';
  else if (score >= 25) level = 'Moderate';

  return { score, level, factors };
}

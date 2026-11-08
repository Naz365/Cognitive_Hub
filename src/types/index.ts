export type SyllabusCode = '0478' | '9618' | '4CP0' | '4IT1';

export type ExamBoard = 'Cambridge' | 'Pearson Edexcel';

export interface CourseInfo {
  code: SyllabusCode;
  board: ExamBoard;
  title: string;
  level: string;
  description: string;
  practicalFocus: string[];
  targetSeries: string[];
  monthlyFeeBDT: number;
  badgeColor: string;
}

export type DeskStatus = 'available' | 'hold' | 'enrolled';

export interface Desk {
  id: string;
  number: 1 | 2 | 3;
  label: 'Desk 01' | 'Desk 02' | 'Desk 03';
  status: DeskStatus;
  studentName?: string;
  studentPhone?: string;
  admissionId?: string;
  holdExpiresAt?: string; // ISO 8601 string
}

export interface Batch {
  id: string;
  name: string;
  courseCode: SyllabusCode;
  daysSchedule: string;
  timeSlot: string;
  capacity: 3;
  desks: [Desk, Desk, Desk];
  waitlistCount: number;
}

export interface DiagnosticQuestion {
  id: string;
  courseCode: SyllabusCode;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: 'logic' | 'data-representation' | 'architecture' | 'problem-solving';
}

export interface AdmissionRecord {
  id: string;
  admissionNumber: string; // e.g. CH-2026-0042
  studentName: string;
  studentEmail?: string;
  studentPhone: string;
  guardianWhatsApp: string;
  courseCode: SyllabusCode;
  targetSeries: string;
  batchId: string;
  batchName: string;
  deskId: string;
  deskNumber: 1 | 2 | 3;
  status: 'hold' | 'enrolled' | 'expired' | 'cancelled';
  holdExpiresAt: string;
  createdAt: string;
  diagnosticScore?: {
    correct: number;
    total: number;
    percentage: number;
  };
  payment: {
    status: 'unpaid' | 'pending_verification' | 'verified' | 'rejected';
    amountBDT: number;
    method?: 'bkash_manual' | 'nagad_manual' | 'sslcommerz';
    trxId?: string;
    submittedAt?: string;
    verifiedAt?: string;
    verifiedBy?: string;
  };
  receiptId?: string;
}

export interface WaitlistEntry {
  id: string;
  studentName: string;
  studentPhone: string;
  guardianWhatsApp: string;
  courseCode: SyllabusCode;
  batchId: string;
  batchName: string;
  createdAt: string;
  status: 'waiting' | 'offered' | 'enrolled';
}

export interface StudioStats {
  totalBatches: number;
  totalDesks: number;
  enrolledDesks: number;
  holdDesks: number;
  availableDesks: number;
  waitlistTotal: number;
  pendingTrxApprovals: number;
  projectedRevenueBDT: number;
  collectedRevenueBDT: number;
}

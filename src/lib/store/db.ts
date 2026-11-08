import fs from 'fs';
import path from 'path';
import { Batch, AdmissionRecord, WaitlistEntry, StudioStats, SyllabusCode, DeskStatus } from '@/types';
import { COURSES, STUDIO_CONFIG } from '@/lib/constants';

interface StoreData {
  batches: Batch[];
  admissions: AdmissionRecord[];
  waitlist: WaitlistEntry[];
  admissionSequence: number;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'studio-store.json');

// Initial seed batches if database is fresh
function getInitialBatches(): Batch[] {
  return [
    {
      id: 'batch-0478-weekend-am',
      name: 'Batch A1: Weekend Prime',
      courseCode: '0478',
      daysSchedule: 'Friday & Saturday',
      timeSlot: '10:00 AM – 12:00 PM',
      capacity: 3,
      waitlistCount: 0,
      desks: [
        { id: 'desk-0478-a1-1', number: 1, label: 'Desk 01', status: 'available' },
        { id: 'desk-0478-a1-2', number: 2, label: 'Desk 02', status: 'available' },
        { id: 'desk-0478-a1-3', number: 3, label: 'Desk 03', status: 'available' },
      ],
    },
    {
      id: 'batch-0478-weekday-pm',
      name: 'Batch A2: Mon/Wed Evening',
      courseCode: '0478',
      daysSchedule: 'Monday & Wednesday',
      timeSlot: '5:00 PM – 7:00 PM',
      capacity: 3,
      waitlistCount: 0,
      desks: [
        { id: 'desk-0478-a2-1', number: 1, label: 'Desk 01', status: 'enrolled', studentName: 'Fahim Rahman' },
        { id: 'desk-0478-a2-2', number: 2, label: 'Desk 02', status: 'available' },
        { id: 'desk-0478-a2-3', number: 3, label: 'Desk 03', status: 'available' },
      ],
    },
    {
      id: 'batch-9618-weekend-pm',
      name: 'Batch B1: Weekend A-Level Focus',
      courseCode: '9618',
      daysSchedule: 'Friday & Saturday',
      timeSlot: '3:00 PM – 5:00 PM',
      capacity: 3,
      waitlistCount: 0,
      desks: [
        { id: 'desk-9618-b1-1', number: 1, label: 'Desk 01', status: 'enrolled', studentName: 'Tazrian Ahmed' },
        { id: 'desk-9618-b1-2', number: 2, label: 'Desk 02', status: 'enrolled', studentName: 'Nabil Haque' },
        { id: 'desk-9618-b1-3', number: 3, label: 'Desk 03', status: 'available' },
      ],
    },
    {
      id: 'batch-9618-weekday-pm',
      name: 'Batch B2: Sun/Tue A-Level Lab',
      courseCode: '9618',
      daysSchedule: 'Sunday & Tuesday',
      timeSlot: '6:30 PM – 8:30 PM',
      capacity: 3,
      waitlistCount: 1,
      desks: [
        { id: 'desk-9618-b2-1', number: 1, label: 'Desk 01', status: 'enrolled', studentName: 'Samiya Khan' },
        { id: 'desk-9618-b2-2', number: 2, label: 'Desk 02', status: 'enrolled', studentName: 'Rayan Chowdhury' },
        { id: 'desk-9618-b2-3', number: 3, label: 'Desk 03', status: 'hold', studentName: 'Ayman Sharif', holdExpiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString() },
      ],
    },
    {
      id: 'batch-4CP0-weekend-eve',
      name: 'Batch C1: Edexcel CS Practical',
      courseCode: '4CP0',
      daysSchedule: 'Friday & Saturday',
      timeSlot: '5:30 PM – 7:30 PM',
      capacity: 3,
      waitlistCount: 0,
      desks: [
        { id: 'desk-4cp0-c1-1', number: 1, label: 'Desk 01', status: 'available' },
        { id: 'desk-4cp0-c1-2', number: 2, label: 'Desk 02', status: 'available' },
        { id: 'desk-4cp0-c1-3', number: 3, label: 'Desk 03', status: 'available' },
      ],
    },
    {
      id: 'batch-4IT1-weekday-eve',
      name: 'Batch D1: Edexcel ICT Studio',
      courseCode: '4IT1',
      daysSchedule: 'Tuesday & Thursday',
      timeSlot: '4:30 PM – 6:30 PM',
      capacity: 3,
      waitlistCount: 0,
      desks: [
        { id: 'desk-4it1-d1-1', number: 1, label: 'Desk 01', status: 'enrolled', studentName: 'Zubair Hossain' },
        { id: 'desk-4it1-d1-2', number: 2, label: 'Desk 02', status: 'available' },
        { id: 'desk-4it1-d1-3', number: 3, label: 'Desk 03', status: 'available' },
      ],
    },
  ];
}

class StudioDatabase {
  private data: StoreData;
  private isLoaded = false;

  constructor() {
    this.data = {
      batches: [],
      admissions: [],
      waitlist: [],
      admissionSequence: 104,
    };
  }

  private ensureLoaded() {
    if (this.isLoaded) return;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.data = {
          batches: getInitialBatches(),
          admissions: [],
          waitlist: [],
          admissionSequence: 105,
        };
        this.persist();
      }
    } catch {
      this.data = {
        batches: getInitialBatches(),
        admissions: [],
        waitlist: [],
        admissionSequence: 105,
      };
    }
    this.isLoaded = true;
    this.cleanupExpiredHolds();
  }

  private persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist studio store:', err);
    }
  }

  // Auto-expire holds older than 24 hours without verified payment
  public cleanupExpiredHolds(): { expiredCount: number } {
    let expiredCount = 0;
    const now = new Date().getTime();

    for (const batch of this.data.batches) {
      for (const desk of batch.desks) {
        if (desk.status === 'hold' && desk.holdExpiresAt) {
          const expiresAt = new Date(desk.holdExpiresAt).getTime();
          if (now > expiresAt) {
            // Find corresponding admission record
            const admission = this.data.admissions.find(
              (a) => a.batchId === batch.id && a.deskId === desk.id && a.status === 'hold'
            );

            // If payment was not submitted or verified, release the desk
            if (!admission || admission.payment.status === 'unpaid' || admission.payment.status === 'rejected') {
              desk.status = 'available';
              delete desk.studentName;
              delete desk.studentPhone;
              delete desk.admissionId;
              delete desk.holdExpiresAt;

              if (admission) {
                admission.status = 'expired';
              }
              expiredCount++;
            }
          }
        }
      }
    }

    if (expiredCount > 0) {
      this.persist();
    }
    return { expiredCount };
  }

  public getBatches(courseCode?: SyllabusCode): Batch[] {
    this.ensureLoaded();
    this.cleanupExpiredHolds();
    if (courseCode) {
      return this.data.batches.filter((b) => b.courseCode === courseCode);
    }
    return this.data.batches;
  }

  public getBatchById(batchId: string): Batch | undefined {
    this.ensureLoaded();
    this.cleanupExpiredHolds();
    return this.data.batches.find((b) => b.id === batchId);
  }

  // Atomic reservation with concurrency protection
  public reserveDeskHold(params: {
    studentName: string;
    studentPhone: string;
    guardianWhatsApp: string;
    courseCode: SyllabusCode;
    targetSeries: string;
    batchId: string;
    deskNumber: 1 | 2 | 3;
    diagnosticScore?: { correct: number; total: number; percentage: number };
  }): { success: boolean; admission?: AdmissionRecord; reason?: string } {
    this.ensureLoaded();
    this.cleanupExpiredHolds();

    const batch = this.data.batches.find((b) => b.id === params.batchId);
    if (!batch) {
      return { success: false, reason: 'Selected batch does not exist.' };
    }

    const desk = batch.desks.find((d) => d.number === params.deskNumber);
    if (!desk) {
      return { success: false, reason: 'Invalid desk number. Only Desks 01, 02, and 03 exist.' };
    }

    // Atomic check: is desk truly available?
    if (desk.status !== 'available') {
      return {
        success: false,
        reason: `${desk.label} in ${batch.name} is currently ${desk.status.toUpperCase()}. Please select an available desk or join the priority waitlist.`,
      };
    }

    // Generate Admission Number e.g. CH-2026-0105
    this.data.admissionSequence += 1;
    const admissionNumber = `CH-2026-${String(this.data.admissionSequence).padStart(4, '0')}`;
    const holdDurationMs = STUDIO_CONFIG.holdDurationHours * 60 * 60 * 1000;
    const holdExpiresAt = new Date(Date.now() + holdDurationMs).toISOString();
    const course = COURSES[params.courseCode];

    const admissionRecord: AdmissionRecord = {
      id: `adm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      admissionNumber,
      studentName: params.studentName.trim(),
      studentPhone: params.studentPhone.trim(),
      guardianWhatsApp: params.guardianWhatsApp.trim(),
      courseCode: params.courseCode,
      targetSeries: params.targetSeries,
      batchId: batch.id,
      batchName: batch.name,
      deskId: desk.id,
      deskNumber: desk.number,
      status: 'hold',
      holdExpiresAt,
      createdAt: new Date().toISOString(),
      diagnosticScore: params.diagnosticScore,
      payment: {
        status: 'unpaid',
        amountBDT: course ? course.monthlyFeeBDT : 8500,
      },
      receiptId: `REC-${Date.now().toString().slice(-6)}`,
    };

    // Lock the desk in memory
    desk.status = 'hold';
    desk.studentName = params.studentName.trim();
    desk.studentPhone = params.studentPhone.trim();
    desk.admissionId = admissionNumber;
    desk.holdExpiresAt = holdExpiresAt;

    this.data.admissions.unshift(admissionRecord);
    this.persist();

    return { success: true, admission: admissionRecord };
  }

  // Submit manual TrxID (bKash / Nagad)
  public submitManualPayment(params: {
    admissionNumber: string;
    method: 'bkash_manual' | 'nagad_manual';
    trxId: string;
  }): { success: boolean; admission?: AdmissionRecord; reason?: string } {
    this.ensureLoaded();
    const admission = this.data.admissions.find((a) => a.admissionNumber === params.admissionNumber);
    if (!admission) {
      return { success: false, reason: 'Admission record not found.' };
    }

    if (admission.status === 'expired' || admission.status === 'cancelled') {
      return { success: false, reason: 'This hold reservation has expired or been cancelled.' };
    }

    admission.payment.status = 'pending_verification';
    admission.payment.method = params.method;
    admission.payment.trxId = params.trxId.trim().toUpperCase();
    admission.payment.submittedAt = new Date().toISOString();

    this.persist();
    return { success: true, admission };
  }

  // Teacher 1-tap verify manual payment
  public verifyPayment(params: {
    admissionNumber: string;
    action: 'approve' | 'reject';
    teacherId: string;
  }): { success: boolean; admission?: AdmissionRecord; reason?: string } {
    this.ensureLoaded();
    const admission = this.data.admissions.find((a) => a.admissionNumber === params.admissionNumber);
    if (!admission) {
      return { success: false, reason: 'Admission record not found.' };
    }

    const batch = this.data.batches.find((b) => b.id === admission.batchId);
    const desk = batch?.desks.find((d) => d.id === admission.deskId);

    if (params.action === 'approve') {
      admission.payment.status = 'verified';
      admission.payment.verifiedAt = new Date().toISOString();
      admission.payment.verifiedBy = params.teacherId;
      admission.status = 'enrolled';

      if (desk) {
        desk.status = 'enrolled';
        delete desk.holdExpiresAt;
      }
    } else {
      admission.payment.status = 'rejected';
      // Release desk back to available
      if (desk) {
        desk.status = 'available';
        delete desk.studentName;
        delete desk.studentPhone;
        delete desk.admissionId;
        delete desk.holdExpiresAt;
      }
      admission.status = 'cancelled';
    }

    this.persist();
    return { success: true, admission };
  }

  // Manual release of hold by teacher
  public releaseDeskHold(batchId: string, deskId: string): { success: boolean; reason?: string } {
    this.ensureLoaded();
    const batch = this.data.batches.find((b) => b.id === batchId);
    if (!batch) return { success: false, reason: 'Batch not found.' };

    const desk = batch.desks.find((d) => d.id === deskId);
    if (!desk) return { success: false, reason: 'Desk not found.' };

    const admission = this.data.admissions.find(
      (a) => a.batchId === batchId && a.deskId === deskId && (a.status === 'hold' || a.status === 'enrolled')
    );

    if (admission) {
      admission.status = 'cancelled';
    }

    desk.status = 'available';
    delete desk.studentName;
    delete desk.studentPhone;
    delete desk.admissionId;
    delete desk.holdExpiresAt;

    this.persist();
    return { success: true };
  }

  // 1-Click Priority Waitlist
  public addToWaitlist(params: {
    studentName: string;
    studentPhone: string;
    guardianWhatsApp: string;
    courseCode: SyllabusCode;
    batchId: string;
  }): { success: boolean; entry?: WaitlistEntry; reason?: string } {
    this.ensureLoaded();
    const batch = this.data.batches.find((b) => b.id === params.batchId);
    if (!batch) return { success: false, reason: 'Batch not found.' };

    const entry: WaitlistEntry = {
      id: `wait-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      studentName: params.studentName.trim(),
      studentPhone: params.studentPhone.trim(),
      guardianWhatsApp: params.guardianWhatsApp.trim(),
      courseCode: params.courseCode,
      batchId: batch.id,
      batchName: batch.name,
      createdAt: new Date().toISOString(),
      status: 'waiting',
    };

    batch.waitlistCount += 1;
    this.data.waitlist.push(entry);
    this.persist();

    return { success: true, entry };
  }

  public getAdmissions(): AdmissionRecord[] {
    this.ensureLoaded();
    return this.data.admissions;
  }

  public getAdmissionByNumber(admissionNumber: string): AdmissionRecord | undefined {
    this.ensureLoaded();
    return this.data.admissions.find((a) => a.admissionNumber === admissionNumber);
  }

  public getAdmissionByReceiptId(receiptId: string): AdmissionRecord | undefined {
    this.ensureLoaded();
    return this.data.admissions.find((a) => a.receiptId === receiptId);
  }

  public getWaitlist(): WaitlistEntry[] {
    this.ensureLoaded();
    return this.data.waitlist;
  }

  public getStats(): StudioStats {
    this.ensureLoaded();
    this.cleanupExpiredHolds();

    let totalDesks = 0;
    let enrolledDesks = 0;
    let holdDesks = 0;
    let availableDesks = 0;
    let projectedRevenueBDT = 0;
    let collectedRevenueBDT = 0;
    let pendingTrxApprovals = 0;

    for (const batch of this.data.batches) {
      const course = COURSES[batch.courseCode];
      const fee = course ? course.monthlyFeeBDT : 8500;

      for (const desk of batch.desks) {
        totalDesks++;
        if (desk.status === 'enrolled') {
          enrolledDesks++;
          collectedRevenueBDT += fee;
          projectedRevenueBDT += fee;
        } else if (desk.status === 'hold') {
          holdDesks++;
          projectedRevenueBDT += fee;
        } else {
          availableDesks++;
        }
      }
    }

    for (const adm of this.data.admissions) {
      if (adm.payment.status === 'pending_verification') {
        pendingTrxApprovals++;
      }
    }

    return {
      totalBatches: this.data.batches.length,
      totalDesks,
      enrolledDesks,
      holdDesks,
      availableDesks,
      waitlistTotal: this.data.waitlist.filter((w) => w.status === 'waiting').length,
      pendingTrxApprovals,
      projectedRevenueBDT,
      collectedRevenueBDT,
    };
  }
}

// Global singleton for Next.js hot reload safety
const globalForDb = globalThis as unknown as { studioDb: StudioDatabase };
export const studioDb = globalForDb.studioDb || new StudioDatabase();
if (process.env.NODE_ENV !== 'production') globalForDb.studioDb = studioDb;

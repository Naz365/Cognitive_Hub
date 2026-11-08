import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { AdmissionRecord } from '@/types';
import { COURSES, STUDIO_CONFIG } from '@/lib/constants';

export async function generateAdmissionReceiptPDF(admission: AdmissionRecord): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const course = COURSES[admission.courseCode];
  const receiptId = admission.receiptId || `REC-${Date.now().toString().slice(-6)}`;
  const verifyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/verify/${receiptId}`
    : `https://cognitivehub.edu.bd/verify/${receiptId}`;

  // Generate QR Data URL
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    width: 250,
    margin: 1,
    color: {
      dark: '#090D16',
      light: '#FFFFFF',
    },
  });

  // Dark Header Background
  doc.setFillColor(9, 13, 22); // #090D16
  doc.rect(0, 0, 210, 50, 'F');

  // Accent Line (Electric Cyan)
  doc.setFillColor(6, 182, 212); // #06B6D4
  doc.rect(0, 48, 210, 2, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('COGNITIVE HUB', 20, 22);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(34, 211, 238); // Cyan
  doc.text('EXCLUSIVE 3-DESK MICRO-STUDIO FOR CS & ICT', 20, 29);

  doc.setTextColor(156, 163, 175);
  doc.setFontSize(8);
  doc.text(`${STUDIO_CONFIG.location} | WhatsApp: ${STUDIO_CONFIG.whatsappFormatted}`, 20, 37);

  // Status Badge in Header
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(140, 14, 50, 20, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('ADMISSION RECEIPT', 145, 22);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(34, 211, 238);
  doc.text(receiptId, 145, 29);

  // Body Container
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Official Workstation Reservation Slip', 20, 65);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text(`Issued On: ${new Date(admission.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`, 20, 72);

  // Details Table Box
  doc.setDrawColor(229, 231, 235);
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(20, 78, 170, 74, 3, 3, 'FD');

  const rows = [
    ['Admission ID', admission.admissionNumber, 'Assigned Workstation', `Desk 0${admission.deskNumber} (Micro-Studio A)`],
    ['Student Name', admission.studentName, 'Syllabus & Code', `${course?.title || admission.courseCode} (${admission.courseCode})`],
    ['Guardian WhatsApp', admission.guardianWhatsApp, 'Target Exam Series', admission.targetSeries || 'Upcoming Series'],
    ['Batch Schedule', admission.batchName, 'Reservation Status', admission.status.toUpperCase()],
    ['Monthly Tuition Fee', `BDT ${admission.payment.amountBDT.toLocaleString()}`, 'Payment Status', admission.payment.status.toUpperCase()],
  ];

  let currentY = 88;
  doc.setFontSize(9);
  rows.forEach((row) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(75, 85, 99);
    doc.text(row[0] + ':', 26, currentY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(17, 24, 39);
    doc.text(row[1], 62, currentY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(75, 85, 99);
    doc.text(row[2] + ':', 110, currentY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(17, 24, 39);
    doc.text(row[3], 144, currentY);

    currentY += 12;
  });

  // Payment Verification Block
  doc.setDrawColor(209, 250, 229);
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(20, 160, 110, 48, 2, 2, 'FD');

  doc.setTextColor(6, 95, 70);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Payment & Verification Summary', 26, 170);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 65, 81);
  doc.text(`Method: ${admission.payment.method ? admission.payment.method.toUpperCase().replace('_', ' ') : 'Manual bKash/Nagad'}`, 26, 178);
  doc.text(`Transaction ID (TrxID): ${admission.payment.trxId || 'Pending Verification'}`, 26, 185);
  doc.text(`Verification Authority: ${admission.payment.verifiedBy || 'Lead Studio Instructor'}`, 26, 192);
  doc.text(`Studio WhatsApp: ${STUDIO_CONFIG.whatsappFormatted}`, 26, 199);

  // QR Code Verification Block
  doc.addImage(qrDataUrl, 'PNG', 140, 160, 48, 48);
  doc.setFontSize(7.5);
  doc.setTextColor(107, 114, 128);
  doc.text('Scan with any mobile phone to', 138, 214);
  doc.text('verify authentic desk reservation', 137, 218);

  // Micro-Studio Invariant Notice
  doc.setFillColor(243, 244, 246);
  doc.rect(20, 230, 170, 30, 'F');
  doc.setDrawColor(229, 231, 235);
  doc.rect(20, 230, 170, 30, 'D');

  doc.setTextColor(31, 41, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('MICRO-STUDIO STRICT 3-DESK POLICY & LAB RULES', 26, 238);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(75, 85, 99);
  doc.text('1. Each workstation is reserved exclusively. Maximum batch capacity is strictly capped at 3 desks.', 26, 244);
  doc.text('2. Unpaid holds without a submitted TrxID automatically release after 24 hours to the waitlist.', 26, 249);
  doc.text('3. Live lab equipment (Monaco code monitor, dual-display rig, and Pyodide IDE) are dedicated per desk.', 26, 254);

  // Footer
  doc.setFontSize(7.5);
  doc.setTextColor(156, 163, 175);
  doc.text('Cognitive Hub Micro-Studio Platform • Generated automatically with secure tamper-evident QR verification', 30, 280);

  return doc;
}

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Appointment, MedicalRecord, User } from '../types';

/**
 * Generate a PDF from an HTML element using html2canvas and jsPDF
 */
export async function exportElementToPdf(
  element: HTMLElement,
  fileName: string
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2, // High resolution (retina)
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pdfWidth - 20; // 10mm margins on sides
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  if (imgHeight <= pdfHeight - 20) {
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
  } else {
    // Multi-page or fit to single page if close
    const ratio = (pdfHeight - 20) / imgHeight;
    if (ratio > 0.85) {
      // Scale slightly to fit nicely on one page
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth * ratio, pdfHeight - 20);
    } else {
      // Split or fit
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 20);

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 20);
      }
    }
  }

  pdf.save(fileName);
}

/**
 * Direct programmatic PDF generator for Appointment Slip (standalone without needing mounted DOM)
 */
export function generateAppointmentSlipPdf(
  appointment: Appointment,
  patient?: User | null
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Primary Theme Colors
  const primaryColor: [number, number, number] = [225, 29, 72]; // Rose-600 #e11d48
  const darkNavy: [number, number, number] = [15, 23, 42]; // Slate-900 #0f172a
  const slateGray: [number, number, number] = [100, 116, 139]; // Slate-500 #64748b
  const lightBg: [number, number, number] = [248, 250, 252]; // Slate-50 #f8fafc
  const borderCol: [number, number, number] = [226, 232, 240]; // Slate-200 #e2e8f0

  // 1. Top Accent Stripe
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 5, 'F');

  // 2. Header
  // Logo & Brand Name
  doc.setFillColor(...primaryColor);
  doc.roundedRect(14, 12, 10, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('+', 19, 19, { align: 'center' });

  doc.setTextColor(...darkNavy);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('MedDesk', 27, 19);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateGray);
  doc.text('Better Care, Better Health · Multispecialty Clinical Network', 27, 23);

  // Right Header - Receipt Info
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkNavy);
  doc.text('OPD CONSULTATION SLIP', pageWidth - 14, 16, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateGray);
  doc.text(`Slip No: SLIP-${appointment.id.toUpperCase()}`, pageWidth - 14, 21, { align: 'right' });
  doc.text(`Date: ${appointment.date} | Time: ${appointment.time}`, pageWidth - 14, 25, { align: 'right' });

  // Thin separator
  doc.setDrawColor(...borderCol);
  doc.setLineWidth(0.3);
  doc.line(14, 28, pageWidth - 14, 28);

  // 3. Status Ribbon
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.setDrawColor(187, 247, 208); // emerald-200
  doc.roundedRect(14, 32, pageWidth - 28, 8, 1.5, 1.5, 'FD');
  doc.setTextColor(21, 128, 61); // emerald-700
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('STATUS: CONFIRMED & PAID (CASH ON DESK)', 18, 37.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Booking Ref: #${appointment.id} · NABH Accredited Facility`, pageWidth - 18, 37.5, { align: 'right' });

  // 4. Two-Column Patient & Consultation Details Cards
  const colY = 44;
  const colWidth = (pageWidth - 28 - 6) / 2;
  const colHeight = 44;

  // Left Card: Patient Info
  doc.setFillColor(...lightBg);
  doc.setDrawColor(...borderCol);
  doc.roundedRect(14, colY, colWidth, colHeight, 2, 2, 'FD');

  doc.setFillColor(225, 29, 72, 0.1);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('PATIENT INFORMATION', 18, colY + 6);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkNavy);
  doc.text('Patient Name:', 18, colY + 13);
  doc.setFont('helvetica', 'normal');
  doc.text(appointment.patientName, 42, colY + 13);

  doc.setFont('helvetica', 'bold');
  doc.text('UHID / Reg No:', 18, colY + 19);
  doc.setFont('helvetica', 'normal');
  doc.text(`UHID-${appointment.patientId.slice(0, 8).toUpperCase()}`, 42, colY + 19);

  doc.setFont('helvetica', 'bold');
  doc.text('Contact Phone:', 18, colY + 25);
  doc.setFont('helvetica', 'normal');
  doc.text(patient?.phone || '+91 98765 43210', 42, colY + 25);

  doc.setFont('helvetica', 'bold');
  doc.text('Email Address:', 18, colY + 31);
  doc.setFont('helvetica', 'normal');
  doc.text(appointment.patientEmail || patient?.email || 'patient@meddesk.com', 42, colY + 31);

  doc.setFont('helvetica', 'bold');
  doc.text('Age / Gender:', 18, colY + 37);
  doc.setFont('helvetica', 'normal');
  doc.text(`${patient?.gender ? `${patient.gender}` : 'Adult'} | Blood: ${patient?.bloodGroup || 'O+'}`, 42, colY + 37);

  // Right Card: Consultation Details
  const rightColX = 14 + colWidth + 6;
  doc.setFillColor(...lightBg);
  doc.setDrawColor(...borderCol);
  doc.roundedRect(rightColX, colY, colWidth, colHeight, 2, 2, 'FD');

  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('CONSULTATION & HOSPITAL DETAILS', rightColX + 4, colY + 6);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkNavy);
  doc.text('Doctor Name:', rightColX + 4, colY + 13);
  doc.setFont('helvetica', 'normal');
  doc.text(appointment.doctorName, rightColX + 28, colY + 13);

  doc.setFont('helvetica', 'bold');
  doc.text('Department:', rightColX + 4, colY + 19);
  doc.setFont('helvetica', 'normal');
  doc.text(appointment.department, rightColX + 28, colY + 19);

  doc.setFont('helvetica', 'bold');
  doc.text('Hospital / Center:', rightColX + 4, colY + 25);
  doc.setFont('helvetica', 'normal');
  doc.text(appointment.hospital, rightColX + 28, colY + 25);

  doc.setFont('helvetica', 'bold');
  doc.text('OPD Counter:', rightColX + 4, colY + 31);
  doc.setFont('helvetica', 'normal');
  doc.text('Counter 03 · Desk Room 204 (Floor 2)', rightColX + 28, colY + 31);

  doc.setFont('helvetica', 'bold');
  doc.text('Slot & Date:', rightColX + 4, colY + 37);
  doc.setFont('helvetica', 'normal');
  doc.text(`${appointment.date} at ${appointment.time}`, rightColX + 28, colY + 37);

  // 5. Itemized Table of Charges matching the template
  const tableY = 94;
  doc.setFillColor(15, 23, 42); // slate-900 header
  doc.roundedRect(14, tableY, pageWidth - 28, 7, 1, 1, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('#', 18, tableY + 4.8);
  doc.text('Service / Description', 28, tableY + 4.8);
  doc.text('Category', 110, tableY + 4.8);
  doc.text('Qty', 140, tableY + 4.8, { align: 'center' });
  doc.text('Rate', 162, tableY + 4.8, { align: 'right' });
  doc.text('Amount (INR)', pageWidth - 18, tableY + 4.8, { align: 'right' });

  // Rows
  const fee = appointment.fee || 500;
  const docFee = Math.round(fee * 0.8);
  const vitalsFee = Math.round(fee * 0.15);
  const vaultFee = fee - docFee - vitalsFee;

  const rows = [
    {
      idx: '1',
      title: 'Doctor OPD Specialist Consultation',
      sub: `Attending: ${appointment.doctorName} (${appointment.department})`,
      category: 'OPD Clinical',
      qty: '1',
      rate: `₹${docFee}`,
      amt: `₹${docFee}`,
    },
    {
      idx: '2',
      title: 'Clinical Triage & Vitals Assessment',
      sub: 'BP, SpO2, Heart Rate, Respiratory, Temperature & BMI',
      category: 'Diagnostics',
      qty: '1',
      rate: `₹${vitalsFee}`,
      amt: `₹${vitalsFee}`,
    },
    {
      idx: '3',
      title: 'Digital EHR & Medical Vault Processing',
      sub: 'HIPAA-compliant encrypted cloud records & digital prescription',
      category: 'Digital Health',
      qty: '1',
      rate: `₹${vaultFee}`,
      amt: `₹${vaultFee}`,
    },
  ];

  let currentY = tableY + 7;
  rows.forEach((row, i) => {
    // Alternating background
    if (i % 2 === 1) {
      doc.setFillColor(250, 250, 250);
      doc.rect(14, currentY, pageWidth - 28, 11, 'F');
    }

    doc.setDrawColor(...borderCol);
    doc.line(14, currentY + 11, pageWidth - 14, currentY + 11);

    doc.setTextColor(...darkNavy);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(row.idx, 18, currentY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.text(row.title, 28, currentY + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...slateGray);
    doc.text(row.sub, 28, currentY + 8.5);

    doc.setFontSize(7.5);
    doc.text(row.category, 110, currentY + 5.5);
    doc.text(row.qty, 140, currentY + 5.5, { align: 'center' });
    doc.text(row.rate, 162, currentY + 5.5, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkNavy);
    doc.text(row.amt, pageWidth - 18, currentY + 5.5, { align: 'right' });

    currentY += 11;
  });

  // 6. Payment Information (Left) and Billing Summary (Right)
  const summaryY = currentY + 4;

  // Left side: Payment Info Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(...borderCol);
  doc.roundedRect(14, summaryY, 95, 34, 2, 2, 'FD');

  doc.setTextColor(...darkNavy);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('PAYMENT DETAILS & VERIFICATION', 18, summaryY + 6);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateGray);
  doc.text('Payment Mode:', 18, summaryY + 12);
  doc.setTextColor(...darkNavy);
  doc.setFont('helvetica', 'bold');
  doc.text('Cash on Desk (Counter Payment)', 48, summaryY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateGray);
  doc.text('Receipt Ref:', 18, summaryY + 17);
  doc.setTextColor(...darkNavy);
  doc.setFont('helvetica', 'bold');
  doc.text(`CSH/MC-${appointment.id.slice(0, 10).toUpperCase()}-981`, 48, summaryY + 17);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateGray);
  doc.text('Payment Status:', 18, summaryY + 22);
  doc.setTextColor(21, 128, 61);
  doc.setFont('helvetica', 'bold');
  doc.text('SUCCESS (PAID IN FULL)', 48, summaryY + 22);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateGray);
  doc.text('Receipt Timestamp:', 18, summaryY + 27);
  doc.setTextColor(...darkNavy);
  doc.text(`${appointment.date}, ${appointment.time}`, 48, summaryY + 27);

  // Right side: Summary Breakdown
  const sumBoxX = 114;
  const sumBoxW = pageWidth - 14 - sumBoxX;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(...borderCol);
  doc.roundedRect(sumBoxX, summaryY, sumBoxW, 34, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateGray);
  doc.text('Subtotal:', sumBoxX + 4, summaryY + 8);
  doc.setTextColor(...darkNavy);
  doc.setFont('helvetica', 'bold');
  doc.text(`₹${fee}.00`, pageWidth - 18, summaryY + 8, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateGray);
  doc.text('Taxes & GST (Exempted):', sumBoxX + 4, summaryY + 14);
  doc.setTextColor(...darkNavy);
  doc.text('₹0.00', pageWidth - 18, summaryY + 14, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateGray);
  doc.text('Discount / Wellness Benefit:', sumBoxX + 4, summaryY + 20);
  doc.setTextColor(21, 128, 61);
  doc.text('-₹0.00', pageWidth - 18, summaryY + 20, { align: 'right' });

  // Divider
  doc.setDrawColor(...borderCol);
  doc.line(sumBoxX + 4, summaryY + 23, pageWidth - 18, summaryY + 23);

  // Total
  doc.setFillColor(225, 29, 72, 0.08);
  doc.rect(sumBoxX + 2, summaryY + 24, sumBoxW - 4, 8, 'F');
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('TOTAL PAID:', sumBoxX + 4, summaryY + 29.5);
  doc.text(`₹${fee}.00`, pageWidth - 18, summaryY + 29.5, { align: 'right' });

  // 7. Important Instructions Box
  const instY = summaryY + 38;
  doc.setFillColor(254, 242, 242); // rose-50
  doc.setDrawColor(254, 205, 211); // rose-200
  doc.roundedRect(14, instY, pageWidth - 28, 26, 2, 2, 'FD');

  doc.setTextColor(190, 18, 60); // rose-700
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('IMPORTANT PATIENT INSTRUCTIONS', 18, instY + 5.5);

  doc.setFontSize(7.2);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkNavy);
  doc.text('1. Please report to the hospital OPD Desk at least 15 minutes before your scheduled appointment time.', 18, instY + 10.5);
  doc.text('2. Present this confirmation slip (digital or printed) at Counter 03 for token validation and priority entry.', 18, instY + 14.5);
  doc.text('3. Carry past physical prescriptions, investigation test reports, and any continuous medications.', 18, instY + 18.5);
  doc.text('4. In case of emergency or rescheduling, call our 24/7 patient helpline at 1800-419-5566.', 18, instY + 22.5);

  // 8. Signatures & Verification Section
  const signY = instY + 30;

  // Digital Security Stamp
  doc.setDrawColor(225, 29, 72);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, signY, 50, 15, 1, 1);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('MEDDESK DIGITAL HEALTH VAULT', 39, signY + 4.5, { align: 'center' });
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text('ELECTRONICALLY VERIFIED & AUTHENTICATED', 39, signY + 8, { align: 'center' });
  doc.text(`REF ID: ${appointment.id.slice(0, 12).toUpperCase()}`, 39, signY + 11.5, { align: 'center' });

  // Doctor / Medical Admin Sign
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...slateGray);
  doc.text('Authorized Billing Officer / Superintendent:', pageWidth - 14, signY + 5, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkNavy);
  doc.text('Dr. A. K. Verma, Medical Superintendent', pageWidth - 14, signY + 10, { align: 'right' });
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateGray);
  doc.text('City Care Multispecialty Hospitals & Research Centre', pageWidth - 14, signY + 14, { align: 'right' });

  // 9. Footer
  doc.setDrawColor(...borderCol);
  doc.line(14, signY + 18, pageWidth - 14, signY + 18);

  doc.setFontSize(6.5);
  doc.setTextColor(...slateGray);
  doc.text('MedDesk Multispecialty Hospital · Sector 42, Health City · Helpline: 1800-419-5566 · Email: care@meddesk.com', pageWidth / 2, signY + 22, { align: 'center' });
  doc.text('This is a computer-generated official consultation receipt and does not require a physical signature.', pageWidth / 2, signY + 25.5, { align: 'center' });

  // Save the PDF
  doc.save(`MedDesk_Slip_${appointment.id}.pdf`);
}

/**
 * Generate PDF for Medical Records (Prescription, Test Report, Consultation)
 */
export function generateMedicalRecordPdf(
  record: MedicalRecord,
  patient?: User | null
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const primaryColor: [number, number, number] = [225, 29, 72];
  const darkNavy: [number, number, number] = [15, 23, 42];
  const slateGray: [number, number, number] = [100, 116, 139];
  const borderCol: [number, number, number] = [226, 232, 240];

  // Top Accent Stripe
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Header
  doc.setFillColor(...primaryColor);
  doc.roundedRect(14, 12, 10, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('+', 19, 19, { align: 'center' });

  doc.setTextColor(...darkNavy);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('MedDesk', 27, 19);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateGray);
  doc.text('Digital Health Vault · Official Medical Document', 27, 23);

  // Document Type Header
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkNavy);
  doc.text(record.category.toUpperCase(), pageWidth - 14, 16, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateGray);
  doc.text(`Record ID: REC-${record.id}`, pageWidth - 14, 21, { align: 'right' });
  doc.text(`Date: ${record.date}`, pageWidth - 14, 25, { align: 'right' });

  doc.setDrawColor(...borderCol);
  doc.line(14, 28, pageWidth - 14, 28);

  // Info Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(...borderCol);
  doc.roundedRect(14, 32, pageWidth - 28, 28, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkNavy);
  doc.text('Document Title:', 18, 39);
  doc.setFont('helvetica', 'normal');
  doc.text(record.title, 45, 39);

  doc.setFont('helvetica', 'bold');
  doc.text('Attending Doctor:', 18, 45);
  doc.setFont('helvetica', 'normal');
  doc.text(record.doctorName, 45, 45);

  doc.setFont('helvetica', 'bold');
  doc.text('Clinical Facility:', 18, 51);
  doc.setFont('helvetica', 'normal');
  doc.text(record.facility, 45, 51);

  doc.setFont('helvetica', 'bold');
  doc.text('Patient Name:', 115, 39);
  doc.setFont('helvetica', 'normal');
  doc.text(patient?.name || 'Patient', 140, 39);

  doc.setFont('helvetica', 'bold');
  doc.text('Patient UHID:', 115, 45);
  doc.setFont('helvetica', 'normal');
  doc.text(`UHID-${record.patientId.slice(0, 8).toUpperCase()}`, 140, 45);

  doc.setFont('helvetica', 'bold');
  doc.text('File Format:', 115, 51);
  doc.setFont('helvetica', 'normal');
  doc.text(`${record.fileType} (${record.fileSize})`, 140, 51);

  // Clinical Notes & Doctor Findings
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...borderCol);
  doc.roundedRect(14, 65, pageWidth - 28, 90, 2, 2, 'FD');

  doc.setFillColor(241, 245, 249);
  doc.rect(14, 65, pageWidth - 28, 8, 'F');
  doc.setTextColor(...darkNavy);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text("CLINICAL EVALUATION / DOCTOR'S FINDINGS & PRESCRIPTION", 18, 70.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...darkNavy);
  const splitNotes = doc.splitTextToSize(record.notes, pageWidth - 36);
  doc.text(splitNotes, 18, 80);

  // HIPAA Confidentiality Notice
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(...borderCol);
  doc.roundedRect(14, 160, pageWidth - 28, 20, 2, 2, 'FD');

  doc.setTextColor(...slateGray);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('CONFIDENTIALITY & PRIVACY NOTICE:', 18, 166);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('This clinical document contains personal health information protected by HIPAA and MedDesk Digital Health Privacy Regulations.', 18, 171);
  doc.text('Unauthorized distribution, copying, or disclosure is strictly prohibited.', 18, 175);

  // Sign-off
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkNavy);
  doc.text(record.doctorName, pageWidth - 18, 195, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...slateGray);
  doc.text('Certified Attending Specialist · Digital Signature Verified', pageWidth - 18, 200, { align: 'right' });

  // Save PDF
  doc.save(`MedDesk_Record_${record.id}.pdf`);
}

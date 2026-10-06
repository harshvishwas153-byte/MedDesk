package com.medicare.util;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.medicare.model.BillingSlip;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

/**
 * Server-Side PDF Consultation Slip Generator using iText 7.
 * Renders the reference OPD Consultation & Billing Slip in Java.
 */
public class PdfSlipGenerator {

    private static final DeviceRgb COLOR_PRIMARY = new DeviceRgb(225, 29, 72); // Rose-600
    private static final DeviceRgb COLOR_NAVY = new DeviceRgb(15, 23, 42); // Slate-900
    private static final DeviceRgb COLOR_LIGHT = new DeviceRgb(248, 250, 252); // Slate-50
    private static final DeviceRgb COLOR_BORDER = new DeviceRgb(226, 232, 240); // Slate-200

    public static byte[] generateSlipPdf(BillingSlip slip) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        pdf.setDefaultPageSize(PageSize.A4);
        Document document = new Document(pdf);
        document.setMargins(20, 20, 20, 20);

        // Header Table
        Table headerTable = new Table(UnitValue.createPercentArray(new float[]{60, 40})).useAllAvailableWidth();
        headerTable.setBorder(Border.NO_BORDER);

        Cell brandCell = new Cell().setBorder(Border.NO_BORDER);
        brandCell.add(new Paragraph("MediCare+ Healthcare System")
                .setFontSize(18).setBold().setFontColor(COLOR_PRIMARY));
        brandCell.add(new Paragraph("Better Care, Better Health · Multispecialty Clinical Network\nReg No: MC-DL-88219 · GSTIN: 07AAACH2412Q1ZX")
                .setFontSize(8).setFontColor(ColorConstants.GRAY));
        headerTable.addCell(brandCell);

        Cell docMetaCell = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT);
        docMetaCell.add(new Paragraph("OPD CONSULTATION SLIP")
                .setFontSize(14).setBold().setFontColor(COLOR_NAVY));
        docMetaCell.add(new Paragraph("Invoice: " + slip.getInvoiceId() + "\nDate: " + slip.getPaymentTimestamp())
                .setFontSize(8).setFontColor(ColorConstants.GRAY));
        headerTable.addCell(docMetaCell);
        document.add(headerTable);

        // Status Badge
        Table statusTable = new Table(UnitValue.createPercentArray(new float[]{100})).useAllAvailableWidth();
        Cell statusCell = new Cell().setBackgroundColor(new DeviceRgb(240, 253, 244))
                .setBorder(new SolidBorder(new DeviceRgb(187, 247, 208), 1))
                .setPadding(6);
        statusCell.add(new Paragraph("STATUS: PAID & CONFIRMED (ONLINE / UPI) · Booking Ref: " + slip.getAppointmentId())
                .setFontSize(9).setBold().setFontColor(new DeviceRgb(21, 128, 61)));
        statusTable.addCell(statusCell);
        document.add(statusTable);

        // Patient & Doctor Information (2 Columns)
        Table infoTable = new Table(UnitValue.createPercentArray(new float[]{50, 50})).useAllAvailableWidth();
        infoTable.setMarginTop(10);

        Cell patientCell = new Cell().setBackgroundColor(COLOR_LIGHT).setBorder(new SolidBorder(COLOR_BORDER, 1)).setPadding(8);
        patientCell.add(new Paragraph("PATIENT INFORMATION").setFontSize(9).setBold().setFontColor(COLOR_PRIMARY));
        patientCell.add(new Paragraph("Name: " + slip.getPatientName() + "\nUHID: UHID-" + slip.getPatientId() + "\nMode: General OPD")
                .setFontSize(8).setFontColor(COLOR_NAVY));
        infoTable.addCell(patientCell);

        Cell doctorCell = new Cell().setBackgroundColor(COLOR_LIGHT).setBorder(new SolidBorder(COLOR_BORDER, 1)).setPadding(8);
        doctorCell.add(new Paragraph("CONSULTATION DETAILS").setFontSize(9).setBold().setFontColor(COLOR_PRIMARY));
        doctorCell.add(new Paragraph("Doctor: " + slip.getDoctorName() + "\nDepartment: " + slip.getDepartment() + "\nHospital: " + slip.getHospital())
                .setFontSize(8).setFontColor(COLOR_NAVY));
        infoTable.addCell(doctorCell);
        document.add(infoTable);

        // Itemized Table of Charges
        Table chargesTable = new Table(UnitValue.createPercentArray(new float[]{10, 45, 15, 15, 15})).useAllAvailableWidth();
        chargesTable.setMarginTop(12);

        // Header Row
        chargesTable.addHeaderCell(new Cell().setBackgroundColor(COLOR_NAVY).add(new Paragraph("#").setFontSize(8).setBold().setFontColor(ColorConstants.WHITE)));
        chargesTable.addHeaderCell(new Cell().setBackgroundColor(COLOR_NAVY).add(new Paragraph("Service / Description").setFontSize(8).setBold().setFontColor(ColorConstants.WHITE)));
        chargesTable.addHeaderCell(new Cell().setBackgroundColor(COLOR_NAVY).add(new Paragraph("Qty").setFontSize(8).setBold().setFontColor(ColorConstants.WHITE).setTextAlignment(TextAlignment.CENTER)));
        chargesTable.addHeaderCell(new Cell().setBackgroundColor(COLOR_NAVY).add(new Paragraph("Rate").setFontSize(8).setBold().setFontColor(ColorConstants.WHITE).setTextAlignment(TextAlignment.RIGHT)));
        chargesTable.addHeaderCell(new Cell().setBackgroundColor(COLOR_NAVY).add(new Paragraph("Amount (INR)").setFontSize(8).setBold().setFontColor(ColorConstants.WHITE).setTextAlignment(TextAlignment.RIGHT)));

        // Rows
        chargesTable.addCell(new Cell().add(new Paragraph("1").setFontSize(8)));
        chargesTable.addCell(new Cell().add(new Paragraph("Doctor Specialist Consultation\nClinical Evaluation").setFontSize(8)));
        chargesTable.addCell(new Cell().add(new Paragraph("1").setFontSize(8).setTextAlignment(TextAlignment.CENTER)));
        chargesTable.addCell(new Cell().add(new Paragraph("Rs. " + slip.getDoctorFee()).setFontSize(8).setTextAlignment(TextAlignment.RIGHT)));
        chargesTable.addCell(new Cell().add(new Paragraph("Rs. " + slip.getDoctorFee()).setFontSize(8).setBold().setTextAlignment(TextAlignment.RIGHT)));

        chargesTable.addCell(new Cell().add(new Paragraph("2").setFontSize(8)));
        chargesTable.addCell(new Cell().add(new Paragraph("Clinical Vitals & Triage Assessment\nBP, SpO2, Heart Rate, BMI").setFontSize(8)));
        chargesTable.addCell(new Cell().add(new Paragraph("1").setFontSize(8).setTextAlignment(TextAlignment.CENTER)));
        chargesTable.addCell(new Cell().add(new Paragraph("Rs. " + slip.getVitalsFee()).setFontSize(8).setTextAlignment(TextAlignment.RIGHT)));
        chargesTable.addCell(new Cell().add(new Paragraph("Rs. " + slip.getVitalsFee()).setFontSize(8).setBold().setTextAlignment(TextAlignment.RIGHT)));

        chargesTable.addCell(new Cell().add(new Paragraph("3").setFontSize(8)));
        chargesTable.addCell(new Cell().add(new Paragraph("Digital EHR & Health Vault Processing\nEncrypted HIPAA Cloud Storage").setFontSize(8)));
        chargesTable.addCell(new Cell().add(new Paragraph("1").setFontSize(8).setTextAlignment(TextAlignment.CENTER)));
        chargesTable.addCell(new Cell().add(new Paragraph("Rs. " + slip.getVaultFee()).setFontSize(8).setTextAlignment(TextAlignment.RIGHT)));
        chargesTable.addCell(new Cell().add(new Paragraph("Rs. " + slip.getVaultFee()).setFontSize(8).setBold().setTextAlignment(TextAlignment.RIGHT)));

        document.add(chargesTable);

        // Payment Summary Box
        Table summaryTable = new Table(UnitValue.createPercentArray(new float[]{60, 40})).useAllAvailableWidth();
        summaryTable.setMarginTop(10);

        Cell paymentCell = new Cell().setBackgroundColor(COLOR_LIGHT).setBorder(new SolidBorder(COLOR_BORDER, 1)).setPadding(6);
        paymentCell.add(new Paragraph("PAYMENT VERIFICATION").setFontSize(8.5f).setBold().setFontColor(COLOR_NAVY));
        paymentCell.add(new Paragraph("Mode: " + slip.getPaymentMode() + "\nTxn Ref: " + slip.getTransactionRef() + "\nStatus: SUCCESS (PAID IN FULL)")
                .setFontSize(8).setFontColor(COLOR_NAVY));
        summaryTable.addCell(paymentCell);

        Cell totalCell = new Cell().setBackgroundColor(new DeviceRgb(254, 242, 242)).setBorder(new SolidBorder(new DeviceRgb(254, 205, 211), 1)).setPadding(6);
        totalCell.add(new Paragraph("TOTAL PAID: Rs. " + slip.getTotalAmount())
                .setFontSize(12).setBold().setFontColor(COLOR_PRIMARY).setTextAlignment(TextAlignment.RIGHT));
        totalCell.add(new Paragraph("GST (Healthcare Exempt): Rs. 0.00")
                .setFontSize(7.5f).setFontColor(ColorConstants.GRAY).setTextAlignment(TextAlignment.RIGHT));
        summaryTable.addCell(totalCell);
        document.add(summaryTable);

        // Instructions & Footer
        document.add(new Paragraph("\nIMPORTANT PATIENT INSTRUCTIONS:\n1. Report to OPD Counter 15 minutes before time.\n2. Present this slip for priority entry.\n3. 24x7 Emergency Helpline: 1800-419-5566.")
                .setFontSize(7.5f).setFontColor(ColorConstants.DARK_GRAY));

        document.add(new Paragraph("\nDr. A. K. Verma - Medical Superintendent, MediCare+ Central Multispecialty Hospital\nThis is a computer-generated official consultation slip.")
                .setFontSize(7).setFontColor(ColorConstants.GRAY).setTextAlignment(TextAlignment.CENTER));

        document.close();
        return baos.toByteArray();
    }
}

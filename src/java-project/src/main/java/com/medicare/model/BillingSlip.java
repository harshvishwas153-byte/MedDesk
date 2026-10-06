package com.medicare.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.sql.Timestamp;

/**
 * Model representing the Medical Consultation & Billing Slip (matching Reference Template).
 */
public class BillingSlip implements Serializable {
    private static final long serialVersionUID = 1L;

    private String invoiceId;
    private String appointmentId;
    private String patientId;
    private String patientName;
    private String doctorName;
    private String department;
    private String hospital;
    private BigDecimal doctorFee;
    private BigDecimal vitalsFee;
    private BigDecimal vaultFee;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private String paymentMode;
    private String paymentStatus; // "PAID", "PENDING"
    private String transactionRef;
    private Timestamp paymentTimestamp;

    public BillingSlip() {
        this.paymentStatus = "PAID";
        this.paymentMode = "UPI / Online Gateway";
        this.vitalsFee = BigDecimal.valueOf(150.00);
        this.vaultFee = BigDecimal.valueOf(50.00);
        this.discountAmount = BigDecimal.ZERO;
        this.taxAmount = BigDecimal.ZERO;
    }

    public static BillingSlip fromAppointment(Appointment apt) {
        BillingSlip slip = new BillingSlip();
        slip.setInvoiceId("INV-" + apt.getId());
        slip.setAppointmentId(apt.getId());
        slip.setPatientId(apt.getPatientId());
        slip.setPatientName(apt.getPatientName());
        slip.setDoctorName(apt.getDoctorName());
        slip.setDepartment(apt.getDepartment());
        slip.setHospital(apt.getHospital());
        
        BigDecimal total = apt.getFee() != null ? apt.getFee() : BigDecimal.valueOf(500.00);
        slip.setTotalAmount(total);
        
        // Breakdown calculations
        BigDecimal docShare = total.multiply(BigDecimal.valueOf(0.80)).setScale(2, java.math.RoundingMode.HALF_UP);
        BigDecimal vitalsShare = total.multiply(BigDecimal.valueOf(0.15)).setScale(2, java.math.RoundingMode.HALF_UP);
        BigDecimal vaultShare = total.subtract(docShare).subtract(vitalsShare);
        
        slip.setDoctorFee(docShare);
        slip.setVitalsFee(vitalsShare);
        slip.setVaultFee(vaultShare);
        slip.setTransactionRef("UPI/MC-" + apt.getId() + "-9821");
        return slip;
    }

    // Getters and Setters
    public String getInvoiceId() { return invoiceId; }
    public void setInvoiceId(String invoiceId) { this.invoiceId = invoiceId; }

    public String getAppointmentId() { return appointmentId; }
    public void setAppointmentId(String appointmentId) { this.appointmentId = appointmentId; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getHospital() { return hospital; }
    public void setHospital(String hospital) { this.hospital = hospital; }

    public BigDecimal getDoctorFee() { return doctorFee; }
    public void setDoctorFee(BigDecimal doctorFee) { this.doctorFee = doctorFee; }

    public BigDecimal getVitalsFee() { return vitalsFee; }
    public void setVitalsFee(BigDecimal vitalsFee) { this.vitalsFee = vitalsFee; }

    public BigDecimal getVaultFee() { return vaultFee; }
    public void setVaultFee(BigDecimal vaultFee) { this.vaultFee = vaultFee; }

    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }

    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getPaymentMode() { return paymentMode; }
    public void setPaymentMode(String paymentMode) { this.paymentMode = paymentMode; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getTransactionRef() { return transactionRef; }
    public void setTransactionRef(String transactionRef) { this.transactionRef = transactionRef; }

    public Timestamp getPaymentTimestamp() { return paymentTimestamp; }
    public void setPaymentTimestamp(Timestamp paymentTimestamp) { this.paymentTimestamp = paymentTimestamp; }
}

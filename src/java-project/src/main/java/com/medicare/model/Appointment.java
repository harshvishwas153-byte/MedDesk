package com.medicare.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.sql.Timestamp;

/**
 * Appointment Entity representing a scheduled clinical consultation.
 */
public class Appointment implements Serializable {
    private static final long serialVersionUID = 1L;

    private String id;
    private String patientId;
    private String patientName;
    private String patientEmail;
    private String doctorId;
    private String doctorName;
    private String department;
    private String hospital;
    private String date;
    private String time;
    private BigDecimal fee;
    private String status; // "Upcoming", "Completed", "Pending", "Cancelled"
    private String reason;
    private String notes;
    private String prescription;
    private Timestamp createdAt;

    public Appointment() {
        this.status = "Upcoming";
        this.fee = BigDecimal.valueOf(500.00);
    }

    public Appointment(String id, String patientId, String doctorId, String date, String time, BigDecimal fee) {
        this.id = id;
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.date = date;
        this.time = time;
        this.fee = fee;
        this.status = "Upcoming";
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getPatientEmail() { return patientEmail; }
    public void setPatientEmail(String patientEmail) { this.patientEmail = patientEmail; }

    public String getDoctorId() { return doctorId; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getHospital() { return hospital; }
    public void setHospital(String hospital) { this.hospital = hospital; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public BigDecimal getFee() { return fee; }
    public void setFee(BigDecimal fee) { this.fee = fee; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getPrescription() { return prescription; }
    public void setPrescription(String prescription) { this.prescription = prescription; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}

package com.medicare.model;

import java.io.Serializable;
import java.sql.Timestamp;

/**
 * Medical Record entity for Electronic Health Records (EHR) Vault.
 */
public class MedicalRecord implements Serializable {
    private static final long serialVersionUID = 1L;

    private String id;
    private String patientId;
    private String title;
    private String category; // "Prescriptions", "Test Reports", "Consultations"
    private String date;
    private String doctorName;
    private String facility;
    private String fileType;
    private String fileSize;
    private String notes;
    private String downloadUrl;
    private Timestamp createdAt;

    public MedicalRecord() {
        this.fileType = "PDF";
        this.fileSize = "1.4 MB";
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getFacility() { return facility; }
    public void setFacility(String facility) { this.facility = facility; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public String getFileSize() { return fileSize; }
    public void setFileSize(String fileSize) { this.fileSize = fileSize; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getDownloadUrl() { return downloadUrl; }
    public void setDownloadUrl(String downloadUrl) { this.downloadUrl = downloadUrl; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}

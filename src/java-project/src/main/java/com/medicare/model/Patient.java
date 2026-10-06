package com.medicare.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Concrete Patient Model demonstrating OOP Inheritance and Java Collections.
 */
public class Patient extends User {
    private static final long serialVersionUID = 1L;

    private String emergencyContact;
    private String insurancePolicyNumber;
    private List<MedicalRecord> recordsHistory;

    public Patient() {
        super();
        this.recordsHistory = new ArrayList<>();
        this.role = "PATIENT";
    }

    public Patient(String id, String name, String email, String phone) {
        super(id, name, email, "PATIENT");
        this.phone = phone;
        this.recordsHistory = new ArrayList<>();
    }

    @Override
    public String getRoleDisplayName() {
        return "Registered Hospital Patient";
    }

    public String getEmergencyContact() { return emergencyContact; }
    public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }

    public String getInsurancePolicyNumber() { return insurancePolicyNumber; }
    public void setInsurancePolicyNumber(String insurancePolicyNumber) { this.insurancePolicyNumber = insurancePolicyNumber; }

    public List<MedicalRecord> getRecordsHistory() { return recordsHistory; }
    public void setRecordsHistory(List<MedicalRecord> recordsHistory) { this.recordsHistory = recordsHistory; }

    public void addMedicalRecord(MedicalRecord record) {
        if (this.recordsHistory == null) {
            this.recordsHistory = new ArrayList<>();
        }
        this.recordsHistory.add(record);
    }
}

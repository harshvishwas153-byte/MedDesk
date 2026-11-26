package com.medicare.dao;

import com.medicare.exception.DatabaseException;
import com.medicare.model.MedicalRecord;
import com.medicare.util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * DAO for Medical Records EHR Vault.
 */
public class MedicalRecordDAO {

    private MedicalRecord mapRow(ResultSet rs) throws SQLException {
        MedicalRecord r = new MedicalRecord();
        r.setId(rs.getString("record_id"));
        r.setPatientId(rs.getString("patient_id"));
        r.setTitle(rs.getString("title"));
        r.setCategory(rs.getString("category"));
        r.setDate(rs.getString("record_date"));
        r.setDoctorName(rs.getString("doctor_name"));
        r.setFacility(rs.getString("facility"));
        r.setFileType(rs.getString("file_type"));
        r.setFileSize(rs.getString("file_size"));
        r.setNotes(rs.getString("clinical_notes"));
        r.setDownloadUrl(rs.getString("download_url"));
        r.setCreatedAt(rs.getTimestamp("created_at"));
        return r;
    }

    public List<MedicalRecord> findByPatientId(String patientId) throws DatabaseException {
        String sql = "SELECT * FROM medical_records WHERE patient_id = ? ORDER BY created_at DESC";
        List<MedicalRecord> list = new ArrayList<>();
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, patientId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRow(rs));
                }
            }
            return list;
        } catch (SQLException e) {
            throw new DatabaseException("Error retrieving medical records: " + e.getMessage(), e);
        }
    }

    public List<MedicalRecord> findAll() throws DatabaseException {
        String sql = "SELECT * FROM medical_records ORDER BY created_at DESC";
        List<MedicalRecord> list = new ArrayList<>();
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                list.add(mapRow(rs));
            }
            return list;
        } catch (SQLException e) {
            throw new DatabaseException("Error retrieving all medical records: " + e.getMessage(), e);
        }
    }

    public MedicalRecord findById(String recordId) throws DatabaseException {
        String sql = "SELECT * FROM medical_records WHERE record_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, recordId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
                return null;
            }
        } catch (SQLException e) {
            throw new DatabaseException("Error retrieving medical record by ID: " + e.getMessage(), e);
        }
    }

    public boolean createRecord(MedicalRecord record) throws DatabaseException {
        String sql = "INSERT INTO medical_records (record_id, patient_id, title, category, record_date, "
                + "doctor_name, facility, file_type, file_size, clinical_notes, download_url) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, record.getId());
            stmt.setString(2, record.getPatientId());
            stmt.setString(3, record.getTitle());
            stmt.setString(4, record.getCategory());
            stmt.setString(5, record.getDate());
            stmt.setString(6, record.getDoctorName());
            stmt.setString(7, record.getFacility());
            stmt.setString(8, record.getFileType());
            stmt.setString(9, record.getFileSize());
            stmt.setString(10, record.getNotes());
            stmt.setString(11, record.getDownloadUrl());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new DatabaseException("Error creating medical record: " + e.getMessage(), e);
        }
    }

    public boolean deleteRecord(String recordId) throws DatabaseException {
        String sql = "DELETE FROM medical_records WHERE record_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, recordId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new DatabaseException("Error deleting medical record: " + e.getMessage(), e);
        }
    }
}

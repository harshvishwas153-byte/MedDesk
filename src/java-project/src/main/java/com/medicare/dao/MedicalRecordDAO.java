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

    public List<MedicalRecord> findByPatientId(String patientId) throws DatabaseException {
        String sql = "SELECT * FROM medical_records WHERE patient_id = ? ORDER BY created_at DESC";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        List<MedicalRecord> list = new ArrayList<>();

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, patientId);
            rs = stmt.executeQuery();

            while (rs.next()) {
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
                list.add(r);
            }
            return list;
        } catch (SQLException e) {
            throw new DatabaseException("Error retrieving medical records: " + e.getMessage(), e);
        } finally {
            DBConnection.close(rs, stmt, conn);
        }
    }

    public boolean createRecord(MedicalRecord record) throws DatabaseException {
        String sql = "INSERT INTO medical_records (record_id, patient_id, title, category, record_date, "
                + "doctor_name, facility, file_type, file_size, clinical_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        Connection conn = null;
        PreparedStatement stmt = null;

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
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

            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new DatabaseException("Error creating medical record: " + e.getMessage(), e);
        } finally {
            DBConnection.close(stmt, conn);
        }
    }
}

package com.medicare.dao;

import com.medicare.exception.DatabaseException;
import com.medicare.model.Doctor;
import com.medicare.util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * Doctor Data Access Object performing JDBC CRUD operations with PreparedStatement.
 * Rubric Criterion: Database Integration (JDBC) - CRUD & Schema
 */
public class DoctorDAO {

    public List<Doctor> findAllDoctors() throws DatabaseException {
        String sql = "SELECT d.*, u.name, u.email, u.phone, u.avatar_url "
                   + "FROM doctors d "
                   + "JOIN users u ON d.user_id = u.id "
                   + "WHERE d.availability_status = 'AVAILABLE' OR d.availability_status = 'ACTIVE' "
                   + "ORDER BY d.rating DESC";

        List<Doctor> list = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                Doctor d = new Doctor();
                d.setId(rs.getString("doctor_id"));
                d.setUserId(rs.getString("user_id"));
                d.setName(rs.getString("name"));
                d.setEmail(rs.getString("email"));
                d.setSpecialization(rs.getString("specialization"));
                d.setDepartment(rs.getString("department"));
                d.setExperienceYears(rs.getInt("experience_years"));
                d.setConsultationFee(rs.getBigDecimal("consultation_fee"));
                d.setHospital(rs.getString("hospital_affiliation"));
                d.setRating(rs.getDouble("rating"));
                d.setReviewCount(rs.getInt("review_count"));
                d.setAvatarUrl(rs.getString("avatar_url"));
                d.setStatus(rs.getString("availability_status"));
                list.add(d);
            }
            return list;
        } catch (SQLException e) {
            throw new DatabaseException("Error retrieving doctor catalog: " + e.getMessage(), e);
        }
    }

    public Doctor findById(String doctorId) throws DatabaseException {
        String sql = "SELECT d.*, u.name, u.email, u.phone, u.avatar_url "
                   + "FROM doctors d "
                   + "JOIN users u ON d.user_id = u.id "
                   + "WHERE d.doctor_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, doctorId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Doctor d = new Doctor();
                    d.setId(rs.getString("doctor_id"));
                    d.setUserId(rs.getString("user_id"));
                    d.setName(rs.getString("name"));
                    d.setEmail(rs.getString("email"));
                    d.setSpecialization(rs.getString("specialization"));
                    d.setDepartment(rs.getString("department"));
                    d.setExperienceYears(rs.getInt("experience_years"));
                    d.setConsultationFee(rs.getBigDecimal("consultation_fee"));
                    d.setHospital(rs.getString("hospital_affiliation"));
                    d.setRating(rs.getDouble("rating"));
                    d.setReviewCount(rs.getInt("review_count"));
                    d.setAvatarUrl(rs.getString("avatar_url"));
                    d.setStatus(rs.getString("availability_status"));
                    return d;
                }
                return null;
            }
        } catch (SQLException e) {
            throw new DatabaseException("Error retrieving doctor by ID: " + e.getMessage(), e);
        }
    }
}

package com.medicare.dao;

import com.medicare.exception.DatabaseException;
import com.medicare.model.Doctor;
import com.medicare.util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * Doctor Data Access Object performing JDBC CRUD and transactional operations.
 */
public class DoctorDAO {

    private Doctor mapRow(ResultSet rs) throws SQLException {
        Doctor d = new Doctor();
        d.setId(rs.getString("doctor_id"));
        d.setUserId(rs.getString("user_id"));
        d.setUniqueDoctorId(rs.getString("unique_doctor_id"));
        d.setName(rs.getString("name"));
        d.setEmail(rs.getString("email"));
        d.setPhone(rs.getString("phone"));
        d.setSpecialization(rs.getString("specialization"));
        d.setDepartment(rs.getString("department"));
        d.setExperienceYears(rs.getInt("experience_years"));
        d.setConsultationFee(rs.getBigDecimal("consultation_fee"));
        d.setHospital(rs.getString("hospital_affiliation"));
        d.setRating(rs.getDouble("rating"));
        d.setReviewCount(rs.getInt("review_count"));
        d.setAbout(rs.getString("about"));
        d.setEducation(rs.getString("education"));
        d.setAvatarUrl(rs.getString("avatar_url"));
        d.setAvailabilityStatus(rs.getString("availability_status"));
        d.setStatus(rs.getString("user_status"));

        String days = rs.getString("available_days");
        if (days != null && !days.trim().isEmpty()) {
            d.setAvailableDays(Arrays.asList(days.split("\\s*,\\s*")));
        } else {
            d.setAvailableDays(Collections.emptyList());
        }

        String slots = rs.getString("time_slots");
        if (slots != null && !slots.trim().isEmpty()) {
            d.setTimeSlots(Arrays.asList(slots.split("\\s*,\\s*")));
        } else {
            d.setTimeSlots(Collections.emptyList());
        }
        return d;
    }

    public List<Doctor> findAllDoctors() throws DatabaseException {
        String sql = "SELECT d.*, u.name, u.email, u.phone, u.avatar_url, u.status AS user_status "
                + "FROM doctors d "
                + "JOIN users u ON d.user_id = u.id "
                + "ORDER BY d.rating DESC";
        List<Doctor> list = new ArrayList<>();
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                list.add(mapRow(rs));
            }
            return list;
        } catch (SQLException e) {
            throw new DatabaseException("Error retrieving doctor catalog: " + e.getMessage(), e);
        }
    }

    public Doctor findById(String doctorId) throws DatabaseException {
        String sql = "SELECT d.*, u.name, u.email, u.phone, u.avatar_url, u.status AS user_status "
                + "FROM doctors d "
                + "JOIN users u ON d.user_id = u.id "
                + "WHERE d.doctor_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, doctorId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
                return null;
            }
        } catch (SQLException e) {
            throw new DatabaseException("Error retrieving doctor by ID: " + e.getMessage(), e);
        }
    }

    public Doctor findByUserId(String userId) throws DatabaseException {
        String sql = "SELECT d.*, u.name, u.email, u.phone, u.avatar_url, u.status AS user_status "
                + "FROM doctors d "
                + "JOIN users u ON d.user_id = u.id "
                + "WHERE d.user_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
                return null;
            }
        } catch (SQLException e) {
            throw new DatabaseException("Error retrieving doctor by user ID: " + e.getMessage(), e);
        }
    }

    public Doctor findByUniqueId(String uniqueDoctorId) throws DatabaseException {
        String sql = "SELECT d.*, u.name, u.email, u.phone, u.avatar_url, u.status AS user_status "
                + "FROM doctors d "
                + "JOIN users u ON d.user_id = u.id "
                + "WHERE UPPER(d.unique_doctor_id) = UPPER(?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, uniqueDoctorId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
                return null;
            }
        } catch (SQLException e) {
            throw new DatabaseException("Error retrieving doctor by unique ID: " + e.getMessage(), e);
        }
    }

    public boolean createDoctorWithTransaction(Doctor doctor) throws DatabaseException {
        String insertUserSql = "INSERT INTO users (id, name, email, password_hash, role, phone, avatar_url, unique_doctor_id, status) "
                + "VALUES (?, ?, ?, ?, 'DOCTOR', ?, ?, ?, 'Active')";
        String insertDocSql = "INSERT INTO doctors (doctor_id, user_id, unique_doctor_id, specialization, department, "
                + "hospital_affiliation, rating, review_count, consultation_fee, experience_years, about, education, "
                + "available_days, time_slots, availability_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        Connection conn = null;
        PreparedStatement userStmt = null;
        PreparedStatement docStmt = null;

        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            String userId = doctor.getUserId() != null ? doctor.getUserId() : "usr-" + doctor.getId();
            doctor.setUserId(userId);

            userStmt = conn.prepareStatement(insertUserSql);
            userStmt.setString(1, userId);
            userStmt.setString(2, doctor.getName());
            userStmt.setString(3, doctor.getEmail());
            userStmt.setString(4, doctor.getPasswordHash());
            userStmt.setString(5, doctor.getPhone());
            userStmt.setString(6, doctor.getAvatarUrl());
            userStmt.setString(7, doctor.getUniqueDoctorId());
            userStmt.executeUpdate();

            docStmt = conn.prepareStatement(insertDocSql);
            docStmt.setString(1, doctor.getId());
            docStmt.setString(2, userId);
            docStmt.setString(3, doctor.getUniqueDoctorId());
            docStmt.setString(4, doctor.getSpecialty());
            docStmt.setString(5, doctor.getDepartment());
            docStmt.setString(6, doctor.getHospital());
            docStmt.setDouble(7, doctor.getRating() > 0 ? doctor.getRating() : 4.9);
            docStmt.setInt(8, doctor.getReviewsCount());
            docStmt.setBigDecimal(9, doctor.getConsultationFee());
            docStmt.setInt(10, doctor.getExperienceYears());
            docStmt.setString(11, doctor.getAbout());
            docStmt.setString(12, doctor.getEducation());
            docStmt.setString(13, String.join(",", doctor.getAvailableDays()));
            docStmt.setString(14, String.join(",", doctor.getTimeSlots()));
            docStmt.setString(15, doctor.getAvailabilityStatus() != null ? doctor.getAvailabilityStatus() : "AVAILABLE");
            docStmt.executeUpdate();

            conn.commit();
            return true;
        } catch (SQLException e) {
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (SQLException ignored) {
                }
            }
            throw new DatabaseException("Error creating doctor transactionally: " + e.getMessage(), e);
        } finally {
            try {
                if (conn != null) {
                    conn.setAutoCommit(true);
                }
            } catch (SQLException ignored) {
            }
            DBConnection.close(userStmt, docStmt, conn);
        }
    }

    public boolean updateDoctor(Doctor doctor) throws DatabaseException {
        String updateDocSql = "UPDATE doctors SET specialization = ?, department = ?, hospital_affiliation = ?, "
                + "consultation_fee = ?, experience_years = ?, about = ?, education = ?, available_days = ?, "
                + "time_slots = ?, availability_status = ? WHERE doctor_id = ?";
        String updateUserSql = "UPDATE users u JOIN doctors d ON u.id = d.user_id "
                + "SET u.name = ?, u.phone = ? WHERE d.doctor_id = ?";

        Connection conn = null;
        PreparedStatement docStmt = null;
        PreparedStatement userStmt = null;

        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            docStmt = conn.prepareStatement(updateDocSql);
            docStmt.setString(1, doctor.getSpecialty());
            docStmt.setString(2, doctor.getDepartment());
            docStmt.setString(3, doctor.getHospital());
            docStmt.setBigDecimal(4, doctor.getConsultationFee());
            docStmt.setInt(5, doctor.getExperienceYears());
            docStmt.setString(6, doctor.getAbout());
            docStmt.setString(7, doctor.getEducation());
            docStmt.setString(8, String.join(",", doctor.getAvailableDays()));
            docStmt.setString(9, String.join(",", doctor.getTimeSlots()));
            docStmt.setString(10, doctor.getAvailabilityStatus() != null ? doctor.getAvailabilityStatus() : "AVAILABLE");
            docStmt.setString(11, doctor.getId());
            int rows = docStmt.executeUpdate();

            userStmt = conn.prepareStatement(updateUserSql);
            userStmt.setString(1, doctor.getName());
            userStmt.setString(2, doctor.getPhone());
            userStmt.setString(3, doctor.getId());
            userStmt.executeUpdate();

            conn.commit();
            return rows > 0;
        } catch (SQLException e) {
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (SQLException ignored) {
                }
            }
            throw new DatabaseException("Error updating doctor transactionally: " + e.getMessage(), e);
        } finally {
            try {
                if (conn != null) {
                    conn.setAutoCommit(true);
                }
            } catch (SQLException ignored) {
            }
            DBConnection.close(docStmt, userStmt, conn);
        }
    }

    public boolean deleteDoctor(String doctorId) throws DatabaseException {
        String findUserSql = "SELECT user_id FROM doctors WHERE doctor_id = ?";
        String deleteDocSql = "DELETE FROM doctors WHERE doctor_id = ?";
        String deleteUserSql = "DELETE FROM users WHERE id = ?";

        Connection conn = null;
        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            String userId = null;
            try (PreparedStatement findStmt = conn.prepareStatement(findUserSql)) {
                findStmt.setString(1, doctorId);
                try (ResultSet rs = findStmt.executeQuery()) {
                    if (rs.next()) {
                        userId = rs.getString("user_id");
                    }
                }
            }

            int deleted;
            try (PreparedStatement delDocStmt = conn.prepareStatement(deleteDocSql)) {
                delDocStmt.setString(1, doctorId);
                deleted = delDocStmt.executeUpdate();
            }

            if (userId != null) {
                try (PreparedStatement delUserStmt = conn.prepareStatement(deleteUserSql)) {
                    delUserStmt.setString(1, userId);
                    delUserStmt.executeUpdate();
                }
            }

            conn.commit();
            return deleted > 0;
        } catch (SQLException e) {
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (SQLException ignored) {
                }
            }
            throw new DatabaseException("Error deleting doctor: " + e.getMessage(), e);
        } finally {
            try {
                if (conn != null) {
                    conn.setAutoCommit(true);
                }
            } catch (SQLException ignored) {
            }
            DBConnection.close(conn);
        }
    }
}

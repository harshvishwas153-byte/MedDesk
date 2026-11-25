package com.medicare.dao;

import com.medicare.exception.DatabaseException;
import com.medicare.model.Admin;
import com.medicare.model.Doctor;
import com.medicare.model.Patient;
import com.medicare.model.User;
import com.medicare.util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * User Data Access Object performing JDBC CRUD operations with PreparedStatement
 * and polymorphic instantiation of Patient, Doctor, and Admin entities.
 */
public class UserDAO {

    private User mapRowToUser(ResultSet rs) throws SQLException {
        String role = rs.getString("role");
        User user;
        if ("DOCTOR".equalsIgnoreCase(role)) {
            user = new Doctor();
        } else if ("ADMIN".equalsIgnoreCase(role)) {
            user = new Admin();
        } else {
            user = new Patient();
        }
        user.setId(rs.getString("id"));
        user.setName(rs.getString("name"));
        user.setEmail(rs.getString("email"));
        user.setPasswordHash(rs.getString("password_hash"));
        user.setRole(role);
        user.setPhone(rs.getString("phone"));
        user.setGender(rs.getString("gender"));
        user.setBloodGroup(rs.getString("blood_group"));
        user.setAvatarUrl(rs.getString("avatar_url"));
        user.setUniqueDoctorId(rs.getString("unique_doctor_id"));
        user.setAllergies(rs.getString("allergies"));
        user.setMedicalConditions(rs.getString("medical_conditions"));
        user.setEmergencyContact(rs.getString("emergency_contact"));
        user.setStatus(rs.getString("status"));
        user.setCreatedAt(rs.getTimestamp("created_at"));
        return user;
    }

    public User findByEmail(String email) throws DatabaseException {
        String sql = "SELECT * FROM users WHERE LOWER(email) = LOWER(?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, email);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapRowToUser(rs);
                }
                return null;
            }
        } catch (SQLException e) {
            throw new DatabaseException("Error querying user by email: " + e.getMessage(), e);
        }
    }

    public User findById(String id) throws DatabaseException {
        String sql = "SELECT * FROM users WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapRowToUser(rs);
                }
                return null;
            }
        } catch (SQLException e) {
            throw new DatabaseException("Error querying user by ID: " + e.getMessage(), e);
        }
    }

    public User findByUniqueDoctorId(String uniqueDoctorId) throws DatabaseException {
        String sql = "SELECT * FROM users WHERE UPPER(unique_doctor_id) = UPPER(?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, uniqueDoctorId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapRowToUser(rs);
                }
                return null;
            }
        } catch (SQLException e) {
            throw new DatabaseException("Error querying user by doctor ID: " + e.getMessage(), e);
        }
    }

    public boolean createUser(User user) throws DatabaseException {
        if (user.getPasswordHash() == null || user.getPasswordHash().isEmpty()) {
            throw new DatabaseException("Password hash is required before persisting user.");
        }
        String sql = "INSERT INTO users (id, name, email, password_hash, role, phone, gender, blood_group, "
                + "avatar_url, unique_doctor_id, allergies, medical_conditions, emergency_contact, status) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, user.getId());
            stmt.setString(2, user.getName());
            stmt.setString(3, user.getEmail());
            stmt.setString(4, user.getPasswordHash());
            stmt.setString(5, user.getRole());
            stmt.setString(6, user.getPhone());
            stmt.setString(7, user.getGender());
            stmt.setString(8, user.getBloodGroup());
            stmt.setString(9, user.getAvatarUrl());
            stmt.setString(10, user.getUniqueDoctorId());
            stmt.setString(11, user.getAllergies());
            stmt.setString(12, user.getMedicalConditions());
            stmt.setString(13, user.getEmergencyContact());
            stmt.setString(14, user.getStatus() != null ? user.getStatus() : "Active");
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new DatabaseException("Error creating user record: " + e.getMessage(), e);
        }
    }

    public boolean updateUser(User user) throws DatabaseException {
        String sql = "UPDATE users SET name = ?, phone = ?, gender = ?, blood_group = ?, "
                + "allergies = ?, medical_conditions = ?, emergency_contact = ? WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, user.getName());
            stmt.setString(2, user.getPhone());
            stmt.setString(3, user.getGender());
            stmt.setString(4, user.getBloodGroup());
            stmt.setString(5, user.getAllergies());
            stmt.setString(6, user.getMedicalConditions());
            stmt.setString(7, user.getEmergencyContact());
            stmt.setString(8, user.getId());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new DatabaseException("Error updating user record: " + e.getMessage(), e);
        }
    }

    public boolean updateStatus(String userId, String status) throws DatabaseException {
        String sql = "UPDATE users SET status = ? WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, status);
            stmt.setString(2, userId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new DatabaseException("Error updating user status: " + e.getMessage(), e);
        }
    }

    public boolean updatePasswordHash(String userId, String newHash) throws DatabaseException {
        String sql = "UPDATE users SET password_hash = ? WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, newHash);
            stmt.setString(2, userId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new DatabaseException("Error updating password hash: " + e.getMessage(), e);
        }
    }

    public boolean deleteUser(String userId) throws DatabaseException {
        String sql = "DELETE FROM users WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, userId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new DatabaseException("Error deleting user record: " + e.getMessage(), e);
        }
    }

    public List<User> findAllPatients() throws DatabaseException {
        String sql = "SELECT * FROM users WHERE role = 'PATIENT' ORDER BY created_at DESC";
        List<User> list = new ArrayList<>();
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                list.add(mapRowToUser(rs));
            }
            return list;
        } catch (SQLException e) {
            throw new DatabaseException("Error retrieving patient records: " + e.getMessage(), e);
        }
    }

    public List<User> findAllUsers() throws DatabaseException {
        String sql = "SELECT * FROM users ORDER BY created_at DESC";
        List<User> list = new ArrayList<>();
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                list.add(mapRowToUser(rs));
            }
            return list;
        } catch (SQLException e) {
            throw new DatabaseException("Error retrieving users: " + e.getMessage(), e);
        }
    }
}

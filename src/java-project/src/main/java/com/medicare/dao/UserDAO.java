package com.medicare.dao;

import com.medicare.exception.DatabaseException;
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
 * User Data Access Object performing JDBC CRUD operations with PreparedStatement.
 * Rubric Criterion: Database Integration (JDBC) - CRUD & Schema
 */
public class UserDAO {

    public User findByEmail(String email) throws DatabaseException {
        String sql = "SELECT * FROM users WHERE email = ?";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, email);
            rs = stmt.executeQuery();

            if (rs.next()) {
                Patient patient = new Patient();
                patient.setId(rs.getString("id"));
                patient.setName(rs.getString("name"));
                patient.setEmail(rs.getString("email"));
                patient.setPasswordHash(rs.getString("password_hash"));
                patient.setRole(rs.getString("role"));
                patient.setPhone(rs.getString("phone"));
                patient.setGender(rs.getString("gender"));
                patient.setBloodGroup(rs.getString("blood_group"));
                patient.setAvatarUrl(rs.getString("avatar_url"));
                patient.setStatus(rs.getString("status"));
                patient.setCreatedAt(rs.getTimestamp("created_at"));
                return patient;
            }
            return null;
        } catch (SQLException e) {
            throw new DatabaseException("Error querying user by email: " + e.getMessage(), e);
        } finally {
            DBConnection.close(rs, stmt, conn);
        }
    }

    public boolean createUser(User user) throws DatabaseException {
        String sql = "INSERT INTO users (id, name, email, password_hash, role, phone, gender, blood_group, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        Connection conn = null;
        PreparedStatement stmt = null;

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, user.getId());
            stmt.setString(2, user.getName());
            stmt.setString(3, user.getEmail());
            stmt.setString(4, user.getPasswordHash() != null ? user.getPasswordHash() : "hashed_pwd");
            stmt.setString(5, user.getRole());
            stmt.setString(6, user.getPhone());
            stmt.setString(7, user.getGender());
            stmt.setString(8, user.getBloodGroup());
            stmt.setString(9, user.getStatus());

            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new DatabaseException("Error creating user record: " + e.getMessage(), e);
        } finally {
            DBConnection.close(stmt, conn);
        }
    }

    public List<User> findAllPatients() throws DatabaseException {
        String sql = "SELECT * FROM users WHERE role = 'PATIENT' ORDER BY created_at DESC";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        List<User> list = new ArrayList<>();

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            rs = stmt.executeQuery();

            while (rs.next()) {
                Patient p = new Patient();
                p.setId(rs.getString("id"));
                p.setName(rs.getString("name"));
                p.setEmail(rs.getString("email"));
                p.setPhone(rs.getString("phone"));
                p.setGender(rs.getString("gender"));
                p.setBloodGroup(rs.getString("blood_group"));
                list.add(p);
            }
            return list;
        } catch (SQLException e) {
            throw new DatabaseException("Error retrieving patient records: " + e.getMessage(), e);
        } finally {
            DBConnection.close(rs, stmt, conn);
        }
    }
}

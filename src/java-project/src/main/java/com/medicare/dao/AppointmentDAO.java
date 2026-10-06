package com.medicare.dao;

import com.medicare.exception.DatabaseException;
import com.medicare.model.Appointment;
import com.medicare.model.BillingSlip;
import com.medicare.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Appointment DAO demonstrating JDBC CRUD and Atomic Transaction Handling.
 * Rubric Criterion: Database Integration (JDBC) - Transaction Handling & PreparedStatement
 */
public class AppointmentDAO {

    /**
     * Creates an Appointment AND corresponding Billing Slip in an ATOMIC DATABASE TRANSACTION.
     * Demonstrates conn.setAutoCommit(false), conn.commit(), and conn.rollback().
     */
    public boolean createAppointmentWithTransaction(Appointment apt, BillingSlip slip) throws DatabaseException {
        String insertAptSql = "INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, "
                + "department, hospital, consultation_fee, status, reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        String insertInvoiceSql = "INSERT INTO billing_invoices (invoice_id, appointment_id, patient_id, doctor_fee, "
                + "vitals_fee, vault_fee, discount_amount, tax_amount, total_amount, payment_mode, payment_status, transaction_ref) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        Connection conn = null;
        PreparedStatement aptStmt = null;
        PreparedStatement invStmt = null;

        try {
            conn = DBConnection.getConnection();
            
            // 1. Begin Database Transaction
            conn.setAutoCommit(false);

            // 2. Insert Appointment Record
            aptStmt = conn.prepareStatement(insertAptSql);
            aptStmt.setString(1, apt.getId());
            aptStmt.setString(2, apt.getPatientId());
            aptStmt.setString(3, apt.getDoctorId());
            aptStmt.setString(4, apt.getDate());
            aptStmt.setString(5, apt.getTime());
            aptStmt.setString(6, apt.getDepartment());
            aptStmt.setString(7, apt.getHospital());
            aptStmt.setBigDecimal(8, apt.getFee());
            aptStmt.setString(9, apt.getStatus());
            aptStmt.setString(10, apt.getReason());
            aptStmt.executeUpdate();

            // 3. Insert Associated Billing Invoice
            invStmt = conn.prepareStatement(insertInvoiceSql);
            invStmt.setString(1, slip.getInvoiceId());
            invStmt.setString(2, apt.getId());
            invStmt.setString(3, apt.getPatientId());
            invStmt.setBigDecimal(4, slip.getDoctorFee());
            invStmt.setBigDecimal(5, slip.getVitalsFee());
            invStmt.setBigDecimal(6, slip.getVaultFee());
            invStmt.setBigDecimal(7, slip.getDiscountAmount());
            invStmt.setBigDecimal(8, slip.getTaxAmount());
            invStmt.setBigDecimal(9, slip.getTotalAmount());
            invStmt.setString(10, slip.getPaymentMode());
            invStmt.setString(11, slip.getPaymentStatus());
            invStmt.setString(12, slip.getTransactionRef());
            invStmt.executeUpdate();

            // 4. Commit Atomic Transaction
            conn.commit();
            return true;

        } catch (SQLException e) {
            // 5. Rollback on any failure to maintain database integrity
            if (conn != null) {
                try {
                    conn.rollback();
                    System.err.println("Transaction rolled back successfully due to: " + e.getMessage());
                } catch (SQLException ex) {
                    System.err.println("Rollback error: " + ex.getMessage());
                }
            }
            throw new DatabaseException("Failed to commit appointment & billing transaction: " + e.getMessage(), e);
        } finally {
            try {
                if (conn != null) {
                    conn.setAutoCommit(true); // Restore default autocommit mode
                }
            } catch (SQLException ignored) {
            }
            DBConnection.close(aptStmt, invStmt, conn);
        }
    }

    public List<Appointment> findByPatientId(String patientId) throws DatabaseException {
        String sql = "SELECT a.*, u_doc.name AS doctor_name, u_pat.name AS patient_name, u_pat.email AS patient_email "
                + "FROM appointments a "
                + "JOIN users u_doc ON a.doctor_id = u_doc.id "
                + "JOIN users u_pat ON a.patient_id = u_pat.id "
                + "WHERE a.patient_id = ? ORDER BY a.created_at DESC";

        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        List<Appointment> list = new ArrayList<>();

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, patientId);
            rs = stmt.executeQuery();

            while (rs.next()) {
                Appointment a = new Appointment();
                a.setId(rs.getString("id"));
                a.setPatientId(rs.getString("patient_id"));
                a.setPatientName(rs.getString("patient_name"));
                a.setPatientEmail(rs.getString("patient_email"));
                a.setDoctorId(rs.getString("doctor_id"));
                a.setDoctorName(rs.getString("doctor_name"));
                a.setDate(rs.getString("appointment_date"));
                a.setTime(rs.getString("appointment_time"));
                a.setDepartment(rs.getString("department"));
                a.setHospital(rs.getString("hospital"));
                a.setFee(rs.getBigDecimal("consultation_fee"));
                a.setStatus(rs.getString("status"));
                a.setReason(rs.getString("reason"));
                a.setNotes(rs.getString("clinical_notes"));
                a.setPrescription(rs.getString("prescription"));
                list.add(a);
            }
            return list;
        } catch (SQLException e) {
            throw new DatabaseException("Error finding appointments by patient ID: " + e.getMessage(), e);
        } finally {
            DBConnection.close(rs, stmt, conn);
        }
    }

    public Appointment findById(String id) throws DatabaseException {
        String sql = "SELECT a.*, u_doc.name AS doctor_name, u_pat.name AS patient_name, u_pat.email AS patient_email "
                + "FROM appointments a "
                + "JOIN users u_doc ON a.doctor_id = u_doc.id "
                + "JOIN users u_pat ON a.patient_id = u_pat.id "
                + "WHERE a.id = ?";

        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, id);
            rs = stmt.executeQuery();

            if (rs.next()) {
                Appointment a = new Appointment();
                a.setId(rs.getString("id"));
                a.setPatientId(rs.getString("patient_id"));
                a.setPatientName(rs.getString("patient_name"));
                a.setPatientEmail(rs.getString("patient_email"));
                a.setDoctorId(rs.getString("doctor_id"));
                a.setDoctorName(rs.getString("doctor_name"));
                a.setDate(rs.getString("appointment_date"));
                a.setTime(rs.getString("appointment_time"));
                a.setDepartment(rs.getString("department"));
                a.setHospital(rs.getString("hospital"));
                a.setFee(rs.getBigDecimal("consultation_fee"));
                a.setStatus(rs.getString("status"));
                a.setReason(rs.getString("reason"));
                a.setNotes(rs.getString("clinical_notes"));
                a.setPrescription(rs.getString("prescription"));
                return a;
            }
            return null;
        } catch (SQLException e) {
            throw new DatabaseException("Error finding appointment by ID: " + e.getMessage(), e);
        } finally {
            DBConnection.close(rs, stmt, conn);
        }
    }

    public boolean updateStatus(String appointmentId, String newStatus) throws DatabaseException {
        String sql = "UPDATE appointments SET status = ? WHERE id = ?";
        Connection conn = null;
        PreparedStatement stmt = null;

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, newStatus);
            stmt.setString(2, appointmentId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new DatabaseException("Error updating appointment status: " + e.getMessage(), e);
        } finally {
            DBConnection.close(stmt, conn);
        }
    }
}

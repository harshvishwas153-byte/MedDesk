package com.medicare.dao;

import com.medicare.exception.ConflictException;
import com.medicare.exception.DatabaseException;
import com.medicare.model.Appointment;
import com.medicare.model.BillingSlip;
import com.medicare.util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * Appointment DAO demonstrating JDBC CRUD, double-booking prevention,
 * and atomic database transactions (Appointment + Billing Invoice).
 */
public class AppointmentDAO {

    private static final String BASE_SELECT =
            "SELECT a.*, u_doc.name AS doctor_name, u_pat.name AS patient_name, u_pat.email AS patient_email "
                    + "FROM appointments a "
                    + "JOIN doctors d ON a.doctor_id = d.doctor_id "
                    + "JOIN users u_doc ON d.user_id = u_doc.id "
                    + "JOIN users u_pat ON a.patient_id = u_pat.id ";

    private Appointment mapRow(ResultSet rs) throws SQLException {
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
        a.setCreatedAt(rs.getTimestamp("created_at"));
        return a;
    }

    /**
     * Atomically verifies slot availability with a row lock (FOR UPDATE) and
     * creates both the Appointment and Billing Invoice in a single transaction.
     */
    public boolean createAppointmentWithTransaction(Appointment apt, BillingSlip slip)
            throws DatabaseException, ConflictException {
        String conflictSql = "SELECT id FROM appointments WHERE doctor_id = ? AND appointment_date = ? "
                + "AND appointment_time = ? AND status IN ('Upcoming', 'Pending') FOR UPDATE";

        String insertAptSql = "INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, "
                + "department, hospital, consultation_fee, status, reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        String insertInvoiceSql = "INSERT INTO billing_invoices (invoice_id, appointment_id, patient_id, doctor_fee, "
                + "vitals_fee, vault_fee, discount_amount, tax_amount, total_amount, payment_mode, payment_status, transaction_ref) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        Connection conn = null;
        PreparedStatement conflictStmt = null;
        PreparedStatement aptStmt = null;
        PreparedStatement invStmt = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            // Prevent double-booking on the same doctor, date, and time slot
            conflictStmt = conn.prepareStatement(conflictSql);
            conflictStmt.setString(1, apt.getDoctorId());
            conflictStmt.setString(2, apt.getDate());
            conflictStmt.setString(3, apt.getTime());
            rs = conflictStmt.executeQuery();
            if (rs.next()) {
                conn.rollback();
                throw new ConflictException("Selected slot (" + apt.getDate() + " at " + apt.getTime()
                        + ") is already booked for this doctor.");
            }

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

            conn.commit();
            return true;
        } catch (ConflictException ce) {
            throw ce;
        } catch (SQLException e) {
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (SQLException ignored) {
                }
            }
            throw new DatabaseException("Failed to commit appointment & billing transaction: " + e.getMessage(), e);
        } finally {
            try {
                if (conn != null) {
                    conn.setAutoCommit(true);
                }
            } catch (SQLException ignored) {
            }
            DBConnection.close(rs, conflictStmt, aptStmt, invStmt, conn);
        }
    }

    public List<Appointment> findByPatientId(String patientId) throws DatabaseException {
        String sql = BASE_SELECT + "WHERE a.patient_id = ? ORDER BY a.created_at DESC";
        List<Appointment> list = new ArrayList<>();
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
            throw new DatabaseException("Error finding appointments by patient ID: " + e.getMessage(), e);
        }
    }

    public List<Appointment> findByDoctorId(String doctorId) throws DatabaseException {
        String sql = BASE_SELECT + "WHERE a.doctor_id = ? ORDER BY a.created_at DESC";
        List<Appointment> list = new ArrayList<>();
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, doctorId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRow(rs));
                }
            }
            return list;
        } catch (SQLException e) {
            throw new DatabaseException("Error finding appointments by doctor ID: " + e.getMessage(), e);
        }
    }

    public List<Appointment> findAll() throws DatabaseException {
        String sql = BASE_SELECT + "ORDER BY a.created_at DESC";
        List<Appointment> list = new ArrayList<>();
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                list.add(mapRow(rs));
            }
            return list;
        } catch (SQLException e) {
            throw new DatabaseException("Error retrieving all appointments: " + e.getMessage(), e);
        }
    }

    public Appointment findById(String id) throws DatabaseException {
        String sql = BASE_SELECT + "WHERE a.id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
                return null;
            }
        } catch (SQLException e) {
            throw new DatabaseException("Error finding appointment by ID: " + e.getMessage(), e);
        }
    }

    public BillingSlip findBillingSlipByAppointmentId(String appointmentId) throws DatabaseException {
        String sql = "SELECT * FROM billing_invoices WHERE appointment_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, appointmentId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    BillingSlip slip = new BillingSlip();
                    slip.setInvoiceId(rs.getString("invoice_id"));
                    slip.setAppointmentId(rs.getString("appointment_id"));
                    slip.setPatientId(rs.getString("patient_id"));
                    slip.setDoctorFee(rs.getBigDecimal("doctor_fee"));
                    slip.setVitalsFee(rs.getBigDecimal("vitals_fee"));
                    slip.setVaultFee(rs.getBigDecimal("vault_fee"));
                    slip.setDiscountAmount(rs.getBigDecimal("discount_amount"));
                    slip.setTaxAmount(rs.getBigDecimal("tax_amount"));
                    slip.setTotalAmount(rs.getBigDecimal("total_amount"));
                    slip.setPaymentMode(rs.getString("payment_mode"));
                    slip.setPaymentStatus(rs.getString("payment_status"));
                    slip.setTransactionRef(rs.getString("transaction_ref"));
                    slip.setPaymentTimestamp(rs.getTimestamp("payment_timestamp"));
                    return slip;
                }
                return null;
            }
        } catch (SQLException e) {
            throw new DatabaseException("Error retrieving billing invoice: " + e.getMessage(), e);
        }
    }

    public boolean updateStatus(String appointmentId, String newStatus) throws DatabaseException {
        String sql = "UPDATE appointments SET status = ? WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, newStatus);
            stmt.setString(2, appointmentId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new DatabaseException("Error updating appointment status: " + e.getMessage(), e);
        }
    }

    public boolean updateAppointment(String appointmentId, String status, String notes, String prescription)
            throws DatabaseException {
        String sql = "UPDATE appointments SET status = COALESCE(?, status), "
                + "clinical_notes = COALESCE(?, clinical_notes), "
                + "prescription = COALESCE(?, prescription) WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, status);
            stmt.setString(2, notes);
            stmt.setString(3, prescription);
            stmt.setString(4, appointmentId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new DatabaseException("Error updating appointment clinical details: " + e.getMessage(), e);
        }
    }
}

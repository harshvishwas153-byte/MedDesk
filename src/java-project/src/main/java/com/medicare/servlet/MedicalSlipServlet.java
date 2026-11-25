package com.medicare.servlet;

import com.medicare.dao.AppointmentDAO;
<<<<<<< HEAD
import com.medicare.dao.DoctorDAO;
import com.medicare.exception.AppointmentNotFoundException;
import com.medicare.exception.ForbiddenException;
import com.medicare.exception.ValidationException;
import com.medicare.model.Appointment;
import com.medicare.model.BillingSlip;
import com.medicare.model.Doctor;
import com.medicare.model.User;
import com.medicare.util.PdfSlipGenerator;
import com.medicare.util.ValidationUtil;
=======
import com.medicare.model.Appointment;
import com.medicare.model.BillingSlip;
import com.medicare.util.PdfSlipGenerator;
>>>>>>> origin/main

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
<<<<<<< HEAD
import javax.servlet.http.HttpSession;
=======
>>>>>>> origin/main
import java.io.IOException;
import java.io.OutputStream;

/**
<<<<<<< HEAD
 * Servlet for streaming server-side generated PDF Consultation & Billing Slips
 * with strict session and appointment ownership verification.
=======
 * Servlet for streaming server-side generated PDF Consultation & Billing Slip.
 * Direct implementation of user's reference template in Java.
>>>>>>> origin/main
 */
public class MedicalSlipServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    private AppointmentDAO appointmentDAO;
<<<<<<< HEAD
    private DoctorDAO doctorDAO;
=======
>>>>>>> origin/main

    @Override
    public void init() throws ServletException {
        this.appointmentDAO = new AppointmentDAO();
<<<<<<< HEAD
        this.doctorDAO = new DoctorDAO();
=======
>>>>>>> origin/main
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
<<<<<<< HEAD
        try {
            HttpSession session = request.getSession(false);
            if (session == null || !(session.getAttribute("currentUser") instanceof User)) {
                throw new ForbiddenException("Authenticated session required to download billing slips.");
            }
            User currentUser = (User) session.getAttribute("currentUser");

            String appointmentId = ValidationUtil.requireValidId(request.getParameter("appointmentId"), "appointmentId");
            Appointment apt = appointmentDAO.findById(appointmentId);
            if (apt == null) {
                throw new AppointmentNotFoundException("Appointment slip not found for ID: " + appointmentId);
            }

            boolean isAdmin = "ADMIN".equalsIgnoreCase(currentUser.getRole());
            boolean isDoctor = "DOCTOR".equalsIgnoreCase(currentUser.getRole());
            if (!isAdmin) {
                Doctor doc = isDoctor ? doctorDAO.findByUserId(currentUser.getId()) : null;
                boolean ownsAsPatient = apt.getPatientId().equals(currentUser.getId());
                boolean ownsAsDoctor = doc != null && apt.getDoctorId().equals(doc.getId());
                if (!ownsAsPatient && !ownsAsDoctor) {
                    throw new ForbiddenException("You do not have permission to access this consultation slip.");
                }
            }

            BillingSlip slip = appointmentDAO.findBillingSlipByAppointmentId(appointmentId);
            if (slip == null) {
                slip = BillingSlip.fromAppointment(apt);
            } else {
                slip.setPatientName(apt.getPatientName());
                slip.setDoctorName(apt.getDoctorName());
                slip.setDepartment(apt.getDepartment());
                slip.setHospital(apt.getHospital());
            }

=======
        String appointmentId = request.getParameter("appointmentId");

        if (appointmentId == null || appointmentId.isEmpty()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Missing appointmentId parameter");
            return;
        }

        try {
            Appointment apt = appointmentDAO.findById(appointmentId);
            if (apt == null) {
                // If not found in live DB, construct demonstration slip
                apt = new Appointment(appointmentId, "PAT-001", "DOC-001", "25 Sep 2026", "10:30 AM", java.math.BigDecimal.valueOf(500.00));
                apt.setPatientName("Harsh Vishwas");
                apt.setDoctorName("Dr. Priya Sharma");
                apt.setDepartment("Cardiology");
                apt.setHospital("City Care Multispecialty Hospital");
            }

            BillingSlip slip = BillingSlip.fromAppointment(apt);
>>>>>>> origin/main
            byte[] pdfBytes = PdfSlipGenerator.generateSlipPdf(slip);

            response.setContentType("application/pdf");
            response.setContentLength(pdfBytes.length);
<<<<<<< HEAD
            response.setHeader("Content-Disposition", "attachment; filename=\"MedDesk_Slip_" + appointmentId + ".pdf\"");
=======
            response.setHeader("Content-Disposition", "attachment; filename=\"MediCare_Slip_" + appointmentId + ".pdf\"");
>>>>>>> origin/main

            OutputStream os = response.getOutputStream();
            os.write(pdfBytes);
            os.flush();
<<<<<<< HEAD
        } catch (ForbiddenException | ValidationException | AppointmentNotFoundException ex) {
            response.setStatus(ex.getErrorCode());
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{\"error\":\"" + ex.getMessage() + "\"}");
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{\"error\":\"PDF generation failed: " + e.getMessage() + "\"}");
=======
        } catch (Exception e) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "PDF generation failed: " + e.getMessage());
>>>>>>> origin/main
        }
    }
}

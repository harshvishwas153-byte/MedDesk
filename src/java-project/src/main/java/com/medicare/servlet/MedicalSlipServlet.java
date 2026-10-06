package com.medicare.servlet;

import com.medicare.dao.AppointmentDAO;
import com.medicare.model.Appointment;
import com.medicare.model.BillingSlip;
import com.medicare.util.PdfSlipGenerator;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;

/**
 * Servlet for streaming server-side generated PDF Consultation & Billing Slip.
 * Direct implementation of user's reference template in Java.
 */
public class MedicalSlipServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    private AppointmentDAO appointmentDAO;

    @Override
    public void init() throws ServletException {
        this.appointmentDAO = new AppointmentDAO();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
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
            byte[] pdfBytes = PdfSlipGenerator.generateSlipPdf(slip);

            response.setContentType("application/pdf");
            response.setContentLength(pdfBytes.length);
            response.setHeader("Content-Disposition", "attachment; filename=\"MediCare_Slip_" + appointmentId + ".pdf\"");

            OutputStream os = response.getOutputStream();
            os.write(pdfBytes);
            os.flush();
        } catch (Exception e) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "PDF generation failed: " + e.getMessage());
        }
    }
}

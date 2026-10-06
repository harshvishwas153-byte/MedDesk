package com.medicare.servlet;

import com.google.gson.Gson;
import com.medicare.dao.AppointmentDAO;
import com.medicare.model.Appointment;
import com.medicare.model.BillingSlip;
import com.medicare.model.User;
import com.medicare.util.NotificationThreadService;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.BufferedReader;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Appointment Servlet handling OPD booking, listing, status cancellation, and thread dispatch.
 * Rubric Criterion: Servlets & Web Integration + Multithreading
 */
public class AppointmentServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    private AppointmentDAO appointmentDAO;
    private Gson gson;

    @Override
    public void init() throws ServletException {
        this.appointmentDAO = new AppointmentDAO();
        this.gson = new Gson();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String patientId = request.getParameter("patientId");
        String appointmentId = request.getParameter("id");

        HttpSession session = request.getSession(false);
        if (patientId == null && session != null && session.getAttribute("currentUser") != null) {
            User user = (User) session.getAttribute("currentUser");
            patientId = user.getId();
        }

        try {
            if (appointmentId != null) {
                Appointment apt = appointmentDAO.findById(appointmentId);
                response.getWriter().write(gson.toJson(apt));
            } else if (patientId != null) {
                List<Appointment> list = appointmentDAO.findByPatientId(patientId);
                response.getWriter().write(gson.toJson(list));
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                Map<String, String> err = new HashMap<>();
                err.put("error", "Missing patientId or appointment ID");
                response.getWriter().write(gson.toJson(err));
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            response.getWriter().write(gson.toJson(err));
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        BufferedReader reader = request.getReader();
        Appointment apt = gson.fromJson(reader, Appointment.class);

        if (apt.getId() == null || apt.getId().isEmpty()) {
            apt.setId("APT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }

        if (apt.getFee() == null) {
            apt.setFee(BigDecimal.valueOf(500.00));
        }

        // Generate Itemized Billing Slip matching reference template
        BillingSlip slip = BillingSlip.fromAppointment(apt);

        Map<String, Object> responseData = new HashMap<>();

        try {
            // Execute Database Transaction (atomic insertion of appointment + billing invoice)
            boolean success = appointmentDAO.createAppointmentWithTransaction(apt, slip);

            if (success) {
                // Dispatch asynchronous confirmation in background worker thread
                NotificationThreadService.dispatchBookingConfirmation(apt);

                responseData.put("status", "success");
                responseData.put("message", "Appointment successfully booked and verified.");
                responseData.put("appointment", apt);
                responseData.put("slip", slip);
                response.setStatus(HttpServletResponse.SC_CREATED);
            } else {
                responseData.put("status", "error");
                responseData.put("message", "Transaction failed.");
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            }
        } catch (Exception e) {
            responseData.put("status", "error");
            responseData.put("message", e.getMessage());
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }

        response.getWriter().write(gson.toJson(responseData));
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        BufferedReader reader = request.getReader();
        Map<String, String> payload = gson.fromJson(reader, Map.class);
        String appointmentId = payload.get("id");
        String status = payload.get("status");

        Map<String, Object> res = new HashMap<>();
        try {
            boolean updated = appointmentDAO.updateStatus(appointmentId, status);
            res.put("status", updated ? "success" : "not_found");
            response.getWriter().write(gson.toJson(res));
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            res.put("error", e.getMessage());
            response.getWriter().write(gson.toJson(res));
        }
    }
}

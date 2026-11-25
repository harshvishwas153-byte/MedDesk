package com.medicare.servlet;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.medicare.dao.AppointmentDAO;
import com.medicare.dao.DoctorDAO;
import com.medicare.exception.AppointmentNotFoundException;
import com.medicare.exception.ConflictException;
import com.medicare.exception.ForbiddenException;
import com.medicare.exception.ValidationException;
import com.medicare.model.Appointment;
import com.medicare.model.BillingSlip;
import com.medicare.model.Doctor;
import com.medicare.model.User;
import com.medicare.util.NotificationThreadService;
import com.medicare.util.ValidationUtil;

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
 * Appointment Servlet handling OPD booking, listing, clinical notes, cancellation,
 * conflict prevention, and asynchronous notification dispatch.
 */
public class AppointmentServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    private AppointmentDAO appointmentDAO;
    private DoctorDAO doctorDAO;
    private Gson gson;

    @Override
    public void init() throws ServletException {
        this.appointmentDAO = new AppointmentDAO();
        this.doctorDAO = new DoctorDAO();
        this.gson = new Gson();
    }

    private User requireCurrentUser(HttpServletRequest request) throws ForbiddenException {
        HttpSession session = request.getSession(false);
        if (session == null || !(session.getAttribute("currentUser") instanceof User)) {
            throw new ForbiddenException("Valid authenticated session required.");
        }
        return (User) session.getAttribute("currentUser");
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            User currentUser = requireCurrentUser(request);
            boolean isAdmin = "ADMIN".equalsIgnoreCase(currentUser.getRole());
            boolean isDoctor = "DOCTOR".equalsIgnoreCase(currentUser.getRole());

            String appointmentId = request.getParameter("id");
            if (appointmentId != null && !appointmentId.isEmpty()) {
                String validId = ValidationUtil.requireValidId(appointmentId, "appointmentId");
                Appointment apt = appointmentDAO.findById(validId);
                if (apt == null) {
                    throw new AppointmentNotFoundException("Appointment not found: " + validId);
                }

                if (!isAdmin) {
                    Doctor doc = isDoctor ? doctorDAO.findByUserId(currentUser.getId()) : null;
                    boolean ownsAsPatient = apt.getPatientId().equals(currentUser.getId());
                    boolean ownsAsDoctor = doc != null && apt.getDoctorId().equals(doc.getId());
                    if (!ownsAsPatient && !ownsAsDoctor) {
                        throw new ForbiddenException("You do not have permission to view this appointment.");
                    }
                }
                response.getWriter().write(gson.toJson(apt));
                return;
            }

            if (isAdmin) {
                List<Appointment> all = appointmentDAO.findAll();
                response.getWriter().write(gson.toJson(all));
            } else if (isDoctor) {
                Doctor doc = doctorDAO.findByUserId(currentUser.getId());
                if (doc == null) {
                    throw new ForbiddenException("Doctor profile mapping not found for account.");
                }
                List<Appointment> docApts = appointmentDAO.findByDoctorId(doc.getId());
                response.getWriter().write(gson.toJson(docApts));
            } else {
                List<Appointment> patientApts = appointmentDAO.findByPatientId(currentUser.getId());
                response.getWriter().write(gson.toJson(patientApts));
            }
        } catch (ForbiddenException | ValidationException | AppointmentNotFoundException ex) {
            response.setStatus(ex.getErrorCode());
            response.getWriter().write("{\"error\":\"" + ex.getMessage() + "\"}");
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        Map<String, Object> responseData = new HashMap<>();

        try (BufferedReader reader = request.getReader()) {
            User currentUser = requireCurrentUser(request);
            JsonObject json = JsonParser.parseReader(reader).getAsJsonObject();
            Appointment apt = gson.fromJson(json, Appointment.class);

            if (apt == null) {
                throw new ValidationException("Request body must be valid JSON.");
            }

            // Force patient ownership unless ADMIN creates on behalf of a patient
            if (!"ADMIN".equalsIgnoreCase(currentUser.getRole()) || apt.getPatientId() == null || apt.getPatientId().isEmpty()) {
                apt.setPatientId(currentUser.getId());
                apt.setPatientName(currentUser.getName());
                apt.setPatientEmail(currentUser.getEmail());
            } else {
                apt.setPatientId(ValidationUtil.requireValidId(apt.getPatientId(), "patientId"));
            }

            apt.setDoctorId(ValidationUtil.requireValidId(apt.getDoctorId(), "doctorId"));
            Doctor doctor = doctorDAO.findById(apt.getDoctorId());
            if (doctor == null) {
                throw new ValidationException("Selected doctor does not exist.");
            }

            apt.setDate(ValidationUtil.requireNonBlank(apt.getDate(), "Appointment date", 30));
            apt.setTime(ValidationUtil.requireNonBlank(apt.getTime(), "Appointment time", 20));
            apt.setReason(ValidationUtil.requireNonBlank(
                    apt.getReason() != null ? apt.getReason() : "General Consultation", "Consultation reason", 255));
            apt.setDepartment(doctor.getDepartment());
            apt.setHospital(doctor.getHospital());
            apt.setDoctorName(doctor.getName());

            BigDecimal fee = apt.getFee() != null ? apt.getFee() : doctor.getConsultationFee();
            apt.setFee(ValidationUtil.validatePositiveAmount(fee, "Consultation fee"));
            apt.setStatus("Upcoming");

            if (apt.getId() == null || apt.getId().isEmpty()) {
                apt.setId("APT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            } else {
                apt.setId(ValidationUtil.requireValidId(apt.getId(), "appointmentId"));
            }

            BillingSlip slip = BillingSlip.fromAppointment(apt);
            if (json.has("paymentMethod") && "clinic".equalsIgnoreCase(json.get("paymentMethod").getAsString())) {
                slip.setPaymentMode("Pay at Clinic Counter");
                slip.setPaymentStatus("PENDING");
            }

            appointmentDAO.createAppointmentWithTransaction(apt, slip);
            NotificationThreadService.dispatchBookingConfirmation(apt);

            response.setStatus(HttpServletResponse.SC_CREATED);
            responseData.put("status", "success");
            responseData.put("message", "Appointment successfully booked and verified.");
            responseData.put("appointment", apt);
            responseData.put("slip", slip);
        } catch (ConflictException | ValidationException | ForbiddenException ex) {
            response.setStatus(ex.getErrorCode());
            responseData.put("status", "error");
            responseData.put("message", ex.getMessage());
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            responseData.put("status", "error");
            responseData.put("message", e.getMessage());
        }

        response.getWriter().write(gson.toJson(responseData));
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        Map<String, Object> res = new HashMap<>();

        try (BufferedReader reader = request.getReader()) {
            User currentUser = requireCurrentUser(request);
            boolean isAdmin = "ADMIN".equalsIgnoreCase(currentUser.getRole());
            boolean isDoctor = "DOCTOR".equalsIgnoreCase(currentUser.getRole());

            @SuppressWarnings("unchecked")
            Map<String, String> payload = gson.fromJson(reader, Map.class);
            if (payload == null) {
                throw new ValidationException("Request body must be valid JSON.");
            }

            String appointmentId = ValidationUtil.requireValidId(payload.get("id"), "appointmentId");
            Appointment existing = appointmentDAO.findById(appointmentId);
            if (existing == null) {
                throw new AppointmentNotFoundException("Appointment not found: " + appointmentId);
            }

            Doctor doc = isDoctor ? doctorDAO.findByUserId(currentUser.getId()) : null;
            boolean ownsAsPatient = existing.getPatientId().equals(currentUser.getId());
            boolean ownsAsDoctor = doc != null && existing.getDoctorId().equals(doc.getId());

            if (!isAdmin && !ownsAsPatient && !ownsAsDoctor) {
                throw new ForbiddenException("Access denied to update this appointment.");
            }

            String nextStatus = payload.get("status");
            if (nextStatus != null && !nextStatus.trim().isEmpty()) {
                nextStatus = ValidationUtil.validateAppointmentStatus(nextStatus);
                ValidationUtil.validateStatusTransition(existing.getStatus(), nextStatus);

                if (ownsAsPatient && !isAdmin && !isDoctor && !"Cancelled".equals(nextStatus)) {
                    throw new ForbiddenException("Patients may only cancel their own appointments.");
                }
            }

            String notes = payload.containsKey("notes") ? ValidationUtil.sanitizeText(payload.get("notes")) : null;
            String prescription = payload.containsKey("prescription") ? ValidationUtil.sanitizeText(payload.get("prescription")) : null;

            if ((notes != null || prescription != null) && !isAdmin && !ownsAsDoctor) {
                throw new ForbiddenException("Only the attending doctor or admin can record clinical notes.");
            }

            appointmentDAO.updateAppointment(appointmentId, nextStatus, notes, prescription);
            res.put("status", "success");
            res.put("appointment", appointmentDAO.findById(appointmentId));
        } catch (ForbiddenException | ValidationException | AppointmentNotFoundException ex) {
            response.setStatus(ex.getErrorCode());
            res.put("status", "error");
            res.put("message", ex.getMessage());
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            res.put("status", "error");
            res.put("message", e.getMessage());
        }

        response.getWriter().write(gson.toJson(res));
    }
}

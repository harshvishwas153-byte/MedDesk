package com.medicare.servlet;

import com.google.gson.Gson;
import com.medicare.dao.DoctorDAO;
import com.medicare.dao.UserDAO;
import com.medicare.exception.ConflictException;
import com.medicare.exception.ForbiddenException;
import com.medicare.exception.ValidationException;
import com.medicare.model.Doctor;
import com.medicare.model.User;
import com.medicare.util.PasswordUtil;
import com.medicare.util.ValidationUtil;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.BufferedReader;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Servlet for Doctor catalog browsing and Admin/Doctor clinical profile management.
 */
public class DoctorServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    private DoctorDAO doctorDAO;
    private UserDAO userDAO;
    private Gson gson;

    @Override
    public void init() throws ServletException {
        this.doctorDAO = new DoctorDAO();
        this.userDAO = new UserDAO();
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
            String doctorId = request.getParameter("id");
            if (doctorId != null && !doctorId.isEmpty()) {
                String validId = ValidationUtil.requireValidId(doctorId, "doctorId");
                Doctor doctor = doctorDAO.findById(validId);
                if (doctor == null) {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    response.getWriter().write("{\"error\":\"Doctor not found.\"}");
                    return;
                }
                response.getWriter().write(gson.toJson(doctor));
                return;
            }

            List<Doctor> doctors = doctorDAO.findAllDoctors();
            response.getWriter().write(gson.toJson(doctors));
        } catch (ValidationException ve) {
            response.setStatus(ve.getErrorCode());
            response.getWriter().write("{\"error\":\"" + ve.getMessage() + "\"}");
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
        Map<String, Object> res = new HashMap<>();

        try (BufferedReader reader = request.getReader()) {
            User currentUser = requireCurrentUser(request);
            if (!"ADMIN".equalsIgnoreCase(currentUser.getRole())) {
                throw new ForbiddenException("Only administrators can register new doctors.");
            }

            Doctor doctor = gson.fromJson(reader, Doctor.class);
            if (doctor == null) {
                throw new ValidationException("Request body must be valid JSON.");
            }

            doctor.setName(ValidationUtil.requireNonBlank(doctor.getName(), "Doctor name", 100));
            doctor.setEmail(ValidationUtil.validateEmail(doctor.getEmail()));
            doctor.setSpecialty(ValidationUtil.requireNonBlank(doctor.getSpecialty(), "Specialty", 100));
            doctor.setDepartment(ValidationUtil.requireNonBlank(doctor.getDepartment(), "Department", 100));
            doctor.setHospital(ValidationUtil.requireNonBlank(
                    doctor.getHospital() != null ? doctor.getHospital() : "MedDesk Super Specialty Hospital",
                    "Hospital", 150));
            doctor.setConsultationFee(ValidationUtil.validatePositiveAmount(doctor.getConsultationFee(), "Consultation fee"));
            doctor.setPhone(ValidationUtil.validatePhone(doctor.getPhone()));

            if (userDAO.findByEmail(doctor.getEmail()) != null) {
                throw new ConflictException("A user with this email already exists.");
            }

            if (doctor.getId() == null || doctor.getId().trim().isEmpty()) {
                doctor.setId("doc-" + UUID.randomUUID().toString().substring(0, 8));
            } else {
                doctor.setId(ValidationUtil.requireValidId(doctor.getId(), "doctorId"));
            }

            if (doctor.getUniqueDoctorId() == null || doctor.getUniqueDoctorId().trim().isEmpty()) {
                doctor.setUniqueDoctorId("DOC-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
            }

            String initialPassword = UUID.randomUUID().toString().substring(0, 12);
            doctor.setPasswordHash(PasswordUtil.hashPassword(initialPassword));
            doctor.setUserId("usr-" + UUID.randomUUID().toString().substring(0, 8));

            if (doctor.getAvailableDays() == null || doctor.getAvailableDays().isEmpty()) {
                doctor.setAvailableDays(Arrays.asList("Mon", "Tue", "Wed", "Thu", "Fri"));
            }
            if (doctor.getTimeSlots() == null || doctor.getTimeSlots().isEmpty()) {
                doctor.setTimeSlots(Arrays.asList("09:00 AM", "10:30 AM", "02:00 PM", "04:30 PM"));
            }

            doctorDAO.createDoctorWithTransaction(doctor);
            response.setStatus(HttpServletResponse.SC_CREATED);
            res.put("status", "success");
            res.put("doctor", doctor);
        } catch (ForbiddenException | ValidationException | ConflictException ex) {
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

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        Map<String, Object> res = new HashMap<>();

        try (BufferedReader reader = request.getReader()) {
            User currentUser = requireCurrentUser(request);
            boolean isAdmin = "ADMIN".equalsIgnoreCase(currentUser.getRole());

            Doctor payload = gson.fromJson(reader, Doctor.class);
            if (payload == null) {
                throw new ValidationException("Request body must be valid JSON.");
            }
            String doctorId = ValidationUtil.requireValidId(payload.getId(), "doctorId");

            Doctor existing = doctorDAO.findById(doctorId);
            if (existing == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                res.put("error", "Doctor not found.");
                response.getWriter().write(gson.toJson(res));
                return;
            }

            if (!isAdmin && !existing.getUserId().equals(currentUser.getId())) {
                throw new ForbiddenException("Only administrators or the attending doctor can update this profile.");
            }

            if (payload.getName() != null && !payload.getName().trim().isEmpty()) {
                existing.setName(ValidationUtil.requireNonBlank(payload.getName(), "Doctor name", 100));
            }
            if (payload.getSpecialty() != null && !payload.getSpecialty().trim().isEmpty()) {
                existing.setSpecialty(ValidationUtil.requireNonBlank(payload.getSpecialty(), "Specialty", 100));
            }
            if (payload.getDepartment() != null && !payload.getDepartment().trim().isEmpty()) {
                existing.setDepartment(ValidationUtil.requireNonBlank(payload.getDepartment(), "Department", 100));
            }
            if (payload.getHospital() != null && !payload.getHospital().trim().isEmpty()) {
                existing.setHospital(ValidationUtil.requireNonBlank(payload.getHospital(), "Hospital", 150));
            }
            if (payload.getConsultationFee() != null && payload.getConsultationFee().compareTo(BigDecimal.ZERO) > 0) {
                existing.setConsultationFee(ValidationUtil.validatePositiveAmount(payload.getConsultationFee(), "Fee"));
            }
            if (payload.getExperienceYears() > 0) {
                existing.setExperienceYears(payload.getExperienceYears());
            }
            if (payload.getAbout() != null) {
                existing.setAbout(ValidationUtil.sanitizeText(payload.getAbout()));
            }
            if (payload.getEducation() != null) {
                existing.setEducation(ValidationUtil.sanitizeText(payload.getEducation()));
            }
            if (payload.getPhone() != null) {
                existing.setPhone(ValidationUtil.validatePhone(payload.getPhone()));
            }
            if (payload.getAvailabilityStatus() != null) {
                existing.setAvailabilityStatus(ValidationUtil.sanitizeText(payload.getAvailabilityStatus()));
            }
            if (payload.getAvailableDays() != null && !payload.getAvailableDays().isEmpty()) {
                existing.setAvailableDays(payload.getAvailableDays());
            }
            if (payload.getTimeSlots() != null && !payload.getTimeSlots().isEmpty()) {
                existing.setTimeSlots(payload.getTimeSlots());
            }

            doctorDAO.updateDoctor(existing);
            res.put("status", "success");
            res.put("doctor", doctorDAO.findById(doctorId));
        } catch (ForbiddenException | ValidationException ex) {
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

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        Map<String, Object> res = new HashMap<>();

        try {
            User currentUser = requireCurrentUser(request);
            if (!"ADMIN".equalsIgnoreCase(currentUser.getRole())) {
                throw new ForbiddenException("Only administrators can remove doctors.");
            }
            String doctorId = ValidationUtil.requireValidId(request.getParameter("id"), "doctorId");
            boolean deleted = doctorDAO.deleteDoctor(doctorId);
            if (!deleted) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                res.put("error", "Doctor not found.");
            } else {
                res.put("status", "success");
                res.put("message", "Doctor removed.");
            }
        } catch (ForbiddenException | ValidationException ex) {
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

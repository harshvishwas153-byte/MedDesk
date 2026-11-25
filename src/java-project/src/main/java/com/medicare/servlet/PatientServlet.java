package com.medicare.servlet;

import com.google.gson.Gson;
import com.medicare.dao.UserDAO;
import com.medicare.exception.ConflictException;
import com.medicare.exception.ForbiddenException;
import com.medicare.exception.ValidationException;
import com.medicare.model.Patient;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Servlet for patient & user directory management with role-based access control.
 */
public class PatientServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    private UserDAO userDAO;
    private Gson gson;

    @Override
    public void init() throws ServletException {
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
            User currentUser = requireCurrentUser(request);
            String requestedId = request.getParameter("id");
            boolean isAdmin = "ADMIN".equalsIgnoreCase(currentUser.getRole());
            boolean isDoctor = "DOCTOR".equalsIgnoreCase(currentUser.getRole());

            if (requestedId != null && !requestedId.isEmpty()) {
                String validId = ValidationUtil.requireValidId(requestedId, "patientId");
                if (!isAdmin && !isDoctor && !validId.equals(currentUser.getId())) {
                    throw new ForbiddenException("Access denied to another patient's profile.");
                }
                User patient = userDAO.findById(validId);
                if (patient == null) {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    response.getWriter().write("{\"error\":\"Patient not found.\"}");
                    return;
                }
                response.getWriter().write(gson.toJson(patient));
                return;
            }

            if (isAdmin) {
                List<User> allUsers = userDAO.findAllUsers();
                response.getWriter().write(gson.toJson(allUsers));
            } else if (isDoctor) {
                List<User> patients = userDAO.findAllPatients();
                response.getWriter().write(gson.toJson(patients));
            } else {
                User self = userDAO.findById(currentUser.getId());
                response.getWriter().write(gson.toJson(self));
            }
        } catch (ForbiddenException fe) {
            response.setStatus(fe.getErrorCode());
            response.getWriter().write("{\"error\":\"" + fe.getMessage() + "\"}");
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
                throw new ForbiddenException("Only administrators can provision user accounts directly.");
            }

            @SuppressWarnings("unchecked")
            Map<String, String> payload = gson.fromJson(reader, Map.class);
            if (payload == null) {
                throw new ValidationException("Request payload must be JSON.");
            }

            String name = ValidationUtil.requireNonBlank(payload.get("name"), "Name", 100);
            String email = ValidationUtil.validateEmail(payload.get("email"));
            String password = ValidationUtil.validatePassword(payload.get("password"));
            String phone = ValidationUtil.validatePhone(payload.get("phone"));

            if (userDAO.findByEmail(email) != null) {
                throw new ConflictException("Email address already registered.");
            }

            Patient patient = new Patient();
            patient.setId("pat-" + UUID.randomUUID().toString().substring(0, 8));
            patient.setName(name);
            patient.setEmail(email);
            patient.setPasswordHash(PasswordUtil.hashPassword(password));
            patient.setPhone(phone);
            patient.setGender(ValidationUtil.sanitizeText(payload.getOrDefault("gender", "Other")));
            patient.setBloodGroup(ValidationUtil.sanitizeText(payload.getOrDefault("bloodGroup", "O+")));
            patient.setAllergies(ValidationUtil.sanitizeText(payload.get("allergies")));
            patient.setMedicalConditions(ValidationUtil.sanitizeText(payload.get("medicalConditions")));
            patient.setEmergencyContact(ValidationUtil.sanitizeText(payload.get("emergencyContact")));
            patient.setStatus("Active");

            userDAO.createUser(patient);
            response.setStatus(HttpServletResponse.SC_CREATED);
            res.put("status", "success");
            res.put("user", patient);
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

            @SuppressWarnings("unchecked")
            Map<String, String> payload = gson.fromJson(reader, Map.class);
            if (payload == null) {
                throw new ValidationException("Request body must be valid JSON.");
            }

            String targetId = payload.get("id") != null && !payload.get("id").isEmpty()
                    ? ValidationUtil.requireValidId(payload.get("id"), "userId")
                    : currentUser.getId();

            if (!isAdmin && !targetId.equals(currentUser.getId())) {
                throw new ForbiddenException("You may only update your own profile.");
            }

            User existing = userDAO.findById(targetId);
            if (existing == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                res.put("error", "User not found.");
                response.getWriter().write(gson.toJson(res));
                return;
            }

            if (payload.containsKey("status")) {
                if (!isAdmin) {
                    throw new ForbiddenException("Only administrators can change account status.");
                }
                String nextStatus = ValidationUtil.requireNonBlank(payload.get("status"), "Status", 20);
                if (!"Active".equals(nextStatus) && !"Inactive".equals(nextStatus)) {
                    throw new ValidationException("Status must be Active or Inactive.");
                }
                userDAO.updateStatus(targetId, nextStatus);
            }

            if (payload.containsKey("name")) {
                existing.setName(ValidationUtil.requireNonBlank(payload.get("name"), "Name", 100));
            }
            if (payload.containsKey("phone")) {
                existing.setPhone(ValidationUtil.validatePhone(payload.get("phone")));
            }
            if (payload.containsKey("gender")) {
                existing.setGender(ValidationUtil.sanitizeText(payload.get("gender")));
            }
            if (payload.containsKey("bloodGroup")) {
                existing.setBloodGroup(ValidationUtil.sanitizeText(payload.get("bloodGroup")));
            }
            if (payload.containsKey("allergies")) {
                existing.setAllergies(ValidationUtil.sanitizeText(payload.get("allergies")));
            }
            if (payload.containsKey("medicalConditions")) {
                existing.setMedicalConditions(ValidationUtil.sanitizeText(payload.get("medicalConditions")));
            }
            if (payload.containsKey("emergencyContact")) {
                existing.setEmergencyContact(ValidationUtil.sanitizeText(payload.get("emergencyContact")));
            }

            userDAO.updateUser(existing);
            User updated = userDAO.findById(targetId);

            if (targetId.equals(currentUser.getId())) {
                request.getSession(false).setAttribute("currentUser", updated);
            }

            res.put("status", "success");
            res.put("user", updated);
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
                throw new ForbiddenException("Only administrators can delete user records.");
            }
            String userId = ValidationUtil.requireValidId(request.getParameter("id"), "userId");
            if (userId.equals(currentUser.getId())) {
                throw new ValidationException("Cannot delete your own active admin account.");
            }

            boolean deleted = userDAO.deleteUser(userId);
            if (!deleted) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                res.put("error", "User not found.");
            } else {
                res.put("status", "success");
                res.put("message", "User deleted.");
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

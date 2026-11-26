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
import java.util.Map;
import java.util.UUID;

/**
 * Auth Servlet managing real credential verification, patient registration, and HTTP Sessions.
 */
public class AuthServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    private UserDAO userDAO;
    private Gson gson;

    @Override
    public void init() throws ServletException {
        this.userDAO = new UserDAO();
        this.gson = new Gson();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String pathInfo = request.getPathInfo();
        HttpSession session = request.getSession(false);
        Map<String, Object> result = new HashMap<>();

        if ("/logout".equals(pathInfo)) {
            if (session != null) {
                session.invalidate();
            }
            result.put("status", "success");
            result.put("message", "User successfully logged out and session cleared.");
            response.getWriter().write(gson.toJson(result));
            return;
        }

        if (session != null && session.getAttribute("currentUser") != null) {
            User user = (User) session.getAttribute("currentUser");
            result.put("authenticated", true);
            result.put("user", user);
            result.put("sessionId", session.getId());
        } else {
            result.put("authenticated", false);
            result.put("message", "No active HTTP session found.");
        }

        response.getWriter().write(gson.toJson(result));
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String pathInfo = request.getPathInfo();
        Map<String, Object> responseData = new HashMap<>();

        try (BufferedReader reader = request.getReader()) {
            @SuppressWarnings("unchecked")
            Map<String, String> payload = gson.fromJson(reader, Map.class);
            if (payload == null) {
                throw new ValidationException("Request body must be valid JSON.");
            }

            if ("/register".equals(pathInfo)) {
                handleRegister(request, response, payload, responseData);
            } else if ("/logout".equals(pathInfo)) {
                HttpSession existing = request.getSession(false);
                if (existing != null) {
                    existing.invalidate();
                }
                responseData.put("status", "success");
                responseData.put("message", "Logged out.");
                response.setStatus(HttpServletResponse.SC_OK);
            } else {
                handleLogin(request, response, payload, responseData);
            }
        } catch (ValidationException ve) {
            response.setStatus(ve.getErrorCode());
            responseData.put("status", "error");
            responseData.put("message", ve.getMessage());
        } catch (ConflictException ce) {
            response.setStatus(ce.getErrorCode());
            responseData.put("status", "error");
            responseData.put("message", ce.getMessage());
        } catch (ForbiddenException fe) {
            response.setStatus(fe.getErrorCode());
            responseData.put("status", "error");
            responseData.put("message", fe.getMessage());
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            responseData.put("status", "error");
            responseData.put("message", "Authentication service error: " + e.getMessage());
        }

        response.getWriter().write(gson.toJson(responseData));
    }

    private void handleLogin(HttpServletRequest request, HttpServletResponse response,
                             Map<String, String> credentials, Map<String, Object> responseData)
            throws Exception {
        String identifier = credentials.get("email");
        if (identifier == null || identifier.trim().isEmpty()) {
            identifier = credentials.get("doctorId");
        }
        String cleanIdentifier = ValidationUtil.requireNonBlank(identifier, "Email or Doctor ID", 160);
        String password = ValidationUtil.requireNonBlank(credentials.get("password"), "Password", 128);

        User user = cleanIdentifier.contains("@")
                ? userDAO.findByEmail(cleanIdentifier.toLowerCase())
                : userDAO.findByUniqueDoctorId(cleanIdentifier);

        if (user == null || !PasswordUtil.verifyPassword(password, user.getPasswordHash())) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            responseData.put("status", "error");
            responseData.put("message", "Invalid email/doctor ID or password.");
            return;
        }

        if ("Inactive".equalsIgnoreCase(user.getStatus())) {
            throw new ForbiddenException("Account is deactivated. Contact hospital administration.");
        }

        HttpSession oldSession = request.getSession(false);
        if (oldSession != null) {
            oldSession.invalidate();
        }
        HttpSession session = request.getSession(true);
        session.setAttribute("currentUser", user);
        session.setAttribute("userRole", user.getRole());
        session.setMaxInactiveInterval(30 * 60);

        responseData.put("status", "success");
        responseData.put("message", "Login successful");
        responseData.put("user", user);
        responseData.put("sessionId", session.getId());
        response.setStatus(HttpServletResponse.SC_OK);
    }

    private void handleRegister(HttpServletRequest request, HttpServletResponse response,
                                Map<String, String> payload, Map<String, Object> responseData)
            throws Exception {
        String name = ValidationUtil.requireNonBlank(payload.get("name"), "Full name", 100);
        String email = ValidationUtil.validateEmail(payload.get("email"));
        String password = ValidationUtil.validatePassword(payload.get("password"));
        String phone = ValidationUtil.validatePhone(payload.get("phone"));
        String gender = ValidationUtil.sanitizeText(payload.getOrDefault("gender", "Other"));
        String bloodGroup = ValidationUtil.sanitizeText(payload.getOrDefault("bloodGroup", "O+"));

        if (userDAO.findByEmail(email) != null) {
            throw new ConflictException("An account with this email already exists.");
        }

        Patient patient = new Patient();
        patient.setId("pat-" + UUID.randomUUID().toString().substring(0, 8));
        patient.setName(name);
        patient.setEmail(email);
        patient.setPasswordHash(PasswordUtil.hashPassword(password));
        patient.setRole("PATIENT");
        patient.setPhone(phone);
        patient.setGender(gender.isEmpty() ? "Other" : gender);
        patient.setBloodGroup(bloodGroup.isEmpty() ? "O+" : bloodGroup);
        patient.setStatus("Active");

        userDAO.createUser(patient);

        HttpSession session = request.getSession(true);
        session.setAttribute("currentUser", patient);
        session.setAttribute("userRole", "PATIENT");
        session.setMaxInactiveInterval(30 * 60);

        responseData.put("status", "success");
        responseData.put("message", "Patient account registered successfully.");
        responseData.put("user", patient);
        responseData.put("sessionId", session.getId());
        response.setStatus(HttpServletResponse.SC_CREATED);
    }
}

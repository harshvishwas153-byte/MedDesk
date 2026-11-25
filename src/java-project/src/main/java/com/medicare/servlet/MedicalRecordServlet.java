package com.medicare.servlet;

import com.google.gson.Gson;
import com.medicare.dao.MedicalRecordDAO;
import com.medicare.exception.ForbiddenException;
import com.medicare.exception.ValidationException;
import com.medicare.model.MedicalRecord;
import com.medicare.model.User;
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
 * Servlet for managing patient Electronic Health Records (EHR) with strict ownership checks.
 */
public class MedicalRecordServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    private MedicalRecordDAO medicalRecordDAO;
    private Gson gson;

    @Override
    public void init() throws ServletException {
        this.medicalRecordDAO = new MedicalRecordDAO();
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
            boolean isClinicalOrAdmin = "DOCTOR".equalsIgnoreCase(currentUser.getRole())
                    || "ADMIN".equalsIgnoreCase(currentUser.getRole());

            String requestedPatientId = request.getParameter("patientId");
            if (requestedPatientId != null && !requestedPatientId.isEmpty()) {
                String validPatientId = ValidationUtil.requireValidId(requestedPatientId, "patientId");
                if (!isClinicalOrAdmin && !validPatientId.equals(currentUser.getId())) {
                    throw new ForbiddenException("Access denied to another patient's medical records.");
                }
                List<MedicalRecord> records = medicalRecordDAO.findByPatientId(validPatientId);
                response.getWriter().write(gson.toJson(records));
                return;
            }

            if (isClinicalOrAdmin) {
                List<MedicalRecord> all = medicalRecordDAO.findAll();
                response.getWriter().write(gson.toJson(all));
            } else {
                List<MedicalRecord> own = medicalRecordDAO.findByPatientId(currentUser.getId());
                response.getWriter().write(gson.toJson(own));
            }
        } catch (ForbiddenException | ValidationException ex) {
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
            boolean isClinicalOrAdmin = "DOCTOR".equalsIgnoreCase(currentUser.getRole())
                    || "ADMIN".equalsIgnoreCase(currentUser.getRole());

            MedicalRecord record = gson.fromJson(reader, MedicalRecord.class);
            if (record == null) {
                throw new ValidationException("Request body must be valid JSON.");
            }

            if (!isClinicalOrAdmin || record.getPatientId() == null || record.getPatientId().isEmpty()) {
                record.setPatientId(currentUser.getId());
            } else {
                record.setPatientId(ValidationUtil.requireValidId(record.getPatientId(), "patientId"));
            }

            record.setTitle(ValidationUtil.requireNonBlank(record.getTitle(), "Record title", 150));
            record.setCategory(ValidationUtil.validateRecordCategory(record.getCategory()));
            record.setDate(ValidationUtil.requireNonBlank(record.getDate(), "Record date", 30));
            record.setDoctorName(ValidationUtil.sanitizeText(
                    record.getDoctorName() != null ? record.getDoctorName() : currentUser.getName()));
            record.setFacility(ValidationUtil.sanitizeText(
                    record.getFacility() != null ? record.getFacility() : "MedDesk Hospital Network"));
            record.setNotes(ValidationUtil.requireNonBlank(record.getNotes(), "Clinical notes", 2000));

            if (record.getId() == null || record.getId().isEmpty()) {
                record.setId("REC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            } else {
                record.setId(ValidationUtil.requireValidId(record.getId(), "recordId"));
            }

            boolean success = medicalRecordDAO.createRecord(record);
            if (success) {
                response.setStatus(HttpServletResponse.SC_CREATED);
                responseData.put("status", "success");
                responseData.put("message", "Medical record created successfully.");
                responseData.put("record", record);
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                responseData.put("status", "error");
                responseData.put("message", "Failed to create medical record.");
            }
        } catch (ForbiddenException | ValidationException ex) {
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
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        Map<String, Object> res = new HashMap<>();

        try {
            User currentUser = requireCurrentUser(request);
            boolean isClinicalOrAdmin = "DOCTOR".equalsIgnoreCase(currentUser.getRole())
                    || "ADMIN".equalsIgnoreCase(currentUser.getRole());

            String recordId = ValidationUtil.requireValidId(request.getParameter("id"), "recordId");
            MedicalRecord existing = medicalRecordDAO.findById(recordId);
            if (existing == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                res.put("error", "Medical record not found.");
                response.getWriter().write(gson.toJson(res));
                return;
            }

            if (!isClinicalOrAdmin && !existing.getPatientId().equals(currentUser.getId())) {
                throw new ForbiddenException("You do not have permission to delete this record.");
            }

            medicalRecordDAO.deleteRecord(recordId);
            res.put("status", "success");
            res.put("message", "Medical record deleted.");
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

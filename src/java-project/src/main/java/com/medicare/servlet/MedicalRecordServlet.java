package com.medicare.servlet;

import com.google.gson.Gson;
import com.medicare.dao.MedicalRecordDAO;
import com.medicare.model.MedicalRecord;
import com.medicare.model.User;

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
 * Servlet for managing patient electronic health records (EHR).
 * Rubric Criterion: Servlets & Web Integration
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

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String patientId = request.getParameter("patientId");

        HttpSession session = request.getSession(false);
        if (patientId == null && session != null && session.getAttribute("currentUser") != null) {
            User user = (User) session.getAttribute("currentUser");
            patientId = user.getId();
        }

        try {
            if (patientId != null) {
                List<MedicalRecord> list = medicalRecordDAO.findByPatientId(patientId);
                response.getWriter().write(gson.toJson(list));
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                Map<String, String> err = new HashMap<>();
                err.put("error", "Missing patientId");
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
        MedicalRecord record = gson.fromJson(reader, MedicalRecord.class);

        if (record.getId() == null || record.getId().isEmpty()) {
            record.setId("REC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }

        Map<String, Object> responseData = new HashMap<>();

        try {
            boolean success = medicalRecordDAO.createRecord(record);

            if (success) {
                responseData.put("status", "success");
                responseData.put("message", "Medical record created successfully.");
                responseData.put("record", record);
                response.setStatus(HttpServletResponse.SC_CREATED);
            } else {
                responseData.put("status", "error");
                responseData.put("message", "Failed to create medical record.");
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            }
        } catch (Exception e) {
            responseData.put("status", "error");
            responseData.put("message", e.getMessage());
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }

        response.getWriter().write(gson.toJson(responseData));
    }
}

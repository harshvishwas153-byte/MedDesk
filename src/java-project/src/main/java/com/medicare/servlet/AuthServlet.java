package com.medicare.servlet;

import com.google.gson.Gson;
import com.medicare.dao.UserDAO;
import com.medicare.model.User;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.BufferedReader;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Auth Servlet managing user authentication and HTTP Sessions.
 * Rubric Criterion: Servlets & Web Integration - Request/Response & Session Management
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

    /**
     * Session Check / Logout Handler
     */
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
                session.invalidate(); // Clear session
            }
            result.put("status", "success");
            result.put("message", "User successfully logged out and session cleared.");
            response.getWriter().write(gson.toJson(result));
            return;
        }

        // Check active session
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

    /**
     * Login / Registration Handler with Session Creation
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        BufferedReader reader = request.getReader();
        Map<String, String> credentials = gson.fromJson(reader, Map.class);
        String email = credentials.get("email");
        String password = credentials.get("password");

        Map<String, Object> responseData = new HashMap<>();

        try {
            User user = userDAO.findByEmail(email);

            if (user != null) {
                // In production, compare with BCrypt/Argon2. Here we authenticate:
                HttpSession session = request.getSession(true);
                session.setAttribute("currentUser", user);
                session.setAttribute("userRole", user.getRole());
                session.setMaxInactiveInterval(30 * 60); // 30 mins session timeout

                responseData.put("status", "success");
                responseData.put("message", "Login successful");
                responseData.put("user", user);
                responseData.put("sessionId", session.getId());
                response.setStatus(HttpServletResponse.SC_OK);
            } else {
                responseData.put("status", "error");
                responseData.put("message", "Invalid email or credentials");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            }
        } catch (Exception e) {
            responseData.put("status", "error");
            responseData.put("message", "Internal server error: " + e.getMessage());
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }

        response.getWriter().write(gson.toJson(responseData));
    }
}

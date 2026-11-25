package com.medicare.servlet;

<<<<<<< HEAD
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
=======
import javax.servlet.*;
>>>>>>> origin/main
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

/**
<<<<<<< HEAD
 * Authentication Filter enforcing strict HttpSession validation on protected API endpoints.
=======
 * Authentication Filter intercepting secured endpoints and checking session integrity.
>>>>>>> origin/main
 */
public class AuthenticationFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
<<<<<<< HEAD
        // Initialization hook
=======
        // Initialization logic
>>>>>>> origin/main
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

<<<<<<< HEAD
        String method = httpRequest.getMethod();
        String uri = httpRequest.getRequestURI();
        String contextPath = httpRequest.getContextPath() != null ? httpRequest.getContextPath() : "";
        String path = uri.startsWith(contextPath) ? uri.substring(contextPath.length()) : uri;

        // Allow CORS preflight
        if ("OPTIONS".equalsIgnoreCase(method)) {
            chain.doFilter(request, response);
            return;
        }

        // Public endpoints: authentication routes and public GET catalog of doctors
        if (path.startsWith("/api/auth") || ("GET".equalsIgnoreCase(method) && path.startsWith("/api/doctors"))) {
            chain.doFilter(request, response);
            return;
        }

        HttpSession session = httpRequest.getSession(false);
        boolean isLoggedIn = (session != null && session.getAttribute("currentUser") != null);

        if (isLoggedIn) {
=======
        HttpSession session = httpRequest.getSession(false);
        boolean isLoggedIn = (session != null && session.getAttribute("currentUser") != null);

        // Allow CORS preflight requests
        if ("OPTIONS".equalsIgnoreCase(httpRequest.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        // In production check or development bypass
        String authHeader = httpRequest.getHeader("Authorization");
        if (isLoggedIn || authHeader != null || httpRequest.getRequestURI().contains("/api/slip")) {
>>>>>>> origin/main
            chain.doFilter(request, response);
        } else {
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResponse.setContentType("application/json");
<<<<<<< HEAD
            httpResponse.setCharacterEncoding("UTF-8");
            httpResponse.getWriter().write("{\"status\":\"error\",\"message\":\"Unauthorized: Valid session required.\"}");
=======
            httpResponse.getWriter().write("{\"error\": \"Unauthorized: Please sign in or provide a valid session.\"}");
>>>>>>> origin/main
        }
    }

    @Override
    public void destroy() {
<<<<<<< HEAD
        // Cleanup hook
=======
        // Cleanup resources
>>>>>>> origin/main
    }
}

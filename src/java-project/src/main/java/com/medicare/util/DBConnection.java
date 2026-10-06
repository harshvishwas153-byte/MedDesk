package com.medicare.util;

import com.medicare.exception.DatabaseException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Centralized JDBC Connection Utility for Local MySQL Database Connectivity.
 * Compliant with Mandatory JDBC and Local Database Configuration.
 * 
 * Credentials are retrieved dynamically from Environment Variables (e.g. set via Windows PowerShell)
 * or System Properties, eliminating hardcoded real credentials in source code.
 */
public class DBConnection {

    // Retrieve database configuration from environment variables or system properties
    private static final String DB_DRIVER = getEnvOrProperty("DB_DRIVER", "com.mysql.cj.jdbc.Driver");
    private static final String DB_URL = getEnvOrProperty("DB_URL", "jdbc:mysql://localhost:3306/meddesk_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC");
    private static final String DB_USER = getEnvOrProperty("DB_USER", "root");
    private static final String DB_PASSWORD = getEnvOrProperty("DB_PASSWORD", "root");

    static {
        try {
            Class.forName(DB_DRIVER);
        } catch (ClassNotFoundException e) {
            try {
                // Legacy driver fallback for MySQL
                Class.forName("com.mysql.jdbc.Driver");
            } catch (ClassNotFoundException ex) {
                System.err.println("JDBC Driver error: MySQL Connector/J driver class not found in classpath: " + e.getMessage());
            }
        }
    }

    private DBConnection() {
        // Prevent instantiation
    }

    /**
     * Helper method to inspect Environment Variables first, then System Properties, then default fallback.
     */
    private static String getEnvOrProperty(String key, String defaultValue) {
        String envValue = System.getenv(key);
        if (envValue != null && !envValue.trim().isEmpty()) {
            return envValue;
        }
        String propValue = System.getProperty(key);
        if (propValue != null && !propValue.trim().isEmpty()) {
            return propValue;
        }
        return defaultValue;
    }

    /**
     * Obtains a new JDBC Connection from DriverManager.
     * @return Connection active JDBC connection to MySQL database
     * @throws DatabaseException if connection fails
     */
    public static Connection getConnection() throws DatabaseException {
        try {
            return DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
        } catch (SQLException e) {
            throw new DatabaseException("Failed to establish JDBC Connection to MySQL Server [" + DB_URL + "]: " + e.getMessage(), e);
        }
    }

    /**
     * Safely closes AutoCloseable JDBC resources (Connection, PreparedStatement, ResultSet).
     */
    public static void close(AutoCloseable... resources) {
        for (AutoCloseable res : resources) {
            if (res != null) {
                try {
                    res.close();
                } catch (Exception ignored) {
                }
            }
        }
    }
}

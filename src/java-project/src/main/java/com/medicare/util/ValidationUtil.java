package com.medicare.util;

import com.medicare.exception.ValidationException;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Centralized server-side input validation and sanitization utility.
 */
public final class ValidationUtil {
    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9._%+\\-]+@[A-Za-z0-9.\\-]+\\.[A-Za-z]{2,}$");
    private static final Pattern PHONE_PATTERN =
            Pattern.compile("^[+0-9\\s\\-()]{7,20}$");
    private static final Pattern ID_PATTERN =
            Pattern.compile("^[A-Za-z0-9_\\-]{2,64}$");

    private static final Set<String> VALID_APPOINTMENT_STATUSES =
            new HashSet<>(Arrays.asList("Upcoming", "Pending", "Completed", "Cancelled"));
    private static final Set<String> VALID_RECORD_CATEGORIES =
            new HashSet<>(Arrays.asList("Prescriptions", "Test Reports", "Consultations"));

    private ValidationUtil() {
    }

    public static String requireNonBlank(String value, String fieldName, int maxLength) throws ValidationException {
        if (value == null || value.trim().isEmpty()) {
            throw new ValidationException(fieldName + " is required.");
        }
        String sanitized = sanitizeText(value);
        if (sanitized.length() > maxLength) {
            throw new ValidationException(fieldName + " must not exceed " + maxLength + " characters.");
        }
        return sanitized;
    }

    public static String validateEmail(String email) throws ValidationException {
        String clean = requireNonBlank(email, "Email", 160).toLowerCase();
        if (!EMAIL_PATTERN.matcher(clean).matches()) {
            throw new ValidationException("Please provide a valid email address.");
        }
        return clean;
    }

    public static String validatePhone(String phone) throws ValidationException {
        if (phone == null || phone.trim().isEmpty()) {
            return "";
        }
        String clean = sanitizeText(phone);
        if (!PHONE_PATTERN.matcher(clean).matches()) {
            throw new ValidationException("Please provide a valid phone number.");
        }
        return clean;
    }

    public static String validatePassword(String password) throws ValidationException {
        if (password == null || password.length() < 6 || password.length() > 128) {
            throw new ValidationException("Password must be between 6 and 128 characters.");
        }
        return password;
    }

    public static String requireValidId(String id, String fieldName) throws ValidationException {
        String clean = requireNonBlank(id, fieldName, 64);
        if (!ID_PATTERN.matcher(clean).matches()) {
            throw new ValidationException("Invalid " + fieldName + " format.");
        }
        return clean;
    }

    public static BigDecimal validatePositiveAmount(BigDecimal amount, String fieldName) throws ValidationException {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0 || amount.compareTo(BigDecimal.valueOf(100000)) > 0) {
            throw new ValidationException(fieldName + " must be greater than 0 and at most 100000.");
        }
        return amount;
    }

    public static String validateAppointmentStatus(String status) throws ValidationException {
        String clean = requireNonBlank(status, "Status", 30);
        if (!VALID_APPOINTMENT_STATUSES.contains(clean)) {
            throw new ValidationException("Unsupported appointment status: " + clean);
        }
        return clean;
    }

    public static void validateStatusTransition(String currentStatus, String nextStatus) throws ValidationException {
        validateAppointmentStatus(nextStatus);
        if ("Cancelled".equals(currentStatus) && !"Cancelled".equals(nextStatus)) {
            throw new ValidationException("Cancelled appointments cannot be reopened.");
        }
    }

    public static String validateRecordCategory(String category) throws ValidationException {
        String clean = requireNonBlank(category, "Category", 40);
        if (!VALID_RECORD_CATEGORIES.contains(clean)) {
            throw new ValidationException("Invalid medical record category: " + clean);
        }
        return clean;
    }

    public static String sanitizeText(String input) {
        if (input == null) {
            return "";
        }
        return input
                .replace("<", "")
                .replace(">", "")
                .replaceAll("[\\p{Cntrl}&&[^\r\n\t]]", "")
                .trim();
    }
}

package com.medicare.exception;

/**
 * Exception thrown when request input fails validation rules (HTTP 400).
 */
public class ValidationException extends MedicareException {
    private static final long serialVersionUID = 1L;

    public ValidationException(String message) {
        super(message, 400);
    }
}

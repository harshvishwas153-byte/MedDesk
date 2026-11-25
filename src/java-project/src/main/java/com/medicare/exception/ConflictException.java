package com.medicare.exception;

/**
 * Exception thrown when a booking or registration conflicts with existing state (HTTP 409).
 */
public class ConflictException extends MedicareException {
    private static final long serialVersionUID = 1L;

    public ConflictException(String message) {
        super(message, 409);
    }
}

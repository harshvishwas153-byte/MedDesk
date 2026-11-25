package com.medicare.exception;

/**
 * Exception thrown when an authenticated user lacks permission for a resource (HTTP 403).
 */
public class ForbiddenException extends MedicareException {
    private static final long serialVersionUID = 1L;

    public ForbiddenException(String message) {
        super(message, 403);
    }
}

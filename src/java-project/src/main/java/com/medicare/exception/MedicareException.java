package com.medicare.exception;

/**
 * Base Application Exception for MediCare+ Platform.
 * Demonstrates proper Java Exception Hierarchy and Exception Handling.
 */
public class MedicareException extends Exception {
    private static final long serialVersionUID = 1L;

    private int errorCode;

    public MedicareException(String message) {
        super(message);
        this.errorCode = 500;
    }

    public MedicareException(String message, int errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public MedicareException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = 500;
    }

    public int getErrorCode() {
        return errorCode;
    }
}

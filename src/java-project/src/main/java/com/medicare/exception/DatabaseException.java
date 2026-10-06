package com.medicare.exception;

public class DatabaseException extends MedicareException {
    private static final long serialVersionUID = 1L;

    public DatabaseException(String message) {
        super(message, 500);
    }

    public DatabaseException(String message, Throwable cause) {
        super(message, cause);
    }
}

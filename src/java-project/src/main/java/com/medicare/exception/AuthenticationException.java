package com.medicare.exception;

public class AuthenticationException extends MedicareException {
    private static final long serialVersionUID = 1L;

    public AuthenticationException(String message) {
        super(message, 401);
    }
}

package com.medicare.exception;

public class AppointmentNotFoundException extends MedicareException {
    private static final long serialVersionUID = 1L;

    public AppointmentNotFoundException(String message) {
        super(message, 404);
    }
}

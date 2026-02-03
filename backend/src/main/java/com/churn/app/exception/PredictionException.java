package com.churn.app.exception;

public class PredictionException extends RuntimeException {

    private final int statusCode;

    public PredictionException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    public int getStatusCode() {
        return statusCode;
    }
}

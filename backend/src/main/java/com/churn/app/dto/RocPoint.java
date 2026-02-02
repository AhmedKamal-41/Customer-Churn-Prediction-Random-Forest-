package com.churn.app.dto;

public class RocPoint {

    private double fpr;
    private double tpr;

    public RocPoint() {
    }

    public RocPoint(double fpr, double tpr) {
        this.fpr = fpr;
        this.tpr = tpr;
    }

    public double getFpr() {
        return fpr;
    }

    public void setFpr(double fpr) {
        this.fpr = fpr;
    }

    public double getTpr() {
        return tpr;
    }

    public void setTpr(double tpr) {
        this.tpr = tpr;
    }
}

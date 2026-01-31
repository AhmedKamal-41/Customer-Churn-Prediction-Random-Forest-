package com.churn.app.dto;

public class ExplanationItem {

    private String feature;
    private String reason;

    public ExplanationItem() {
    }

    public ExplanationItem(String feature, String reason) {
        this.feature = feature;
        this.reason = reason;
    }

    public String getFeature() {
        return feature;
    }

    public void setFeature(String feature) {
        this.feature = feature;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}

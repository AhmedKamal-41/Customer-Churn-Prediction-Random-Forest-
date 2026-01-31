package com.churn.app.dto;

public class FeatureImportanceItem {

    private String feature;
    private double importance;

    public FeatureImportanceItem() {
    }

    public FeatureImportanceItem(String feature, double importance) {
        this.feature = feature;
        this.importance = importance;
    }

    public String getFeature() {
        return feature;
    }

    public void setFeature(String feature) {
        this.feature = feature;
    }

    public double getImportance() {
        return importance;
    }

    public void setImportance(double importance) {
        this.importance = importance;
    }
}

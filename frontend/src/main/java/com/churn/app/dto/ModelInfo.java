package com.churn.app.dto;

public class ModelInfo {

    private String name;
    private String version;
    private String lastTrainedAt;
    private String lastEvaluatedAt;
    private String dataset;
    private String notes;

    public ModelInfo() {
    }

    public ModelInfo(String name, String version, String lastTrainedAt, String lastEvaluatedAt, String dataset, String notes) {
        this.name = name;
        this.version = version;
        this.lastTrainedAt = lastTrainedAt;
        this.lastEvaluatedAt = lastEvaluatedAt;
        this.dataset = dataset;
        this.notes = notes;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getLastTrainedAt() {
        return lastTrainedAt;
    }

    public void setLastTrainedAt(String lastTrainedAt) {
        this.lastTrainedAt = lastTrainedAt;
    }

    public String getLastEvaluatedAt() {
        return lastEvaluatedAt;
    }

    public void setLastEvaluatedAt(String lastEvaluatedAt) {
        this.lastEvaluatedAt = lastEvaluatedAt;
    }

    public String getDataset() {
        return dataset;
    }

    public void setDataset(String dataset) {
        this.dataset = dataset;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

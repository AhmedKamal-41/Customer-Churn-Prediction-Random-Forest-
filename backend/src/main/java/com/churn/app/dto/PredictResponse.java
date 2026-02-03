package com.churn.app.dto;

import java.util.List;

public class PredictResponse {

    private String label;
    private double score;
    private int votes;
    private List<ExplanationItem> explanation;
    private String modelVersion;

    public PredictResponse() {
    }

    public PredictResponse(String label, double score, int votes, List<ExplanationItem> explanation) {
        this(label, score, votes, explanation, null);
    }

    public PredictResponse(String label, double score, int votes, List<ExplanationItem> explanation, String modelVersion) {
        this.label = label;
        this.score = score;
        this.votes = votes;
        this.explanation = explanation;
        this.modelVersion = modelVersion;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public int getVotes() {
        return votes;
    }

    public void setVotes(int votes) {
        this.votes = votes;
    }

    public List<ExplanationItem> getExplanation() {
        return explanation;
    }

    public void setExplanation(List<ExplanationItem> explanation) {
        this.explanation = explanation;
    }

    public String getModelVersion() {
        return modelVersion;
    }

    public void setModelVersion(String modelVersion) {
        this.modelVersion = modelVersion;
    }
}

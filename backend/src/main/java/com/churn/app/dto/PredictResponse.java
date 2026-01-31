package com.churn.app.dto;

import java.util.List;

public class PredictResponse {

    private String label;
    private double score;
    private int votes;
    private List<ExplanationItem> explanation;

    public PredictResponse() {
    }

    public PredictResponse(String label, double score, int votes, List<ExplanationItem> explanation) {
        this.label = label;
        this.score = score;
        this.votes = votes;
        this.explanation = explanation;
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
}

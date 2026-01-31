package com.churn.app.dto;

import java.util.List;

public class ConfusionMatrix {

    private List<String> labels;
    private List<List<Integer>> matrix;

    public ConfusionMatrix() {
    }

    public ConfusionMatrix(List<String> labels, List<List<Integer>> matrix) {
        this.labels = labels;
        this.matrix = matrix;
    }

    public List<String> getLabels() {
        return labels;
    }

    public void setLabels(List<String> labels) {
        this.labels = labels;
    }

    public List<List<Integer>> getMatrix() {
        return matrix;
    }

    public void setMatrix(List<List<Integer>> matrix) {
        this.matrix = matrix;
    }
}

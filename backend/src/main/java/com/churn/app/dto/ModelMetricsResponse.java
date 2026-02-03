package com.churn.app.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ModelMetricsResponse {

    private ModelInfo model;
    private Kpis kpis;
    private ConfusionMatrix confusionMatrix;
    private List<RocPoint> rocCurve;
    private List<FeatureImportanceItem> featureImportance;

    public ModelMetricsResponse() {
    }

    public ModelMetricsResponse(ModelInfo model, Kpis kpis, ConfusionMatrix confusionMatrix,
                               List<RocPoint> rocCurve, List<FeatureImportanceItem> featureImportance) {
        this.model = model;
        this.kpis = kpis;
        this.confusionMatrix = confusionMatrix;
        this.rocCurve = rocCurve;
        this.featureImportance = featureImportance;
    }

    public ModelInfo getModel() {
        return model;
    }

    public void setModel(ModelInfo model) {
        this.model = model;
    }

    public Kpis getKpis() {
        return kpis;
    }

    public void setKpis(Kpis kpis) {
        this.kpis = kpis;
    }

    public ConfusionMatrix getConfusionMatrix() {
        return confusionMatrix;
    }

    public void setConfusionMatrix(ConfusionMatrix confusionMatrix) {
        this.confusionMatrix = confusionMatrix;
    }

    public List<RocPoint> getRocCurve() {
        return rocCurve;
    }

    public void setRocCurve(List<RocPoint> rocCurve) {
        this.rocCurve = rocCurve;
    }

    public List<FeatureImportanceItem> getFeatureImportance() {
        return featureImportance;
    }

    public void setFeatureImportance(List<FeatureImportanceItem> featureImportance) {
        this.featureImportance = featureImportance;
    }
}

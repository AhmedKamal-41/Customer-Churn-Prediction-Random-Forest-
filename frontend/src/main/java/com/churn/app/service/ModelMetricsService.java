package com.churn.app.service;

import com.churn.app.dto.FeatureImportanceItem;
import com.churn.app.dto.ModelMetricsResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collections;
import java.util.List;

@Service
public class ModelMetricsService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Path metricsPath;

    public ModelMetricsService(@Value("${model.metrics-path:./backend/models/metrics.json}") String metricsPath) {
        this.metricsPath = Path.of(metricsPath);
    }

    public ModelMetricsResponse getMetrics() {
        try {
            if (!Files.isRegularFile(metricsPath)) {
                throw new IllegalStateException("Model metrics file not found. Run training first: python backend/ml/train_rf.py");
            }
            String json = Files.readString(metricsPath);
            return objectMapper.readValue(json, ModelMetricsResponse.class);
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalStateException("Model metrics file not found or invalid.", e);
        }
    }

    public List<FeatureImportanceItem> getFeatureImportance() {
        try {
            ModelMetricsResponse metrics = getMetrics();
            List<FeatureImportanceItem> list = metrics.getFeatureImportance();
            return list != null ? list : Collections.emptyList();
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}

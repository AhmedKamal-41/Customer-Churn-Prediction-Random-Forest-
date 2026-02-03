package com.churn.app.service;

import com.churn.app.dto.FeatureImportanceItem;
import com.churn.app.dto.ModelMetricsResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collections;
import java.util.List;
import java.util.stream.Stream;

@Service
public class ModelMetricsService {

    private static final String CLASSPATH_METRICS = "models/metrics.json";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String configuredMetricsPath;

    public ModelMetricsService(@Value("${model.metrics-path:./models/metrics.json}") String metricsPath) {
        this.configuredMetricsPath = metricsPath;
    }

    private Path resolveMetricsPath() {
        return Stream.of(
                Path.of(configuredMetricsPath),
                Path.of("backend/models/metrics.json"),
                Path.of("models/metrics.json")
        )
                .filter(p -> Files.isRegularFile(p))
                .findFirst()
                .orElse(null);
    }

    public ModelMetricsResponse getMetrics() {
        try {
            Path path = resolveMetricsPath();
            String json;
            if (path != null) {
                json = Files.readString(path);
            } else {
                ClassPathResource resource = new ClassPathResource(CLASSPATH_METRICS);
                if (!resource.exists()) {
                    throw new IllegalStateException("Model metrics file not found. Run training first: python backend/ml/train_rf.py");
                }
                try (InputStream in = resource.getInputStream()) {
                    json = new String(in.readAllBytes(), StandardCharsets.UTF_8);
                }
            }
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

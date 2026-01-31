package com.churn.app.service;

import com.churn.app.dto.ModelMetricsResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;

@Service
public class ModelMetricsService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final String METRICS_RESOURCE = "model_metrics.json";

    public ModelMetricsResponse getMetrics() {
        try {
            ClassPathResource resource = new ClassPathResource(METRICS_RESOURCE);
            if (!resource.exists()) {
                throw new IllegalStateException("Model metrics file not found or invalid.");
            }
            try (InputStream is = resource.getInputStream()) {
                return objectMapper.readValue(is, ModelMetricsResponse.class);
            }
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalStateException("Model metrics file not found or invalid.", e);
        }
    }
}

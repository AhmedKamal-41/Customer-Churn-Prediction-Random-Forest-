package com.churn.app.controller;

import com.churn.app.dto.FeatureImportanceItem;
import com.churn.app.dto.ModelMetricsResponse;
import com.churn.app.service.ModelMetricsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/model")
public class ModelMetricsController {

    private final ModelMetricsService modelMetricsService;

    public ModelMetricsController(ModelMetricsService modelMetricsService) {
        this.modelMetricsService = modelMetricsService;
    }

    @GetMapping("/metrics")
    public ResponseEntity<ModelMetricsResponse> getMetrics() {
        return ResponseEntity.ok(modelMetricsService.getMetrics());
    }

    @GetMapping("/feature-importance")
    public ResponseEntity<List<FeatureImportanceItem>> getFeatureImportance() {
        return ResponseEntity.ok(modelMetricsService.getFeatureImportance());
    }
}

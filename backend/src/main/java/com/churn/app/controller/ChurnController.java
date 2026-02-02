package com.churn.app.controller;

import com.churn.app.dto.PredictRequest;
import com.churn.app.dto.PredictResponse;
import com.churn.app.service.ChurnScoringService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ChurnController {

    private static final Logger log = LoggerFactory.getLogger(ChurnController.class);

    private final ChurnScoringService churnScoringService;

    public ChurnController(ChurnScoringService churnScoringService) {
        this.churnScoringService = churnScoringService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        log.info("GET /api/health");
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @GetMapping("/metadata")
    public ResponseEntity<Map<String, List<String>>> metadata() {
        return ResponseEntity.ok(Map.of(
                "contractOptions", List.of("Month-to-month", "One year", "Two year"),
                "internetServiceOptions", List.of("DSL", "Fiber optic", "None")
        ));
    }

    @PostMapping(value = "/predict", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PredictResponse> predict(@Valid @RequestBody PredictRequest request) {
        PredictResponse response = churnScoringService.predict(request);
        return ResponseEntity.ok(response);
    }
}

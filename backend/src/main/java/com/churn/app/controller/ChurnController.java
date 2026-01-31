package com.churn.app.controller;

import com.churn.app.dto.PredictRequest;
import com.churn.app.dto.PredictResponse;
import com.churn.app.service.ChurnScoringService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ChurnController {

    private final ChurnScoringService churnScoringService;

    public ChurnController(ChurnScoringService churnScoringService) {
        this.churnScoringService = churnScoringService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "ok"));
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

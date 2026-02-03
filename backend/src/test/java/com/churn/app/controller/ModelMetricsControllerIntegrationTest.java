package com.churn.app.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ModelMetricsControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getMetrics_returns200AndContainsModelVersionKpisAndConfusionMatrix() throws Exception {
        mockMvc.perform(get("/api/model/metrics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.model.version").exists())
                .andExpect(jsonPath("$.kpis.accuracy").exists())
                .andExpect(jsonPath("$.confusionMatrix.matrix").isArray())
                .andExpect(jsonPath("$.confusionMatrix.matrix.length()").value(2))
                .andExpect(jsonPath("$.rocCurve").isArray())
                .andExpect(jsonPath("$.featureImportance").isArray());
    }
}

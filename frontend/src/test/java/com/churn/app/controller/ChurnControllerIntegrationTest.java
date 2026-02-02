package com.churn.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ChurnControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static Map<String, Object> validRequest() {
        return Map.of(
                "age", 40,
                "tenure", 24,
                "monthlyCharges", 70.0,
                "contract", "Month-to-month",
                "internetService", "DSL",
                "paymentDelay", 5
        );
    }

    @Test
    void health_returnsOk() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"));
    }

    @Test
    void metadata_returnsContractAndInternetOptions() throws Exception {
        mockMvc.perform(get("/api/metadata"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contractOptions").isArray())
                .andExpect(jsonPath("$.contractOptions[0]").value("Month-to-month"))
                .andExpect(jsonPath("$.internetServiceOptions").isArray())
                .andExpect(jsonPath("$.internetServiceOptions[0]").value("DSL"));
    }

    @Test
    void predict_validRequest_returns200WithLabelAndScore() throws Exception {
        String body = objectMapper.writeValueAsString(validRequest());

        mockMvc.perform(post("/api/predict")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.label").exists())
                .andExpect(jsonPath("$.score").exists())
                .andExpect(jsonPath("$.label").isString());
    }

    @Test
    void predict_invalidRequest_negativeAge_returns400() throws Exception {
        Map<String, Object> invalid = Map.of(
                "age", -1,
                "tenure", 24,
                "monthlyCharges", 70.0,
                "contract", "Month-to-month",
                "internetService", "DSL",
                "paymentDelay", 5
        );
        String body = objectMapper.writeValueAsString(invalid);

        mockMvc.perform(post("/api/predict")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }
}

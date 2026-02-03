package com.churn.app.service;

import com.churn.app.dto.ExplanationItem;
import com.churn.app.dto.PredictRequest;
import com.churn.app.dto.PredictResponse;
import com.churn.app.exception.PredictionException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class ChurnScoringService {

    private static final Logger log = LoggerFactory.getLogger(ChurnScoringService.class);
    private static final int PREDICT_TIMEOUT_SEC = 30;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Path pythonWorkingDir;
    private final String pythonScript;

    public ChurnScoringService(
            @Value("${model.python-working-dir:.}") String pythonWorkingDir,
            @Value("${model.python-script:ml/model_store.py}") String pythonScript) {
        this.pythonWorkingDir = Path.of(pythonWorkingDir);
        this.pythonScript = pythonScript;
    }

    public PredictResponse predict(PredictRequest req) {
        String jsonRequest = buildRequestJson(req);
        ProcessBuilder pb = new ProcessBuilder("python", pythonScript)
                .directory(pythonWorkingDir.toFile())
                .redirectErrorStream(false);
        try {
            Process process = pb.start();
            process.getOutputStream().write(jsonRequest.getBytes(StandardCharsets.UTF_8));
            process.getOutputStream().close();
            String stdout = readFully(process.getInputStream(), StandardCharsets.UTF_8);
            String stderr = readFully(process.getErrorStream(), StandardCharsets.UTF_8);
            boolean finished = process.waitFor(PREDICT_TIMEOUT_SEC, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                throw new PredictionException("Prediction timed out.", 500);
            }
            if (process.exitValue() != 0) {
                String message = parsePythonError(stderr);
                throw new PredictionException(message, 400);
            }
            return parsePythonResponse(stdout);
        } catch (IOException e) {
            log.warn("Python predict failed: {}", e.getMessage());
            throw new PredictionException("Prediction failed: " + e.getMessage(), 500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new PredictionException("Prediction interrupted.", 500);
        }
    }

    private static String buildRequestJson(PredictRequest req) {
        try {
            ObjectMapper m = new ObjectMapper();
            return m.writeValueAsString(new RequestPayload(
                    req.getAge(),
                    req.getTenure(),
                    req.getMonthlyCharges(),
                    req.getContract(),
                    req.getInternetService(),
                    req.getPaymentDelay()));
        } catch (Exception e) {
            throw new PredictionException("Invalid request.", 400);
        }
    }

    private static String readFully(InputStream in, java.nio.charset.Charset cs) throws IOException {
        byte[] buf = in.readAllBytes();
        return new String(buf, cs);
    }

    private static String parsePythonError(String stderr) {
        if (stderr == null || stderr.isBlank()) return "Prediction failed (Python error).";
        try {
            JsonNode node = new ObjectMapper().readTree(stderr.trim());
            JsonNode err = node.get("error");
            if (err != null && err.isTextual()) return err.asText();
        } catch (Exception ignored) { }
        return stderr.length() > 200 ? stderr.substring(0, 200) + "..." : stderr;
    }

    private PredictResponse parsePythonResponse(String stdout) throws IOException {
        JsonNode node = objectMapper.readTree(stdout);
        String label = node.has("label") ? node.get("label").asText() : "NO_CHURN";
        double score = node.has("score") ? node.get("score").asDouble() : 0.0;
        String modelVersion = node.has("model_version") && !node.get("model_version").isNull()
                ? node.get("model_version").asText() : null;
        int votes = "CHURN".equals(label) ? 1 : 0;
        List<ExplanationItem> explanation = new ArrayList<>();
        return new PredictResponse(label, score, votes, explanation, modelVersion);
    }

    private static class RequestPayload {
        public final int age;
        public final int tenure;
        public final double monthlyCharges;
        public final String contract;
        public final String internetService;
        public final int paymentDelay;

        RequestPayload(int age, int tenure, double monthlyCharges, String contract, String internetService, int paymentDelay) {
            this.age = age;
            this.tenure = tenure;
            this.monthlyCharges = monthlyCharges;
            this.contract = contract;
            this.internetService = internetService;
            this.paymentDelay = paymentDelay;
        }
    }
}

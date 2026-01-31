package com.churn.app.service;

import com.churn.app.dto.ExplanationItem;
import com.churn.app.dto.PredictRequest;
import com.churn.app.dto.PredictResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ChurnScoringService {

    private static final double CHURN_THRESHOLD = 0.5;

    /**
     * Baseline rule-based scoring. TODO: plug in RandomForest model for production.
     */
    public PredictResponse predict(PredictRequest req) {
        double score = 0.0;
        List<ExplanationItem> explanation = new ArrayList<>();

        // paymentDelay: 0-60 maps to 0-0.5 (high delay alone can push to CHURN)
        double delayContrib = (req.getPaymentDelay() / 60.0) * 0.5;
        score += delayContrib;
        if (req.getPaymentDelay() > 0) {
            explanation.add(new ExplanationItem("paymentDelay",
                "Payment delay of " + req.getPaymentDelay() + " days contributes to churn risk."));
        }

        // Month-to-month contract adds 0.2
        if ("Month-to-month".equals(req.getContract())) {
            score += 0.2;
            explanation.add(new ExplanationItem("contract", "Month-to-month contract is associated with higher churn."));
        }

        // Fiber optic adds 0.1
        if ("Fiber optic".equals(req.getInternetService())) {
            score += 0.1;
            explanation.add(new ExplanationItem("internetService", "Fiber optic service shows slightly higher churn in baseline."));
        }

        // Low tenure: (1 - tenure/120) * 0.2, so high tenure reduces score
        double tenureContrib = (1.0 - req.getTenure() / 120.0) * 0.2;
        score += tenureContrib;
        if (req.getTenure() < 24) {
            explanation.add(new ExplanationItem("tenure", "Short tenure (" + req.getTenure() + " months) increases churn risk."));
        }

        // Clamp to [0, 1]
        score = Math.max(0.0, Math.min(1.0, score));

        String label = score >= CHURN_THRESHOLD ? "CHURN" : "NO_CHURN";
        // Placeholder for later RF: votes could be tree votes
        int votes = score >= CHURN_THRESHOLD ? 1 : 0;

        return new PredictResponse(label, score, votes, explanation);
    }
}

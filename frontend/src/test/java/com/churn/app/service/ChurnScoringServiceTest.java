package com.churn.app.service;

import com.churn.app.dto.PredictRequest;
import com.churn.app.dto.PredictResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ChurnScoringServiceTest {

    private ChurnScoringService service;

    @BeforeEach
    void setUp() {
        service = new ChurnScoringService();
    }

    @Test
    void highPaymentDelay_returnsChurn() {
        PredictRequest req = new PredictRequest();
        req.setAge(40);
        req.setTenure(60);
        req.setMonthlyCharges(70.0);
        req.setContract("Two year");
        req.setInternetService("DSL");
        req.setPaymentDelay(50);

        PredictResponse res = service.predict(req);

        assertEquals("CHURN", res.getLabel());
        assertTrue(res.getScore() >= 0.5);
        assertTrue(res.getScore() <= 1.0);
    }

    @Test
    void longTenureLowDelay_returnsNoChurn() {
        PredictRequest req = new PredictRequest();
        req.setAge(50);
        req.setTenure(100);
        req.setMonthlyCharges(50.0);
        req.setContract("Two year");
        req.setInternetService("DSL");
        req.setPaymentDelay(0);

        PredictResponse res = service.predict(req);

        assertEquals("NO_CHURN", res.getLabel());
        assertTrue(res.getScore() < 0.5);
    }

    @Test
    void monthToMonthAndFiber_returnsChurn() {
        PredictRequest req = new PredictRequest();
        req.setAge(30);
        req.setTenure(12);
        req.setMonthlyCharges(80.0);
        req.setContract("Month-to-month");
        req.setInternetService("Fiber optic");
        req.setPaymentDelay(20);

        PredictResponse res = service.predict(req);

        assertEquals("CHURN", res.getLabel());
        assertTrue(res.getScore() >= 0.5);
        assertFalse(res.getExplanation().isEmpty());
    }

    @Test
    void boundaryScore_exactlyHalf_returnsChurn() {
        PredictRequest req = new PredictRequest();
        req.setAge(35);
        req.setTenure(0);
        req.setMonthlyCharges(60.0);
        req.setContract("Month-to-month");
        req.setInternetService("Fiber optic");
        req.setPaymentDelay(50);

        PredictResponse res = service.predict(req);

        assertTrue(res.getScore() >= 0.5);
        assertEquals("CHURN", res.getLabel());
    }
}

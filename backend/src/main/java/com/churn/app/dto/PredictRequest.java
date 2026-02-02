package com.churn.app.dto;

import jakarta.validation.constraints.*;

public class PredictRequest {

    @NotNull(message = "age is required")
    @Min(value = 0, message = "age must be >= 0")
    @Max(value = 120, message = "age must be <= 120")
    private Integer age;

    @NotNull(message = "tenure is required")
    @Min(value = 0, message = "tenure must be >= 0")
    @Max(value = 120, message = "tenure must be <= 120")
    private Integer tenure;

    @NotNull(message = "monthlyCharges is required")
    @DecimalMin(value = "0", message = "monthlyCharges must be >= 0")
    @DecimalMax(value = "1000", message = "monthlyCharges must be <= 1000")
    private Double monthlyCharges;

    @NotNull(message = "contract is required")
    @Pattern(regexp = "^(Month-to-month|One year|Two year)$", message = "contract must be one of: Month-to-month, One year, Two year")
    private String contract;

    @NotNull(message = "internetService is required")
    @Pattern(regexp = "^(DSL|Fiber optic|None)$", message = "internetService must be one of: DSL, Fiber optic, None")
    private String internetService;

    @NotNull(message = "paymentDelay is required")
    @Min(value = 0, message = "paymentDelay must be >= 0")
    @Max(value = 60, message = "paymentDelay must be <= 60")
    private Integer paymentDelay;

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public Integer getTenure() {
        return tenure;
    }

    public void setTenure(Integer tenure) {
        this.tenure = tenure;
    }

    public Double getMonthlyCharges() {
        return monthlyCharges;
    }

    public void setMonthlyCharges(Double monthlyCharges) {
        this.monthlyCharges = monthlyCharges;
    }

    public String getContract() {
        return contract;
    }

    public void setContract(String contract) {
        this.contract = contract;
    }

    public String getInternetService() {
        return internetService;
    }

    public void setInternetService(String internetService) {
        this.internetService = internetService;
    }

    public Integer getPaymentDelay() {
        return paymentDelay;
    }

    public void setPaymentDelay(Integer paymentDelay) {
        this.paymentDelay = paymentDelay;
    }
}

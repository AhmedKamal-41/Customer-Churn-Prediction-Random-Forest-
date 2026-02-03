package com.churn.app.dto;

public class Kpis {

    private double accuracy;
    private double f1;
    private double rocAuc;
    private double churnRate;
    private int samples;

    public Kpis() {
    }

    public Kpis(double accuracy, double f1, double rocAuc, double churnRate, int samples) {
        this.accuracy = accuracy;
        this.f1 = f1;
        this.rocAuc = rocAuc;
        this.churnRate = churnRate;
        this.samples = samples;
    }

    public double getAccuracy() {
        return accuracy;
    }

    public void setAccuracy(double accuracy) {
        this.accuracy = accuracy;
    }

    public double getF1() {
        return f1;
    }

    public void setF1(double f1) {
        this.f1 = f1;
    }

    public double getRocAuc() {
        return rocAuc;
    }

    public void setRocAuc(double rocAuc) {
        this.rocAuc = rocAuc;
    }

    public double getChurnRate() {
        return churnRate;
    }

    public void setChurnRate(double churnRate) {
        this.churnRate = churnRate;
    }

    public int getSamples() {
        return samples;
    }

    public void setSamples(int samples) {
        this.samples = samples;
    }
}

/**
 * MSW handlers for E2E tests (VITE_E2E=true). Deterministic responses, no real API/LLM.
 */
import { http, HttpResponse } from 'msw'

const defaultPredictResponse = {
  label: 'NO_CHURN',
  score: 0.5,
  votes: 1,
  explanation: [{ feature: 'Mock', reason: 'Mock response for E2E' }],
  modelVersion: 'e2e-mock',
}

const minimalMetricsResponse = {
  model: {
    name: 'RandomForestChurn',
    version: 'e2e-mock',
    lastTrainedAt: '2024-01-01T00:00:00Z',
    lastEvaluatedAt: '2024-01-01T00:00:00Z',
    dataset: 'e2e',
    notes: 'E2E mock',
  },
  kpis: {
    accuracy: 0.85,
    f1: 0.84,
    rocAuc: 0.88,
    churnRate: 0.3,
    samples: 100,
  },
  confusionMatrix: {
    labels: ['NO_CHURN', 'CHURN'],
    matrix: [[50, 10], [5, 35]],
  },
  rocCurve: [{ fpr: 0, tpr: 0 }, { fpr: 1, tpr: 1 }],
  featureImportance: [
    { feature: 'tenure', importance: 0.3 },
    { feature: 'monthlyCharges', importance: 0.25 },
  ],
}

const metadataResponse = {
  contractOptions: ['Month-to-month', 'One year', 'Two year'],
  internetServiceOptions: ['DSL', 'Fiber optic', 'None'],
}

export const handlers = [
  http.get('/api/health', () => HttpResponse.json({ ok: true })),

  http.post('/api/predict', async ({ request }) => {
    let body = {}
    try {
      body = await request.json()
    } catch (_) {}
    return HttpResponse.json({
      ...defaultPredictResponse,
      explanation: [
        { feature: 'Mock', reason: `Mock response for E2E: ${JSON.stringify(body).slice(0, 80)}` },
      ],
    })
  }),

  http.get('/api/model/metrics', () => HttpResponse.json(minimalMetricsResponse)),

  http.get('/api/metadata', () => HttpResponse.json(metadataResponse)),
]

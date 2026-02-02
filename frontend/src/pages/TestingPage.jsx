import Card from '../ui/Card'

export default function TestingPage() {
  return (
    <div className="max-w-2xl w-full">
      <Card title="Testing">
        <p className="text-text text-sm mb-4">
          The project uses JUnit 5 for backend tests and Playwright for end-to-end tests.
        </p>
        <ul className="list-disc list-inside text-sm text-muted space-y-2">
          <li><strong className="text-text">Backend:</strong> <code className="bg-card px-1.5 py-0.5 rounded text-text border border-border">mvn test</code> runs unit and integration tests.</li>
          <li><strong className="text-text">E2E:</strong> Start backend and frontend, then run <code className="bg-card px-1.5 py-0.5 rounded text-text border border-border">npm run e2e</code> in the e2e folder. Playwright drives the chatbot flow in the browser.</li>
        </ul>
      </Card>
    </div>
  )
}

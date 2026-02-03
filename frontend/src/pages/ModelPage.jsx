import Card from '../ui/Card'

export default function ModelPage() {
  return (
    <div className="max-w-2xl w-full">
      <Card title="Model">
        <p className="text-text text-sm mb-4">
          The prediction uses a baseline rule-based score (0–1). A score of 0.5 or higher is classified as CHURN.
        </p>
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="font-medium text-text mb-2 text-sm">Score factors</h3>
          <ul className="list-disc list-inside text-sm text-muted space-y-1">
            <li>Payment delay (higher delay increases score)</li>
            <li>Contract type (month-to-month adds risk)</li>
            <li>Internet service (e.g. fiber optic)</li>
            <li>Tenure (shorter tenure adds risk)</li>
          </ul>
          <p className="text-sm text-muted mt-2">
            A RandomForest model can be plugged in later for production.
          </p>
        </div>
      </Card>
    </div>
  )
}

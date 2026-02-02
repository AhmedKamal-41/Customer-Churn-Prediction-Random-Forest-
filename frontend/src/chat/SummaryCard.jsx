import { STEPS, isComplete } from './chatFlow'
import Card from '../ui/Card'
import Button from '../ui/Button'

function getLabel(stepKey) {
  return stepKey.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim()
}

export default function SummaryCard({ answers, onEdit, onConfirm, onReset, disabledConfirm, disabledReason }) {
  const entries = STEPS.map((key) => ({
    key,
    label: getLabel(key),
    value: answers[key],
  }))
  const complete = isComplete(answers)
  const confirmDisabled = !complete || disabledConfirm

  return (
    <Card title="Summary" className="max-w-md">
      <dl className="space-y-2 text-sm mb-4">
        {entries.map(({ key, label, value }) => (
          <div key={key} className="flex justify-between items-center gap-2">
            <dt className="text-muted">{label}</dt>
            <dd className="font-medium text-text flex items-center gap-2">
              <span className={value != null && value !== '' ? 'text-text' : 'text-muted'}>
                {value != null && value !== '' ? String(value) : 'Not set'}
              </span>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onEdit?.(key)}
                aria-label={`Edit ${label}`}
                className="!px-2 !py-1 text-xs"
              >
                Edit
              </Button>
            </dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="primary"
          onClick={onConfirm}
          disabled={confirmDisabled}
          aria-label={disabledReason || 'Confirm and get prediction'}
          title={disabledReason}
        >
          Confirm & Predict
        </Button>
        <Button variant="secondary" onClick={onReset} aria-label="Reset answers">
          Reset answers
        </Button>
      </div>
    </Card>
  )
}

import { STEPS } from './chatFlow'
import Card from '../ui/Card'

export default function ProfilePanel({ answers }) {
  const entries = STEPS.filter((key) => answers[key] !== undefined && answers[key] !== '').map((key) => ({
    key,
    label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
    value: answers[key],
  }))

  return (
    <Card title="Customer Profile">
      {entries.length === 0 ? (
        <p className="text-sm text-muted">Answer questions in the chat to see your profile here.</p>
      ) : (
        <dl className="space-y-2 text-sm">
          {entries.map(({ key, label, value }) => (
            <div key={key}>
              <dt className="text-muted">{label}</dt>
              <dd className="font-medium text-text">{String(value)}</dd>
            </div>
          ))}
        </dl>
      )}
    </Card>
  )
}

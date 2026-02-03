import Card from '../ui/Card'
import Button from '../ui/Button'

function getPriorityClass(priority) {
  if (priority === 'High') return 'bg-red-500/20 text-red-400 border-red-500/30'
  if (priority === 'Medium') return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  return 'bg-card/80 text-muted border border-border'
}

export default function ActionPlanCard({ plan, onCopy, onExportJson, isChurn, copyFeedback }) {
  const { actions = [], summaryText } = plan

  return (
    <Card title="Retention Action Plan">
      <p className="text-xs text-muted mb-3 -mt-1">{summaryText}</p>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button variant="ghost" type="button" onClick={onCopy} className="text-xs py-2">
          Copy plan
        </Button>
        {copyFeedback && (
          <span className="text-xs text-emerald-400 font-medium" role="status">
            Copied!
          </span>
        )}
        <Button variant="ghost" type="button" onClick={onExportJson} className="text-xs py-2">
          Export JSON
        </Button>
      </div>
      <div className="space-y-3">
        {actions.map((action) => (
          <div
            key={action.id}
            className="rounded-xl border border-border bg-card/50 p-3 flex gap-3 items-start"
          >
            <span
              className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityClass(action.priority)}`}
            >
              {action.priority}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-text">{action.title}</p>
              <p className="text-xs text-muted mt-0.5">{action.rationale}</p>
            </div>
            <span className="flex-shrink-0 text-xs font-medium text-muted border border-border rounded-full px-2 py-0.5">
              {action.impact}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}

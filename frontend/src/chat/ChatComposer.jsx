import { useState } from 'react'
import { STEPS, STEP_CONFIG } from './chatFlow'
import OptionChips from './OptionChips'
import Input from '../ui/Input'
import Button from '../ui/Button'

export default function ChatComposer({ currentStepIndex, onSubmit, disabled }) {
  const stepKey = currentStepIndex >= 0 && currentStepIndex < STEPS.length ? STEPS[currentStepIndex] : null
  const config = stepKey ? STEP_CONFIG[stepKey] : null
  const [inputValue, setInputValue] = useState('')

  if (!config || disabled) return null

  const handleSubmit = (e) => {
    e?.preventDefault()
    if (config.type === 'number') {
      onSubmit(stepKey, inputValue)
      setInputValue('')
    }
  }

  if (config.type === 'enum') {
    return (
      <div className="p-4 border-t border-border bg-card/30 rounded-b-2xl">
        <p className="text-sm text-muted mb-2">{config.label}</p>
        <OptionChips options={config.options} onSelect={(val) => onSubmit(stepKey, val)} disabled={disabled} />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-card/30 rounded-b-2xl">
      <label htmlFor="chat-input" className="sr-only">
        {config.label}
      </label>
      <div className="flex gap-3">
        <Input
          id="chat-input"
          type={config.type === 'number' ? 'number' : 'text'}
          min={config.min}
          max={config.max}
          step={stepKey === 'monthlyCharges' ? 0.01 : 1}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={config.label}
          disabled={disabled}
          className="flex-1"
          aria-label={config.label}
          data-testid="chat-input"
        />
        <Button type="submit" variant="primary" disabled={disabled || (config.type === 'number' && inputValue === '')} aria-label="Send" data-testid="send-button">
          Send
        </Button>
      </div>
    </form>
  )
}

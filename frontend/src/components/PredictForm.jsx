import { useState } from 'react'
import { predict } from '../api/client'

const CONTRACTS = ['Month-to-month', 'One year', 'Two year']
const INTERNET = ['DSL', 'Fiber optic', 'None']

function validate(form) {
  const err = {}
  if (form.age === '' || form.age == null) err.age = 'Required'
  else {
    const a = Number(form.age)
    if (Number.isNaN(a) || a < 0 || a > 120) err.age = 'Must be 0–120'
  }
  if (form.tenure === '' || form.tenure == null) err.tenure = 'Required'
  else {
    const t = Number(form.tenure)
    if (Number.isNaN(t) || t < 0 || t > 120) err.tenure = 'Must be 0–120'
  }
  if (form.monthlyCharges === '' || form.monthlyCharges == null) err.monthlyCharges = 'Required'
  else {
    const m = Number(form.monthlyCharges)
    if (Number.isNaN(m) || m < 0 || m > 1000) err.monthlyCharges = 'Must be 0–1000'
  }
  if (!form.contract) err.contract = 'Required'
  if (!form.internetService) err.internetService = 'Required'
  if (form.paymentDelay === '' || form.paymentDelay == null) err.paymentDelay = 'Required'
  else {
    const p = Number(form.paymentDelay)
    if (Number.isNaN(p) || p < 0 || p > 60) err.paymentDelay = 'Must be 0–60'
  }
  return err
}

export function PredictForm({ onResult }) {
  const [form, setForm] = useState({
    age: '',
    tenure: '',
    monthlyCharges: '',
    contract: '',
    internetService: '',
    paymentDelay: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrorMessage(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate(form)
    setErrors(err)
    if (Object.keys(err).length > 0) return

    setLoading(true)
    setErrorMessage(null)
    const body = {
      age: Number(form.age),
      tenure: Number(form.tenure),
      monthlyCharges: Number(form.monthlyCharges),
      contract: form.contract,
      internetService: form.internetService,
      paymentDelay: Number(form.paymentDelay),
    }
    try {
      const result = await predict(body)
      onResult(result)
    } catch (err) {
      setErrorMessage(err.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="predict-form" onSubmit={handleSubmit}>
      <h2>Churn Prediction</h2>
      <div className="field">
        <label>Age</label>
        <input type="number" name="age" value={form.age} onChange={handleChange} min={0} max={120} />
        {errors.age && <span className="error">{errors.age}</span>}
      </div>
      <div className="field">
        <label>Tenure (months)</label>
        <input type="number" name="tenure" value={form.tenure} onChange={handleChange} min={0} max={120} />
        {errors.tenure && <span className="error">{errors.tenure}</span>}
      </div>
      <div className="field">
        <label>Monthly charges</label>
        <input type="number" name="monthlyCharges" value={form.monthlyCharges} onChange={handleChange} min={0} max={1000} step="0.01" />
        {errors.monthlyCharges && <span className="error">{errors.monthlyCharges}</span>}
      </div>
      <div className="field">
        <label>Contract</label>
        <select name="contract" value={form.contract} onChange={handleChange}>
          <option value="">Select</option>
          {CONTRACTS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {errors.contract && <span className="error">{errors.contract}</span>}
      </div>
      <div className="field">
        <label>Internet service</label>
        <select name="internetService" value={form.internetService} onChange={handleChange}>
          <option value="">Select</option>
          {INTERNET.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
        {errors.internetService && <span className="error">{errors.internetService}</span>}
      </div>
      <div className="field">
        <label>Payment delay (days)</label>
        <input type="number" name="paymentDelay" value={form.paymentDelay} onChange={handleChange} min={0} max={60} />
        {errors.paymentDelay && <span className="error">{errors.paymentDelay}</span>}
      </div>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <button type="submit" disabled={loading}>{loading ? 'Predicting…' : 'Predict'}</button>
    </form>
  )
}

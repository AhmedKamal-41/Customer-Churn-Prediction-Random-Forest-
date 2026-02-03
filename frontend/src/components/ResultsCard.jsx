export function ResultsCard({ result }) {
  if (!result) return null
  const { label, score, explanation = [] } = result
  return (
    <div className="results-card">
      <h3>Prediction</h3>
      <p className="label">{label}</p>
      <p className="score">Score: {(score * 100).toFixed(1)}%</p>
      {explanation.length > 0 && (
        <ul className="explanation">
          {explanation.map((item, i) => (
            <li key={i}><strong>{item.feature}</strong>: {item.reason}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

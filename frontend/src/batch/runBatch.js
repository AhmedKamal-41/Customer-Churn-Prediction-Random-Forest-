/**
 * Run batch predictions with a concurrency limit. Supports cancel via AbortSignal.
 * @param {{ rows: Array<{ rowIndex: number, body: object }>, concurrency?: number, onProgress?: (state: { processed: number, total: number }) => void, onResult?: (rowIndex: number, result: object) => void, onError?: (rowIndex: number, err: Error) => void, onDone?: () => void, signal?: AbortSignal }} opts
 * @param {Function} predictFn - Function that takes body and returns Promise<result> (e.g. predict from churnApi)
 * @returns {Promise<void>}
 */
export function runBatch(opts, predictFn) {
  const {
    rows,
    concurrency = 3,
    onProgress,
    onResult,
    onError,
    onDone,
    signal,
  } = opts

  const total = rows.length
  let processed = 0
  let nextIndex = 0
  let inFlight = 0

  function reportProgress() {
    if (onProgress) onProgress({ processed, total })
  }

  function runOne() {
    if (signal?.aborted || nextIndex >= rows.length) return
    const i = nextIndex++
    const { rowIndex, body } = rows[i]
    inFlight++
    predictFn(body)
      .then((result) => {
        if (onResult) onResult(rowIndex, result)
        processed++
        reportProgress()
      })
      .catch((err) => {
        if (onError) onError(rowIndex, err)
        processed++
        reportProgress()
      })
      .finally(() => {
        inFlight--
        if (!signal?.aborted && nextIndex < rows.length) runOne()
        if (inFlight === 0 && onDone) onDone()
      })
  }

  for (let k = 0; k < Math.min(concurrency, rows.length); k++) {
    if (signal?.aborted) break
    runOne()
  }

  if (rows.length === 0 && onDone) onDone()
}

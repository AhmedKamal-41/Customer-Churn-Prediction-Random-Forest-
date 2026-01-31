import { useRef, useCallback, useEffect } from 'react'

/**
 * Returns a stable debounced function. Invocations are delayed by `delay` ms;
 * each new invocation resets the timer. The latest args are used when the callback runs.
 * @param {Function} fn - Callback to run after delay
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} debounced function
 */
export function useDebouncedCallback(fn, delay) {
  const fnRef = useRef(fn)
  const timeoutRef = useRef(null)
  const argsRef = useRef(null)
  fnRef.current = fn

  const flush = useCallback(() => {
    if (timeoutRef.current != null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (argsRef.current != null) {
      fnRef.current(...argsRef.current)
      argsRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const debounced = useCallback(
    (...args) => {
      argsRef.current = args
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(flush, delay)
    },
    [delay, flush]
  )
  return debounced
}

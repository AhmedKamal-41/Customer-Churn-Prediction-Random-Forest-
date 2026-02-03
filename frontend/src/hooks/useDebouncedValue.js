import { useState, useEffect, useRef } from 'react'

/**
 * Returns a value that updates to `value` only after `value` has been stable for `delay` ms.
 * @param {*} value - Any value (object reference change triggers debounce)
 * @param {number} delay - Delay in milliseconds
 * @returns {*} debouncedValue
 */
export function useDebouncedValue(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  const ref = useRef(value)
  ref.current = value

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedValue(ref.current)
    }, delay)
    return () => clearTimeout(t)
  }, [value, delay])

  return debouncedValue
}

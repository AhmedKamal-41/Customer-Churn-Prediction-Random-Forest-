/**
 * Parse a CSV string into headers and row objects.
 * Supports quoted fields (double-quote; "" = escaped quote). Trims headers and skips empty lines.
 * @param {string} text - Raw CSV text
 * @returns {{ headers: string[], rows: object[] }}
 */
export function parseCsv(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.length > 0)
  if (lines.length === 0) return { headers: [], rows: [] }

  const headers = parseRow(lines[0])
  if (headers.length === 0) return { headers: [], rows: [] }

  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i])
    const obj = {}
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = values[j] !== undefined ? String(values[j]).trim() : ''
    }
    rows.push(obj)
  }
  return { headers, rows }
}

/**
 * Parse a single CSV row, handling quoted fields.
 * @param {string} line
 * @returns {string[]}
 */
function parseRow(line) {
  const out = []
  let i = 0
  while (i < line.length) {
    if (line[i] === '"') {
      let value = ''
      i++
      while (i < line.length) {
        if (line[i] === '"') {
          if (line[i + 1] === '"') {
            value += '"'
            i += 2
          } else {
            i++
            break
          }
        } else {
          value += line[i]
          i++
        }
      }
      out.push(value)
      while (i < line.length && line[i] === ' ') i++
      if (line[i] === ',') i++
    } else {
      let value = ''
      while (i < line.length && line[i] !== ',') {
        value += line[i]
        i++
      }
      out.push(value.trim())
      if (line[i] === ',') i++
    }
  }
  return out
}

import { useRef, useState } from 'react'
import './NewsletterSearch.css'

const EXAMPLE_QUERIES = [
  'Vad säger forskningen om att bilda sparvanor?',
  'Hur påverkar AI vårt beteende?',
  'Vad är EAST-ramverket?',
]

const formatDate = (iso) => {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('sv-SE', { year: 'numeric', month: 'short' })
  } catch {
    return ''
  }
}

export default function NewsletterSearch() {
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState('')
  const [sources, setSources] = useState([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const runQuery = async (q) => {
    const trimmed = q.trim()
    if (trimmed.length < 3 || isStreaming) return

    setQuery(trimmed)
    setAnswer('')
    setSources([])
    setError(null)
    setIsStreaming(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody.error || `Request failed (${res.status})`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.trim()) continue
          let event
          try {
            event = JSON.parse(line)
          } catch {
            continue
          }
          if (event.type === 'delta') {
            setAnswer((prev) => prev + event.text)
          } else if (event.type === 'sources') {
            setSources(event.sources || [])
          } else if (event.type === 'error') {
            setError(event.message)
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Något gick fel. Försök igen.')
      }
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    runQuery(query)
  }

  return (
    <section className="section section-search">
      <div className="section-content">
        <h2 className="section-label">Sök smart i nyhetsbrevet</h2>
        <p className="section-intro">
          Ställ en fråga — få ett svar byggt på 291 tidigare utgåvor.
        </p>

        <form className="search-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="search-input"
            placeholder="Fråga något från arkivet…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isStreaming}
            maxLength={500}
            aria-label="Fråga"
          />
          <button
            type="submit"
            className="search-btn"
            disabled={isStreaming || query.trim().length < 3}
          >
            {isStreaming ? 'Söker…' : 'Sök'}
          </button>
        </form>

        {!answer && !isStreaming && !error && (
          <div className="search-examples">
            <span className="search-examples-label">Prova:</span>
            {EXAMPLE_QUERIES.map((q) => (
              <button
                key={q}
                type="button"
                className="search-example"
                onClick={() => runQuery(q)}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="search-error">
            <strong>Något gick fel:</strong> {error}
          </div>
        )}

        {(answer || isStreaming) && !error && (
          <div className="search-result">
            <div className="search-answer">
              {answer.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
              {isStreaming && <span className="search-cursor" />}
            </div>

            {sources.length > 0 && (
              <div className="search-sources">
                <span className="search-sources-label">Läs mer:</span>
                <div className="search-sources-list">
                  {sources.map((s) => (
                    <a
                      key={s.post_id}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="search-source-chip"
                    >
                      <span className="search-source-nr">
                        #{s.newsletter_number || '?'}
                      </span>
                      <span className="search-source-title">
                        {s.subtitle || s.title}
                      </span>
                      <span className="search-source-date">{formatDate(s.post_date)}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

import { useState } from 'react'
import type { FormEvent } from 'react'
import { sendNovaQuery, USE_MOCK } from '../services/api'
import type { DashboardFilters } from '../types/nfl'
import { Badge } from './ui'

interface Message {
  role: 'user' | 'nova'
  text: string
}

const SUGGESTIONS = [
  '¿Cómo afecta la presión al rendimiento del QB?',
  '¿Qué cobertura comete más interferencias?',
  '¿Qué perfil físico tiene el mejor pass rusher?',
]

export default function CopilotPanel({
  filters,
  context,
  onClose,
}: {
  filters: DashboardFilters
  context: 'ofensiva' | 'defensiva' | 'cruces'
  onClose: () => void
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)

  async function ask(question: string) {
    const q = question.trim()
    if (!q || busy) return
    setMessages((m) => [...m, { role: 'user', text: q }])
    setInput('')
    setBusy(true)
    try {
      const res = await sendNovaQuery({ question: q, filters, context })
      setMessages((m) => [...m, { role: 'nova', text: res.answer }])
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'nova', text: 'El Copiloto no está disponible ahora. El análisis del dashboard sigue funcionando.' },
      ])
    } finally {
      setBusy(false)
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    void ask(input)
  }

  return (
    <aside className="fixed bottom-0 right-0 top-16 z-20 flex w-full max-w-sm flex-col border-l border-unam-blue bg-legacy-blue shadow-2xl">
      <div className="flex items-center justify-between border-b border-nfl-blue px-4 py-3">
        <div>
          <h2 className="font-display text-lg font-bold uppercase tracking-wide text-unam-gold">Copiloto Amazon Nova</h2>
          <p className="text-[10px] text-[var(--muted)]">Contexto: {context}</p>
        </div>
        <div className="flex items-center gap-2">
          {USE_MOCK && <Badge>Simulado</Badge>}
          <button onClick={onClose} aria-label="Cerrar copiloto" className="text-xl leading-none text-[var(--muted)] hover:text-nfl-white">
            ×
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-[var(--muted)]">Pregunta sobre lo que ves en pantalla. Sugerencias:</p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => void ask(s)}
                className="block w-full rounded border border-nfl-blue px-3 py-2 text-left text-xs hover:border-unam-gold hover:text-unam-gold"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded-lg px-3 py-2 ${
              m.role === 'user' ? 'ml-8 bg-unam-blue text-nfl-white' : 'mr-8 border border-nfl-blue bg-gridiron-black/50'
            }`}
          >
            {m.text}
          </div>
        ))}
        {busy && <p className="animate-pulse text-xs text-[var(--muted)]">Nova está pensando…</p>}
      </div>

      <form onSubmit={onSubmit} className="flex gap-2 border-t border-nfl-blue p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu pregunta…"
          className="min-w-0 flex-1 rounded border border-nfl-blue bg-gridiron-black px-3 py-2 text-sm placeholder:text-[var(--muted)] focus:border-unam-gold focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded bg-unam-gold px-3 py-2 text-xs font-bold uppercase text-gridiron-black disabled:opacity-40"
        >
          Enviar
        </button>
      </form>
    </aside>
  )
}

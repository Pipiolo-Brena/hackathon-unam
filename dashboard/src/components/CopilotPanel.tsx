import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { describeError, sendNovaQuery, USE_MOCK } from '../services/api'
import type { ChatResponse } from '../types/nfl'
import { Badge } from './ui'
import { Football, Goalpost } from './NflMotifs'

interface Message {
  role: 'user' | 'nova'
  text: string
  response?: ChatResponse
  error?: boolean
}

const SUGGESTIONS = [
  '¿Cómo atacar la presión contra Cover-1?',
  '¿Qué receptores se separan más sobre lo esperado?',
  '¿Qué es la Trampa de Presión y cuándo aparece?',
]

export default function CopilotPanel({
  onClose,
  onOpenPlay,
}: {
  onClose: () => void
  onOpenPlay: (gameId: number, playId: number) => void
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, busy])

  async function ask(question: string) {
    const q = question.trim()
    if (!q || busy) return
    setMessages((m) => [...m, { role: 'user', text: q }])
    setInput('')
    setBusy(true)
    try {
      // El backend acepta audiencia coach|broadcast; ambos modos de la UI son para el cuerpo técnico
      const res = await sendNovaQuery({ message: q, mode: 'coach' })
      setMessages((m) => [...m, { role: 'nova', text: res.reply, response: res }])
    } catch (e) {
      const { title, detail } = describeError(e)
      setMessages((m) => [...m, { role: 'nova', text: `${title}. ${detail} El resto del dashboard sigue funcionando.`, error: true }])
    } finally {
      setBusy(false)
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    void ask(input)
  }

  return (
    <aside className="fixed bottom-0 right-0 top-16 z-30 flex w-full max-w-[400px] animate-slide-in-right flex-col border-l border-field-line bg-nfl-white shadow-2xl">
      <div className="flex items-center justify-between bg-gradient-to-r from-nfl-blue to-unam-blue px-4 py-3 text-nfl-white">
        <div className="flex items-center gap-2">
          <Goalpost size={24} />
          <div>
            <h2 className="font-display text-lg font-bold uppercase leading-none tracking-wide">Copiloto Amazon Nova</h2>
            <p className="text-[10px] text-nfl-white/70">POST api/chat · Strands + Bedrock</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {USE_MOCK && <Badge>Local</Badge>}
          <button onClick={onClose} aria-label="Cerrar copiloto" className="rounded p-1 text-xl leading-none text-nfl-white/80 hover:bg-nfl-white/10 hover:text-nfl-white">
            ×
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-field-mist p-4 text-sm">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-ink-muted">Pregunta por tácticas, coberturas o jugadores. Sugerencias:</p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => void ask(s)}
                className="block w-full rounded-lg border border-field-line bg-nfl-white px-3 py-2 text-left text-sm text-legacy-blue transition-all duration-300 hover:-translate-y-0.5 hover:border-unam-gold hover:shadow-card"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) =>
          m.role === 'user' ? (
            <div key={i} className="ml-10 animate-fade-up rounded-xl rounded-br-sm bg-nfl-blue px-3 py-2 text-nfl-white">
              {m.text}
            </div>
          ) : (
            <div
              key={i}
              className={`mr-6 animate-fade-up rounded-xl rounded-bl-sm border bg-nfl-white px-3 py-2 text-legacy-blue shadow-card ${
                m.error ? 'border-unity-red/40' : 'border-field-line'
              }`}
            >
              {m.response && (
                <div className="mb-1.5 flex flex-wrap items-center gap-1">
                  {m.response.source === 'bedrock' ? (
                    <Badge tone="blue">Amazon Nova{m.response.model ? ` · ${m.response.model}` : ''}</Badge>
                  ) : (
                    <span title={m.response.fallback_reason}>
                      <Badge tone="neutral">Respaldo local</Badge>
                    </span>
                  )}
                  {m.response.tools_used?.map((t) => (
                    <Badge key={t} tone="neutral">
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
              <p className="whitespace-pre-line leading-snug">{m.text}</p>
              {m.response?.recommended_play && (
                <div className="mt-2 rounded-lg border border-unam-gold/60 bg-[#FBF3DD] p-2 text-xs">
                  <p className="font-semibold text-legacy-blue">Jugada recomendada</p>
                  <p className="mt-0.5 text-ink-muted">{m.response.recommended_play.reason}</p>
                  <button
                    onClick={() => onOpenPlay(m.response!.recommended_play!.gameId, m.response!.recommended_play!.playId)}
                    className="mt-1.5 rounded-md bg-unam-blue px-2.5 py-1 font-semibold text-nfl-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-nfl-blue"
                  >
                    Ver en el reconstructor 2D →
                  </button>
                </div>
              )}
            </div>
          ),
        )}
        {busy && (
          <div className="flex items-center gap-2 text-xs text-ink-muted" role="status">
            <Football size={18} spinning /> Nova está analizando…
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={onSubmit} className="flex gap-2 border-t border-field-line bg-nfl-white p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={2000}
          placeholder="Escribe tu pregunta…"
          aria-label="Pregunta para el copiloto"
          className="min-w-0 flex-1 rounded-lg border border-field-line px-3 py-2 text-sm text-legacy-blue placeholder:text-ink-muted focus:border-unam-gold focus:outline-none focus:ring-2 focus:ring-unam-gold/30"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-lg bg-unam-gold px-4 py-2 text-xs font-bold uppercase text-legacy-blue transition-all duration-300 hover:bg-unam-gold-bright disabled:opacity-40"
        >
          Enviar
        </button>
      </form>
    </aside>
  )
}

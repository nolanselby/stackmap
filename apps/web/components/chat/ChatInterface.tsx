"use client"
import { useChat } from "ai/react"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ChatMessage } from "./ChatMessage"
import { ChatInput } from "./ChatInput"

const INITIAL_MESSAGE =
  "Tell me what you want to build. Describe your idea in a sentence or two and I will ask a few questions, then generate your full tool stack and roadmap."

export function ChatInterface() {
  const router = useRouter()
  const bottomRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const hasTriggeredRef = useRef(false)
  const [generationError, setGenerationError] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { messages, append, isLoading, error } = useChat({
    api: "/api/chat",
    initialMessages: [
      { id: "init", role: "assistant", content: INITIAL_MESSAGE },
    ],
  })

  // Detect submit_inputs tool call in messages
  useEffect(() => {
    if (hasTriggeredRef.current) return

    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant")
    if (!lastAssistant) return

    const toolInvocations = (lastAssistant as {
      toolInvocations?: Array<{ toolName: string; args: Record<string, unknown>; state: string }>
    }).toolInvocations
    if (!toolInvocations) return

    // We look for 'result' (if handled) or 'call' (if streaming/finished but no result yet)
    const submitCall = toolInvocations.find(
      (t) => t.toolName === "submit_inputs" && (t.state === "result" || t.state === "call")
    )

    if (!submitCall) return

    // Only trigger if we have the critical 'idea' argument (heuristic for 'ready')
    const args = submitCall.args
    if (!args.idea) return

    hasTriggeredRef.current = true
    setServerError(null)

    fetch("/api/roadmap/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idea: args.idea,
        customer: args.customer,
        budget_monthly: args.budget_monthly,
        tech_level: args.tech_level,
        preference: args.preference,
      }),
    })
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}))
          throw new Error(body.error || `HTTP ${r.status}`)
        }
        return r.json()
      })
      .then(({ short_id }) => {
        if (short_id) {
          setTimeout(() => router.push(`/r/${short_id}`), 800)
        } else {
          setGenerationError(true)
        }
      })
      .catch((err) => {
        console.error("Roadmap generation error:", err)
        setGenerationError(true)
        setServerError(err.message)
        hasTriggeredRef.current = false // allow retry
      })
  }, [messages, router])

  // Scroll to bottom within the messages container on new messages
  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }, [messages])

  function handleSubmit(text: string) {
    append({ role: "user", content: text })
  }

  const isGenerating = hasTriggeredRef.current && !generationError
  const isComplete = isGenerating

  return (
    <div className="flex flex-col" style={{ minHeight: "420px", maxHeight: "580px" }}>

      {/* Header */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-5 pt-4 pb-3.5"
        style={{ borderBottom: "1px solid rgb(var(--line))" }}
      >
        <div>
          <h2 className="font-semibold text-[15px]" style={{ color: "rgb(var(--ink))" }}>
            Build your roadmap
          </h2>
          <p className="text-[12px] mt-0.5" style={{ color: "rgb(var(--muted))" }}>
            Answer a few questions and we'll handle the rest.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {isComplete ? (
            <>
              <span
                className="w-2 h-2 rounded-full inline-block animate-pulse-ring"
                style={{ background: "rgb(var(--accent))" }}
              />
              <span className="text-[12px] font-medium" style={{ color: "rgb(var(--accent))" }}>
                Generating
              </span>
            </>
          ) : (
            <>
              <span className="relative flex w-2 h-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                  style={{ background: "#22c55e" }}
                />
                <span className="relative inline-flex rounded-full w-2 h-2" style={{ background: "#22c55e" }} />
              </span>
              <span className="text-[12px]" style={{ color: "rgb(var(--muted))" }}>Ready</span>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0 scrollbar-thin">
        {messages.map((m, i) => (
          <ChatMessage
            key={m.id}
            role={m.role as "user" | "assistant"}
            content={m.content}
            index={i}
          />
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex justify-start items-end gap-2 animate-slide-up">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-white"
              style={{ background: "rgb(var(--accent))" }}
            >
              AI
            </div>
            <div
              className="rounded-2xl rounded-bl-sm px-3.5 py-2.5"
              style={{
                background: "rgb(var(--line-2))",
                border: "1px solid rgb(var(--line))",
              }}
            >
              <div className="flex gap-1.5 items-center h-4">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="w-1.5 h-1.5 rounded-full dot-pulse"
                    style={{
                      background: "rgb(var(--muted-2))",
                      animationDelay: `${delay}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error display */}
        {(error || generationError) && (
          <div className="flex justify-center py-2 animate-slide-up flex-col items-center">
            <div
              className="text-[12px] px-4 py-2 rounded-full"
              style={{
                background: "rgba(220,38,38,0.06)",
                border: "1px solid rgba(220,38,38,0.2)",
                color: "rgb(185,28,28)",
              }}
            >
              {generationError
                ? "Roadmap generation failed. Please try again."
                : "Something went wrong. Please try again."}
            </div>
            {serverError && (
              <p className="text-[10px] text-red-400 mt-1 font-mono uppercase tracking-tight">
                Error: {serverError}
              </p>
            )}
          </div>
        )}

        {/* Generating transition */}
        {isComplete && (
          <div className="flex justify-center py-2 animate-slide-up">
            <div
              className="flex items-center gap-2 rounded-full px-4 py-2"
              style={{
                background: "rgba(var(--accent), 0.06)",
                border: "1px solid rgba(var(--accent), 0.18)",
              }}
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                className="w-3.5 h-3.5 animate-spin-slow"
                aria-hidden="true"
                style={{ color: "rgb(var(--accent))" }}
              >
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />
                <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="text-[12px] font-medium" style={{ color: "rgb(var(--accent-2))" }}>
                Generating your roadmap…
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div
        className="flex-shrink-0 px-4 pb-4 pt-3 space-y-3"
        style={{ borderTop: "1px solid rgb(var(--line))" }}
      >
        {/* Magic Generate Button — shows when we have at least the idea */}
        {messages.filter(m => m.role === "user").length >= 3 && !isGenerating && !isLoading && (
          <div className="flex justify-center animate-slide-up">
            <button
              onClick={() => {
                const userMessages = messages.filter(m => m.role === 'user')
                const lastIdea = userMessages[userMessages.length - 1]?.content || "Test Idea"
                
                const args = {
                   idea: lastIdea.length < 2 ? "Test Idea" : lastIdea,
                   customer: "Early adopters",
                   budget_monthly: 100,
                   tech_level: "some-coding",
                   preference: "best-overall"
                }
                hasTriggeredRef.current = true
                setGenerationError(false)
                setServerError(null)

                fetch("/api/roadmap/generate", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(args),
                })
                  .then(async (r) => {
                    if (!r.ok) {
                      const body = await r.json().catch(() => ({}))
                      throw new Error(body.error || `HTTP ${r.status}`)
                    }
                    return r.json()
                  })
                  .then(({ short_id }) => {
                    if (short_id) router.push(`/r/${short_id}`)
                    else setGenerationError(true)
                  })
                  .catch((err) => {
                    console.error("Roadmap generation error:", err)
                    setGenerationError(true)
                    setServerError(err.message)
                    hasTriggeredRef.current = false
                  })
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, rgb(242,98,34) 0%, rgb(192,73,15) 100%)",
                boxShadow: "0 4px 12px rgba(242,98,34,0.3)"
              }}
            >
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4"><path d="M8 2l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4z" fill="white"/></svg>
              Generate My Roadmap
            </button>
          </div>
        )}

        <ChatInput
          onSubmit={handleSubmit}
          disabled={isLoading || isGenerating}
          placeholder={isGenerating ? "Generating your roadmap…" : "Type your answer…"}
        />
      </div>
    </div>
  )
}

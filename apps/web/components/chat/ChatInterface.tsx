"use client"
import { useChat } from "ai/react"
import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChatMessage } from "./ChatMessage"
import { ChatInput } from "./ChatInput"

const INITIAL_MESSAGE =
  "Tell me what you want to build — describe your startup idea in a sentence or two. I'll ask a few quick questions, then generate your full AI tool stack and roadmap."

export function ChatInterface() {
  const router = useRouter()
  const bottomRef = useRef<HTMLDivElement>(null)
  const hasTriggeredRef = useRef(false)

  const { messages, append, isLoading } = useChat({
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

    const submitCall = toolInvocations.find(
      (t) => t.toolName === "submit_inputs" && t.state === "result"
    )
    if (!submitCall) return

    hasTriggeredRef.current = true
    const args = submitCall.args

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
      .then((r) => r.json())
      .then(({ short_id }) => {
        if (short_id) router.push(`/r/${short_id}`)
      })
      .catch(console.error)
  }, [messages, router])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function handleSubmit(text: string) {
    append({ role: "user", content: text })
  }

  const isComplete = hasTriggeredRef.current

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
            Answer a few questions — we'll handle the rest.
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
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0 scrollbar-thin">
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
        className="flex-shrink-0 px-4 pb-4 pt-3"
        style={{ borderTop: "1px solid rgb(var(--line))" }}
      >
        <ChatInput
          onSubmit={handleSubmit}
          disabled={isLoading || isComplete}
          placeholder={isComplete ? "Generating your roadmap…" : "Type your answer…"}
        />
      </div>
    </div>
  )
}

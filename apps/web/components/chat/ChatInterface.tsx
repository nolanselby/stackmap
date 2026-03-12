"use client"
import { useChat } from "ai/react"
import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChatMessage } from "./ChatMessage"
import { ChatInput } from "./ChatInput"

const INITIAL_MESSAGE = "Tell me what you want to build — describe your startup idea in a sentence or two."

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

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full px-4">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-8 space-y-4 min-h-0">
        {messages.map((m) => (
          <ChatMessage key={m.id} role={m.role as "user" | "assistant"} content={m.content} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="pb-8 pt-4 border-t border-gray-100">
        <ChatInput
          onSubmit={handleSubmit}
          disabled={isLoading || hasTriggeredRef.current}
          placeholder="Your answer..."
        />
      </div>
    </div>
  )
}

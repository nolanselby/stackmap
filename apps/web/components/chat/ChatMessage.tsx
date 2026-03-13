"use client"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  role: "user" | "assistant"
  content: string
  index?: number
}

// Minimal markdown: bold via **text**
function renderContent(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

export function ChatMessage({ role, content, index = 0 }: ChatMessageProps) {
  const isUser = role === "user"

  if (!content) return null

  return (
    <div
      className={cn("flex w-full items-end gap-2.5 animate-slide-up", isUser ? "justify-end" : "justify-start")}
      style={{ animationDelay: `${index * 35}ms`, animationFillMode: "both" }}
    >
      {/* Avatar — assistant only */}
      {!isUser && (
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5 text-[9px] font-bold text-white"
          style={{
            background: "linear-gradient(135deg, rgb(242,98,34) 0%, rgb(192,73,15) 100%)",
            boxShadow: "0 1px 4px rgba(242,98,34,0.3)",
          }}
          aria-hidden="true"
        >
          AI
        </div>
      )}

      <div
        className={cn("max-w-[82%] text-sm leading-relaxed", isUser ? "rounded-2xl rounded-br-sm" : "rounded-2xl rounded-bl-sm")}
        style={
          isUser
            ? {
                background: "linear-gradient(135deg, rgb(242,98,34) 0%, rgb(210,80,20) 100%)",
                color: "white",
                padding: "10px 16px",
                boxShadow: "0 1px 3px rgba(242,98,34,0.25), 0 4px 12px rgba(242,98,34,0.15)",
              }
            : {
                background: "rgba(255,255,255,0.72)",
                border: "1px solid rgba(var(--line), 0.65)",
                borderLeft: "2px solid rgba(242,98,34,0.35)",
                color: "rgb(var(--ink))",
                padding: "10px 16px",
                boxShadow: "0 1px 3px rgba(20,12,4,0.04), 0 4px 12px rgba(20,12,4,0.06)",
              }
        }
      >
        <p className="whitespace-pre-wrap">{renderContent(content)}</p>
      </div>

      {/* Avatar — user only */}
      {isUser && (
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5 text-[9px] font-bold"
          style={{
            background: "rgba(var(--line), 0.8)",
            color: "rgb(var(--muted))",
            border: "1px solid rgba(var(--line), 0.9)",
          }}
          aria-hidden="true"
        >
          You
        </div>
      )}
    </div>
  )
}

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
      className={cn("flex w-full items-end gap-2 animate-slide-up", isUser ? "justify-end" : "justify-start")}
      style={{ animationDelay: `${index * 30}ms`, animationFillMode: "both" }}
    >
      {/* Avatar — assistant only */}
      {!isUser && (
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5 text-[9px] font-bold text-white"
          style={{ background: "rgb(var(--accent))" }}
          aria-hidden="true"
        >
          AI
        </div>
      )}

      <div
        className={cn(
          "max-w-[82%] text-sm leading-relaxed px-3.5 py-2.5",
          isUser ? "rounded-2xl rounded-br-sm" : "rounded-2xl rounded-bl-sm"
        )}
        style={
          isUser
            ? {
                background: "rgb(var(--accent))",
                color: "white",
              }
            : {
                background: "rgb(var(--line-2))",
                border: "1px solid rgb(var(--line))",
                color: "rgb(var(--ink))",
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
            background: "rgb(var(--line))",
            color: "rgb(var(--muted))",
            border: "1px solid rgb(var(--line))",
          }}
          aria-hidden="true"
        >
          You
        </div>
      )}
    </div>
  )
}

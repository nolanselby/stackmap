"use client"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  role: "user" | "assistant"
  content: string
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user"

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-orange-500 text-white rounded-br-sm"
            : "bg-white border border-gray-100 text-gray-800 shadow-sm rounded-bl-sm"
        )}
      >
        {content}
      </div>
    </div>
  )
}

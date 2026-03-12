"use client"
import { useState, useRef, type FormEvent, type KeyboardEvent } from "react"
import { Send } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSubmit: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ onSubmit, disabled, placeholder }: ChatInputProps) {
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!value.trim() || disabled) return
    onSubmit(value.trim())
    setValue("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  function handleInput() {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 w-full">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder={placeholder ?? "Type a message..."}
        rows={1}
        disabled={disabled}
        className={cn(
          "flex-1 resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3",
          "text-sm leading-relaxed text-gray-800 placeholder-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-all duration-150 max-h-[200px]"
        )}
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className={cn(
          "flex-shrink-0 h-11 w-11 rounded-full flex items-center justify-center",
          "bg-orange-500 text-white shadow-sm",
          "hover:bg-orange-600 transition-colors",
          "disabled:opacity-40 disabled:cursor-not-allowed"
        )}
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  )
}

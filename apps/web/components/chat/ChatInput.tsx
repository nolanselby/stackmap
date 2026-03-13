"use client"
import { useState, useRef, type FormEvent, type KeyboardEvent } from "react"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSubmit: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ onSubmit, disabled, placeholder }: ChatInputProps) {
  const [value, setValue] = useState("")
  const [focused, setFocused] = useState(false)
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

  const canSubmit = !disabled && value.trim().length > 0
  const charCount = value.length
  const showCount = focused && charCount > 80

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div
        className="relative transition-all duration-200"
        style={{
          borderRadius: "14px",
          border: focused
            ? "1px solid rgba(242,98,34,0.5)"
            : "1px solid rgba(var(--line), 0.85)",
          background: focused ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.6)",
          boxShadow: focused
            ? "0 0 0 3px rgba(242,98,34,0.1), 0 2px 8px rgba(20,12,4,0.06)"
            : "0 1px 3px rgba(20,12,4,0.05)",
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder ?? "Type your answer…"}
          rows={1}
          disabled={disabled}
          className={cn(
            "w-full resize-none bg-transparent",
            "px-4 py-3 pr-12",
            "text-sm leading-relaxed text-[rgb(var(--ink))] placeholder:text-[rgb(var(--muted-2))]",
            "focus:outline-none",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "max-h-[200px]"
          )}
          style={{ borderRadius: "14px", display: "block" }}
        />

        {/* Character count */}
        {showCount && (
          <div
            className="absolute bottom-3 left-4 text-[10px] tabular-nums pointer-events-none"
            style={{ color: charCount > 400 ? "rgb(var(--accent))" : "rgb(var(--muted-2))" }}
          >
            {charCount}
          </div>
        )}

        {/* Send button */}
        <button
          type="submit"
          disabled={!canSubmit}
          aria-label="Send message"
          className={cn(
            "absolute right-2.5 bottom-2.5",
            "h-8 w-8 rounded-[10px] flex items-center justify-center",
            "transition-all duration-150"
          )}
          style={
            canSubmit
              ? {
                  background: "linear-gradient(135deg, rgb(242,98,34) 0%, rgb(210,80,20) 100%)",
                  color: "white",
                  boxShadow: "0 1px 4px rgba(242,98,34,0.35), 0 2px 8px rgba(242,98,34,0.2)",
                }
              : {
                  background: "rgba(var(--line), 0.5)",
                  color: "rgba(var(--muted), 0.5)",
                  cursor: "not-allowed",
                }
          }
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-3.5 h-3.5"
            aria-hidden="true"
          >
            <path d="M3.105 2.289a.75.75 0 00-.826.95l1.903 6.557H13.5a.75.75 0 010 1.5H4.182l-1.903 6.557a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
          </svg>
        </button>
      </div>
    </form>
  )
}

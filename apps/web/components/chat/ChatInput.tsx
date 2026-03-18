"use client"
import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from "react"
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
  const prevDisabledRef = useRef(disabled)

  // Restore focus when the input becomes enabled again (e.g. AI finishes responding)
  useEffect(() => {
    if (prevDisabledRef.current && !disabled) {
      textareaRef.current?.focus()
    }
    prevDisabledRef.current = disabled
  }, [disabled])

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

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div
        className="relative transition-all duration-150"
        style={{
          borderRadius: "10px",
          border: focused
            ? "1px solid rgba(var(--accent), 0.45)"
            : "1px solid rgb(var(--line))",
          background: "rgb(var(--paper-3))",
          boxShadow: focused
            ? "0 0 0 3px rgba(var(--accent), 0.08)"
            : "none",
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
            "px-3.5 py-2.5 pr-11",
            "text-sm leading-relaxed text-[rgb(var(--ink))] placeholder:text-[rgb(var(--muted-2))]",
            "focus:outline-none",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            "max-h-[200px]"
          )}
          style={{ borderRadius: "10px", display: "block" }}
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={!canSubmit}
          aria-label="Send message"
          className={cn(
            "absolute right-2 bottom-2",
            "h-7 w-7 rounded-[8px] flex items-center justify-center",
            "transition-all duration-150"
          )}
          style={
            canSubmit
              ? {
                  background: "rgb(var(--accent))",
                  color: "white",
                }
              : {
                  background: "rgb(var(--line))",
                  color: "rgb(var(--muted-2))",
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

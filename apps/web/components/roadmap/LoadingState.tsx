"use client"
import { useEffect, useState } from "react"

const STEPS = [
  { label: "Understanding your idea", icon: "💡", duration: 8000 },
  { label: "Selecting the right tools", icon: "🔧", duration: 18000 },
  { label: "Mapping workflow stages", icon: "🗺️", duration: 28000 },
  { label: "Building your roadmap", icon: "🚀", duration: 38000 },
]

function SkeletonNode({ delay = 0, width = 240 }: { delay?: number; width?: number }) {
  return (
    <div
      className="skeleton rounded-2xl flex-shrink-0"
      style={{
        width,
        height: 88,
        animationDelay: `${delay}ms`,
      }}
    />
  )
}

export function LoadingState() {
  const [activeStep, setActiveStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    STEPS.forEach((step, i) => {
      if (i === 0) return
      timers.push(
        setTimeout(() => {
          setCompletedSteps((prev) => [...prev, i - 1])
          setActiveStep(i)
        }, step.duration - STEPS[i - 1].duration + (i > 1 ? STEPS[i - 1].duration - STEPS[i - 2].duration : STEPS[0].duration))
      )
    })

    // Complete last step
    timers.push(
      setTimeout(() => {
        setCompletedSteps([0, 1, 2, 3])
      }, STEPS[STEPS.length - 1].duration)
    )

    // Simpler approach: fire at each step's duration directly
    timers.forEach((t) => clearTimeout(t))

    const stepTimers: ReturnType<typeof setTimeout>[] = []
    stepTimers.push(
      setTimeout(() => { setCompletedSteps([0]); setActiveStep(1) }, STEPS[0].duration)
    )
    stepTimers.push(
      setTimeout(() => { setCompletedSteps([0, 1]); setActiveStep(2) }, STEPS[1].duration)
    )
    stepTimers.push(
      setTimeout(() => { setCompletedSteps([0, 1, 2]); setActiveStep(3) }, STEPS[2].duration)
    )
    stepTimers.push(
      setTimeout(() => { setCompletedSteps([0, 1, 2, 3]) }, STEPS[3].duration)
    )

    return () => stepTimers.forEach(clearTimeout)
  }, [])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: "rgb(var(--paper))" }}
    >
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 800px 600px at 50% 40%, rgba(242,98,34,0.07) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 w-full max-w-sm">

        {/* Logo mark */}
        <div className="flex justify-center mb-10">
          <div className="relative">
            {/* Pulsing outer ring */}
            <div
              className="absolute -inset-3 rounded-full"
              style={{
                border: "1px solid rgba(242,98,34,0.2)",
                animation: "pulse-ring 2.4s ease-out infinite",
              }}
            />
            {/* Spinning ring */}
            <div
              className="w-14 h-14 rounded-full"
              style={{
                border: "2px solid rgba(242,98,34,0.12)",
                borderTopColor: "rgb(242,98,34)",
                animation: "spin-slow 1.8s linear infinite",
              }}
            />
            {/* Center */}
            <div
              className="absolute inset-0 flex items-center justify-center"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgb(242,98,34) 0%, rgb(192,73,15) 100%)",
                  boxShadow: "0 2px 8px rgba(242,98,34,0.4)",
                }}
              >
                <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
                  <path d="M10 2L3 6v8l7 4 7-4V6L10 2z" fill="white" fillOpacity="0.95" />
                  <path d="M10 10L3 6M10 10l7-4M10 10v8" stroke="white" strokeWidth="1.1" strokeOpacity="0.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h2
            className="display text-2xl mb-1.5"
            style={{ color: "rgb(var(--ink))" }}
          >
            Building your roadmap
          </h2>
          <p className="text-sm" style={{ color: "rgb(var(--muted))" }}>
            This usually takes 20–40 seconds
          </p>
        </div>

        {/* Steps */}
        <div
          className="grain rounded-2xl p-5 space-y-3 mb-8"
          style={{
            background: "rgba(255,255,255,0.6)",
            border: "1px solid rgba(var(--line), 0.7)",
            boxShadow: "0 2px 8px rgba(20,12,4,0.06), 0 8px 24px rgba(20,12,4,0.07)",
          }}
        >
          {STEPS.map((step, i) => {
            const isCompleted = completedSteps.includes(i)
            const isActive = activeStep === i && !isCompleted
            const isPending = !isActive && !isCompleted

            return (
              <div
                key={step.label}
                className="flex items-center gap-3 step-animate"
                style={{
                  animationDelay: `${i * 120}ms`,
                  animationFillMode: "both",
                }}
              >
                {/* Status dot */}
                <div className="flex-shrink-0 w-5 h-5 relative flex items-center justify-center">
                  {isCompleted ? (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, rgb(242,98,34), rgb(192,73,15))",
                        boxShadow: "0 1px 4px rgba(242,98,34,0.35)",
                      }}
                    >
                      <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3" aria-hidden="true">
                        <path
                          d="M2.5 6l2.5 2.5 4.5-5"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  ) : isActive ? (
                    <div
                      className="w-5 h-5 rounded-full"
                      style={{
                        border: "2px solid rgba(242,98,34,0.25)",
                        borderTopColor: "rgb(242,98,34)",
                        animation: "spin-slow 1.4s linear infinite",
                      }}
                    />
                  ) : (
                    <div
                      className="w-5 h-5 rounded-full"
                      style={{ border: "2px solid rgba(var(--line), 0.9)" }}
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  className="text-sm font-medium transition-colors duration-300"
                  style={{
                    color: isCompleted
                      ? "rgb(var(--ink))"
                      : isActive
                      ? "rgb(var(--accent))"
                      : "rgb(var(--muted-2))",
                  }}
                >
                  {step.label}
                </span>

                {/* Active pulse indicator */}
                {isActive && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{
                      background: "rgb(var(--accent))",
                      animation: "pulse-ring 1.8s ease-out infinite",
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Roadmap skeleton preview */}
        <div
          className="rounded-2xl p-4 overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.4)",
            border: "1px solid rgba(var(--line), 0.5)",
          }}
        >
          <div className="skeleton rounded mb-3" style={{ height: 10, width: "40%" }} />
          <div className="space-y-2">
            <div className="flex gap-2">
              <SkeletonNode delay={0} width={180} />
              <SkeletonNode delay={200} width={160} />
            </div>
            <div className="flex gap-2">
              <SkeletonNode delay={400} width={160} />
              <SkeletonNode delay={600} width={200} />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

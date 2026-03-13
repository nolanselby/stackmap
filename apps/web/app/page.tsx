import { ChatInterface } from "@/components/chat/ChatInterface"

export default function HomePage() {
  return (
    <main className="min-h-screen relative overflow-x-hidden">

      {/* Ambient orb — CSS-only, no libraries */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        {/* Primary orb */}
        <div
          className="absolute rounded-full"
          style={{
            width: "900px",
            height: "600px",
            top: "5%",
            left: "50%",
            transform: "translate(-50%, 0)",
            background:
              "radial-gradient(ellipse at center, rgba(242,98,34,0.12) 0%, rgba(192,73,15,0.07) 40%, transparent 70%)",
            filter: "blur(40px)",
            animation: "orb-float 12s ease-in-out infinite",
          }}
        />
        {/* Secondary orb */}
        <div
          className="absolute rounded-full"
          style={{
            width: "500px",
            height: "400px",
            top: "40%",
            right: "-10%",
            background:
              "radial-gradient(ellipse at center, rgba(242,98,34,0.07) 0%, transparent 65%)",
            filter: "blur(60px)",
            animation: "orb-float 16s ease-in-out infinite reverse",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl px-5 sm:px-6">

        {/* ── Top nav ── */}
        <nav className="flex items-center justify-between pt-6 pb-2">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-[10px] flex items-center justify-center shadow-md"
              style={{
                background: "linear-gradient(135deg, rgb(242,98,34) 0%, rgb(192,73,15) 100%)",
                boxShadow: "0 2px 8px rgba(242,98,34,0.35), 0 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
                <path d="M10 2L3 6v8l7 4 7-4V6L10 2z" fill="white" fillOpacity="0.9" />
                <path d="M10 10L3 6M10 10l7-4M10 10v8" stroke="white" strokeWidth="1.2" strokeOpacity="0.6" />
              </svg>
            </div>
            <span className="display text-[17px] text-[rgb(var(--ink))]">Tool Roadmapper</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[rgb(var(--muted))] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Open source · Free · No account
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="pt-16 pb-12 text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-8 text-[11px] font-medium"
            style={{
              background: "rgba(242,98,34,0.08)",
              border: "1px solid rgba(242,98,34,0.22)",
              color: "rgb(var(--accent-2))",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{ background: "rgb(var(--accent))" }}
            />
            Free to use — no account needed
          </div>

          <h1
            className="display text-[clamp(48px,8vw,84px)] leading-[0.95] tracking-[-0.03em] text-[rgb(var(--ink))]"
          >
            From idea to{" "}
            <span
              style={{
                background: "linear-gradient(135deg, rgb(242,98,34) 0%, rgb(192,73,15) 75%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              AI stack
            </span>
            <br />
            in minutes.
          </h1>

          <p
            className="mt-6 text-lg sm:text-xl leading-relaxed max-w-[52ch] mx-auto"
            style={{ color: "rgb(var(--muted))" }}
          >
            Describe what you're building. Get a curated tool stack, real cost estimates, and a week-by-week build sequence.
          </p>
        </section>

        {/* ── Chat card ── */}
        <section className="max-w-2xl mx-auto">
          <div
            className="grain rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(160deg, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.72) 100%)",
              border: "1px solid rgba(var(--line), 0.8)",
              boxShadow:
                "0 0 0 0.5px rgba(255,255,255,0.7) inset, 0 1px 0 rgba(255,255,255,0.8) inset, 0 4px 12px rgba(20,12,4,0.06), 0 20px 60px rgba(20,12,4,0.1), 0 0 80px rgba(242,98,34,0.06)",
            }}
          >
            <ChatInterface />
          </div>

          {/* Keyboard hint */}
          <p className="text-center text-[12px] mt-4" style={{ color: "rgb(var(--muted-2))" }}>
            Press{" "}
            <kbd
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium"
              style={{
                background: "rgba(var(--line), 0.5)",
                border: "1px solid rgba(var(--line), 0.9)",
                color: "rgb(var(--muted))",
              }}
            >
              Enter
            </kbd>{" "}
            to send &middot;{" "}
            <kbd
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium"
              style={{
                background: "rgba(var(--line), 0.5)",
                border: "1px solid rgba(var(--line), 0.9)",
                color: "rgb(var(--muted))",
              }}
            >
              Shift+Enter
            </kbd>{" "}
            for new line
          </p>
        </section>

        {/* ── How it works ── */}
        <section className="mt-20 pb-20">
          <p
            className="text-center text-[11px] font-medium uppercase tracking-[0.2em] mb-10"
            style={{ color: "rgb(var(--muted-2))" }}
          >
            How it works
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                step: "01",
                title: "Describe your idea",
                body: "Tell us what you're building, who it's for, your budget, and tech level. Takes under two minutes.",
              },
              {
                step: "02",
                title: "We select your stack",
                body: "Our AI picks the best tool for each workflow stage — with cheaper and open-source alternatives.",
              },
              {
                step: "03",
                title: "Get your roadmap",
                body: "A week-by-week build sequence, cost breakdown, and exportable task list ready to paste into your repo.",
              },
            ].map(({ step, title, body }) => (
              <div
                key={step}
                className="grain rounded-2xl p-6"
                style={{
                  background: "rgba(255,255,255,0.55)",
                  border: "1px solid rgba(var(--line), 0.7)",
                  boxShadow: "0 1px 3px rgba(20,12,4,0.04), 0 4px 16px rgba(20,12,4,0.05)",
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center mb-4 text-[11px] font-bold"
                  style={{
                    background: "rgba(242,98,34,0.1)",
                    color: "rgb(var(--accent))",
                    border: "1px solid rgba(242,98,34,0.2)",
                  }}
                >
                  {step}
                </div>
                <h3
                  className="display text-[17px] leading-snug mb-2"
                  style={{ color: "rgb(var(--ink))" }}
                >
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgb(var(--muted))" }}>
                  {body}
                </p>
              </div>
            ))}
          </div>

          {/* What you get */}
          <div
            className="mt-6 grain rounded-2xl px-6 py-5"
            style={{
              background: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(var(--line), 0.7)",
              boxShadow: "0 1px 3px rgba(20,12,4,0.04), 0 4px 16px rgba(20,12,4,0.05)",
            }}
          >
            <p
              className="text-[11px] font-medium uppercase tracking-[0.2em] mb-3"
              style={{ color: "rgb(var(--muted-2))" }}
            >
              Included in every roadmap
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {[
                "Best / Cheapest / OSS variants",
                "Real cost estimates",
                "Lock-in & setup ratings",
                "Week-by-week build sequence",
                "Exportable task list",
                "Shareable link",
              ].map((item) => (
                <span key={item} className="flex items-center gap-2 text-sm" style={{ color: "rgb(var(--ink))" }}>
                  <svg viewBox="0 0 12 12" fill="none" className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true">
                    <circle cx="6" cy="6" r="5.5" fill="rgba(242,98,34,0.12)" stroke="rgba(242,98,34,0.3)" />
                    <path d="M3.5 6l1.8 1.8 3.2-3.6" stroke="rgb(192,73,15)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

      </div>
    </main>
  )
}

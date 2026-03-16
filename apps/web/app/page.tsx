import { ChatInterface } from "@/components/chat/ChatInterface"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-4xl px-5 sm:px-6">

        {/* ── Top nav ── */}
        <nav className="flex items-center justify-between pt-6 pb-2">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-[8px] flex items-center justify-center"
              style={{
                background: "rgb(var(--accent))",
                boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
              }}
            >
              <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
                <path d="M10 2L3 6v8l7 4 7-4V6L10 2z" fill="white" fillOpacity="0.95" />
                <path d="M10 10L3 6M10 10l7-4M10 10v8" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" />
              </svg>
            </div>
            <span className="font-semibold text-[15px]" style={{ color: "rgb(var(--ink))" }}>
              Tool Roadmapper
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[12px]" style={{ color: "rgb(var(--muted))" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Free · No account needed
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="pt-16 pb-10 text-center">
          <h1
            className="text-[clamp(40px,7vw,72px)] font-bold leading-[1.05] tracking-[-0.03em]"
            style={{ color: "rgb(var(--ink))" }}
          >
            From idea to{" "}
            <span style={{ color: "rgb(var(--accent))" }}>AI stack</span>
            <br />
            in minutes.
          </h1>

          <p
            className="mt-5 text-lg leading-relaxed max-w-[50ch] mx-auto"
            style={{ color: "rgb(var(--muted))" }}
          >
            Describe what you're building. Get a curated tool stack, real cost estimates,
            and a week-by-week build sequence.
          </p>
        </section>

        {/* ── Chat card ── */}
        <section className="max-w-2xl mx-auto">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgb(var(--paper-3))",
              border: "1px solid rgb(var(--line))",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)",
            }}
          >
            <ChatInterface />
          </div>

          <p className="text-center text-[12px] mt-3" style={{ color: "rgb(var(--muted-2))" }}>
            Press{" "}
            <kbd
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium"
              style={{
                background: "rgb(var(--line-2))",
                border: "1px solid rgb(var(--line))",
                color: "rgb(var(--muted))",
              }}
            >
              Enter
            </kbd>{" "}
            to send &middot;{" "}
            <kbd
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium"
              style={{
                background: "rgb(var(--line-2))",
                border: "1px solid rgb(var(--line))",
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
            className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] mb-8"
            style={{ color: "rgb(var(--muted-2))" }}
          >
            How it works
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                className="rounded-xl p-5"
                style={{
                  background: "rgb(var(--paper-3))",
                  border: "1px solid rgb(var(--line))",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center mb-4 text-[10px] font-bold"
                  style={{
                    background: "rgba(var(--accent), 0.1)",
                    color: "rgb(var(--accent))",
                  }}
                >
                  {step}
                </div>
                <h3
                  className="font-semibold text-[15px] leading-snug mb-1.5"
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
            className="mt-3 rounded-xl px-5 py-4"
            style={{
              background: "rgb(var(--paper-3))",
              border: "1px solid rgb(var(--line))",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}
          >
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-3"
              style={{ color: "rgb(var(--muted-2))" }}
            >
              Included in every roadmap
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {[
                "Best / Cheapest / OSS variants",
                "Real cost estimates",
                "Lock-in & setup ratings",
                "Week-by-week build sequence",
                "Exportable task list",
                "Shareable link",
              ].map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-sm" style={{ color: "rgb(var(--ink-2))" }}>
                  <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3 flex-shrink-0" aria-hidden="true">
                    <circle cx="6" cy="6" r="5.5" fill="rgba(var(--accent), 0.1)" stroke="rgba(var(--accent), 0.3)" />
                    <path d="M3.5 6l1.8 1.8 3.2-3.6" stroke="rgb(var(--accent-2))" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
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

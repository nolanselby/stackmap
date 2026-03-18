import { ChatInterface } from "@/components/chat/ChatInterface"

const STACK_ROWS = [
  { cat: "Auth & DB",  tool: "Supabase",  cost: "$25/mo",   week: "Wk 1", dot: "#22c55e", tag: "recommended" },
  { cat: "Hosting",   tool: "Vercel",    cost: "$20/mo",   week: "Wk 1", dot: "#3b82f6", tag: "popular"     },
  { cat: "AI / LLM",  tool: "OpenAI",    cost: "~$15/mo",  week: "Wk 2", dot: "#a855f7", tag: null          },
  { cat: "Payments",  tool: "Stripe",    cost: "2.9%+30¢", week: "Wk 3", dot: "#f59e0b", tag: null          },
  { cat: "Email",     tool: "Resend",    cost: "Free",      week: "Wk 2", dot: "#06b6d4", tag: "free tier"   },
]

function ProductMockup() {
  return (
    <div
      style={{
        transform: "perspective(900px) rotateY(-6deg) rotateX(3deg)",
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      <div
        style={{
          background: "rgb(var(--paper-3))",
          border: "1px solid rgb(var(--line))",
          borderRadius: "10px",
          boxShadow:
            "0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.07), 0 20px 48px rgba(0,0,0,0.05)",
          overflow: "hidden",
          fontSize: "12px",
          userSelect: "none",
        }}
      >
        {/* Window chrome */}
        <div
          style={{
            padding: "9px 12px",
            borderBottom: "1px solid rgb(var(--line))",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgb(var(--paper-2))",
          }}
        >
          <div style={{ display: "flex", gap: 5 }}>
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
              <div
                key={c}
                style={{ width: 9, height: 9, borderRadius: "50%", background: c }}
              />
            ))}
          </div>
          <span
            style={{
              fontSize: 11,
              color: "rgb(var(--muted-2))",
              fontFamily: "monospace",
              letterSpacing: "0.01em",
            }}
          >
            SaaS scheduling app
          </span>
          <span style={{ fontSize: 10, color: "rgb(var(--muted-2))" }}>
            Generated in 41s
          </span>
        </div>

        {/* Card header */}
        <div
          style={{
            padding: "12px 14px 10px",
            borderBottom: "1px solid rgb(var(--line))",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span
              style={{ fontWeight: 700, color: "rgb(var(--ink))", fontSize: 13 }}
            >
              Your AI Stack
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                padding: "2px 7px",
                borderRadius: 4,
                background: "rgba(var(--accent), 0.08)",
                color: "rgb(var(--accent-2))",
              }}
            >
              5 tools · ~$60/mo
            </span>
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            {["Best Overall", "Cheapest", "Open Source"].map((v, i) => (
              <span
                key={v}
                style={{
                  fontSize: 10,
                  padding: "2px 8px",
                  borderRadius: 4,
                  background:
                    i === 0 ? "rgb(var(--accent))" : "rgb(var(--line-2))",
                  color: i === 0 ? "white" : "rgb(var(--muted))",
                  fontWeight: i === 0 ? 600 : 400,
                  cursor: "pointer",
                }}
              >
                {v}
              </span>
            ))}
          </div>
        </div>

        {/* Column headers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "72px 1fr 64px 36px",
            padding: "5px 14px",
            gap: 8,
            borderBottom: "1px solid rgb(var(--line-2))",
            background: "rgb(var(--surface))",
          }}
        >
          {["Category", "Tool", "Cost", "Wk"].map((h) => (
            <span
              key={h}
              style={{
                fontSize: 9,
                fontWeight: 600,
                color: "rgb(var(--muted-2))",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Tool rows */}
        {STACK_ROWS.map((row, i) => (
          <div
            key={row.tool}
            style={{
              display: "grid",
              gridTemplateColumns: "72px 1fr 64px 36px",
              alignItems: "center",
              padding: "7px 14px",
              gap: 8,
              borderBottom:
                i < STACK_ROWS.length - 1
                  ? "1px solid rgb(var(--line-2))"
                  : "none",
              background: i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.012)",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 10,
                color: "rgb(var(--muted))",
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: row.dot,
                  flexShrink: 0,
                }}
              />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {row.cat}
              </span>
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span
                style={{
                  fontWeight: 600,
                  color: "rgb(var(--ink))",
                  fontSize: 12,
                }}
              >
                {row.tool}
              </span>
              {row.tag && (
                <span
                  style={{
                    fontSize: 9,
                    padding: "1px 5px",
                    borderRadius: 3,
                    background:
                      row.tag === "recommended"
                        ? "rgba(34,197,94,0.1)"
                        : row.tag === "free tier"
                        ? "rgba(6,182,212,0.1)"
                        : "rgba(59,130,246,0.1)",
                    color:
                      row.tag === "recommended"
                        ? "#15803d"
                        : row.tag === "free tier"
                        ? "#0e7490"
                        : "#1d4ed8",
                    fontWeight: 500,
                    flexShrink: 0,
                  }}
                >
                  {row.tag}
                </span>
              )}
            </div>
            <span
              style={{
                fontSize: 10,
                padding: "2px 6px",
                borderRadius: 3,
                background: "rgb(var(--line-2))",
                color: "rgb(var(--ink-2))",
                textAlign: "center",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {row.cost}
            </span>
            <span
              style={{
                fontSize: 9,
                padding: "2px 5px",
                borderRadius: 3,
                background: "rgb(var(--line))",
                color: "rgb(var(--muted))",
                textAlign: "center",
              }}
            >
              {row.week}
            </span>
          </div>
        ))}

        {/* Timeline footer */}
        <div
          style={{
            padding: "10px 14px 12px",
            borderTop: "1px solid rgb(var(--line))",
            background: "rgb(var(--paper-2))",
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              color: "rgb(var(--muted-2))",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              display: "block",
              marginBottom: 7,
            }}
          >
            Build timeline
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            {[
              { label: "Week 1", sub: "Auth + DB", filled: true, opacity: 1 },
              { label: "Week 2", sub: "AI + Email", filled: true, opacity: 0.55 },
              { label: "Week 3", sub: "Payments", filled: false, opacity: 0.25 },
              { label: "Week 4", sub: "Launch", filled: false, opacity: 0.2 },
            ].map(({ label, sub, filled, opacity }) => (
              <div key={label} style={{ flex: 1 }}>
                <div
                  style={{
                    height: 3,
                    borderRadius: 2,
                    background: filled
                      ? "rgb(var(--accent))"
                      : "rgb(var(--line))",
                    marginBottom: 4,
                    opacity,
                  }}
                />
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    color: "rgb(var(--muted))",
                    lineHeight: 1.3,
                  }}
                >
                  {label}
                </div>
                <div style={{ fontSize: 8, color: "rgb(var(--muted-2))" }}>
                  {sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <main style={{ background: "rgb(var(--paper))" }}>

      {/* Nav */}
      <div className="mx-auto w-full max-w-5xl px-6">
        <nav
          className="flex items-center justify-between py-5"
          style={{ borderBottom: "1px solid rgb(var(--line))" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-[6px] flex items-center justify-center flex-shrink-0"
              style={{ background: "rgb(var(--accent))" }}
            >
              <svg viewBox="0 0 20 20" fill="none" className="w-3.5 h-3.5" aria-hidden="true">
                <path d="M10 2L3 6v8l7 4 7-4V6L10 2z" fill="white" fillOpacity="0.95" />
                <path
                  d="M10 10L3 6M10 10l7-4M10 10v8"
                  stroke="white"
                  strokeWidth="1.2"
                  strokeOpacity="0.5"
                />
              </svg>
            </div>
            <span
              className="font-semibold text-[14px] tracking-[-0.01em]"
              style={{ color: "rgb(var(--ink))" }}
            >
              Roadmapper
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#22c55e" }}
            />
            <span className="text-[12px]" style={{ color: "rgb(var(--muted))" }}>
              Free · No account needed
            </span>
          </div>
        </nav>
      </div>

      {/* Hero */}
      <div className="mx-auto w-full max-w-5xl px-6">
        <div className="grid lg:grid-cols-[1fr_400px] gap-12 xl:gap-20 pt-16 pb-16 items-center">

          {/* Left: copy */}
          <div>
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-7 text-[11px] font-semibold tracking-wide"
              style={{
                background: "rgba(var(--accent), 0.07)",
                color: "rgb(var(--accent-2))",
                border: "1px solid rgba(var(--accent), 0.14)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "rgb(var(--accent))" }}
              />
              AI Stack Advisor
            </div>

            <h1
              className="font-bold leading-[1.07] tracking-[-0.035em] mb-5"
              style={{
                fontSize: "clamp(34px, 4.2vw, 50px)",
                color: "rgb(var(--ink))",
              }}
            >
              Your AI stack,
              <br />
              <span style={{ color: "rgb(var(--accent))" }}>
                planned in minutes.
              </span>
            </h1>

            <p
              className="leading-[1.72] mb-8"
              style={{
                fontSize: 15,
                color: "rgb(var(--muted))",
                maxWidth: "43ch",
              }}
            >
              Describe what you&apos;re building. Get a curated tool stack with
              real costs, lock-in ratings, and a week-by-week build plan
              tailored to your budget and team.
            </p>

            <div className="flex items-center gap-5 mb-12">
              <a
                href="#chat"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-[7px] text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90"
                style={{
                  background: "rgb(var(--accent))",
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.1), 0 4px 12px rgba(242,98,34,0.2)",
                }}
              >
                Start building
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  className="w-3.5 h-3.5"
                  aria-hidden="true"
                >
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
              <a
                href="#how"
                className="text-[13px] flex items-center gap-1 transition-opacity hover:opacity-70"
                style={{ color: "rgb(var(--muted))" }}
              >
                How it works
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  className="w-3 h-3"
                  aria-hidden="true"
                >
                  <path
                    d="M6 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>

            {/* Stats */}
            <div
              className="flex items-start gap-8 pt-6"
              style={{ borderTop: "1px solid rgb(var(--line))" }}
            >
              {[
                { n: "~$50", label: "avg monthly stack cost" },
                { n: "<10 min", label: "idea to full roadmap" },
                { n: "100%", label: "free, no card required" },
              ].map(({ n, label }) => (
                <div key={label}>
                  <div
                    className="font-bold tracking-[-0.02em]"
                    style={{ fontSize: 18, color: "rgb(var(--ink))" }}
                  >
                    {n}
                  </div>
                  <div
                    className="mt-0.5"
                    style={{ fontSize: 11, color: "rgb(var(--muted-2))" }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: product mockup */}
          <div className="hidden lg:block">
            <ProductMockup />
          </div>
        </div>
      </div>

      {/* Chat section */}
      <div
        id="chat"
        style={{ borderTop: "1px solid rgb(var(--line))", background: "rgb(var(--surface))" }}
      >
        <div className="mx-auto w-full max-w-2xl px-6 pt-14 pb-16">
          <div className="mb-5">
            <h2
              className="font-semibold tracking-[-0.01em]"
              style={{ fontSize: 15, color: "rgb(var(--ink))" }}
            >
              Tell us about your idea
            </h2>
            <p className="mt-1" style={{ fontSize: 13, color: "rgb(var(--muted))" }}>
              Answer a few questions and we&apos;ll generate your full stack in under a minute.
            </p>
          </div>

          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: "rgb(var(--paper-3))",
              border: "1px solid rgb(var(--line))",
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.05), 0 6px 20px rgba(0,0,0,0.05)",
            }}
          >
            <ChatInterface />
          </div>

          <p
            className="mt-3 pl-1"
            style={{ fontSize: 11, color: "rgb(var(--muted-2))" }}
          >
            Press{" "}
            <kbd
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{
                background: "rgb(var(--line-2))",
                border: "1px solid rgb(var(--line))",
                color: "rgb(var(--muted))",
              }}
            >
              Enter
            </kbd>{" "}
            to send
            <span className="mx-2" style={{ color: "rgb(var(--line))" }}>
              ·
            </span>
            <kbd
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
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
        </div>
      </div>

      {/* How it works */}
      <div
        id="how"
        className="mx-auto w-full max-w-5xl px-6 pt-20 pb-8"
      >
        <div className="mb-10">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.16em] mb-3"
            style={{ color: "rgb(var(--muted-2))" }}
          >
            How it works
          </p>
          <h2
            className="font-bold tracking-[-0.025em]"
            style={{ fontSize: "clamp(22px, 3vw, 30px)", color: "rgb(var(--ink))" }}
          >
            From idea to roadmap in four steps
          </h2>
        </div>

        {/* Flat tile grid — no individual rounded cards */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          style={{
            border: "1px solid rgb(var(--line))",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          {[
            {
              n: "01",
              title: "Describe your idea",
              body: "Tell us what you're building in plain English. Who it's for and what problem it solves.",
              wide: false,
            },
            {
              n: "02",
              title: "Answer 3 questions",
              body: "Customer type, monthly budget, and your team's tech level. Takes two minutes.",
              wide: false,
            },
            {
              n: "03",
              title: "We pick your stack",
              body: "Our AI selects the best tool for each job, with cheaper and open-source alternatives.",
              wide: false,
            },
            {
              n: "04",
              title: "Get your roadmap",
              body: "Week-by-week build plan, cost breakdown, shareable link, and exportable tasks.",
              wide: false,
            },
          ].map(({ n, title, body }, i) => (
            <div
              key={n}
              className="p-6"
              style={{
                background: "rgb(var(--paper-3))",
                borderRight:
                  i < 3 ? "1px solid rgb(var(--line))" : "none",
              }}
            >
              <span
                className="block font-mono font-bold text-[11px] mb-4 tracking-wide"
                style={{ color: "rgb(var(--accent))" }}
              >
                {n}
              </span>
              <h3
                className="font-semibold mb-2"
                style={{ fontSize: 14, color: "rgb(var(--ink))", lineHeight: 1.35 }}
              >
                {title}
              </h3>
              <p
                className="leading-relaxed"
                style={{ fontSize: 13, color: "rgb(var(--muted))" }}
              >
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* What's included */}
      <div className="mx-auto w-full max-w-5xl px-6 pt-10 pb-20">
        <div
          className="flex flex-col sm:flex-row sm:items-start gap-6 py-7 px-0"
          style={{ borderTop: "1px solid rgb(var(--line))" }}
        >
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.16em] flex-shrink-0 pt-0.5"
            style={{ color: "rgb(var(--muted-2))" }}
          >
            Every roadmap includes
          </p>

          <div className="flex flex-wrap gap-2">
            {[
              "Best / Cheapest / OSS variants",
              "Real cost estimates",
              "Lock-in ratings",
              "Setup complexity",
              "Week-by-week build plan",
              "Shareable link",
              "GitHub issue export",
              "Markdown export",
            ].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px]"
                style={{
                  background: "rgb(var(--paper-3))",
                  border: "1px solid rgb(var(--line))",
                  color: "rgb(var(--ink-2))",
                }}
              >
                <svg
                  viewBox="0 0 10 10"
                  fill="none"
                  className="w-2.5 h-2.5 flex-shrink-0"
                  aria-hidden="true"
                >
                  <path
                    d="M1.5 5l2.5 2.5 4.5-4.5"
                    stroke="rgb(var(--accent))"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

    </main>
  )
}

import type { Metadata } from "next"
import { Fraunces, IBM_Plex_Sans } from "next/font/google"
import "./globals.css"

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  preload: true,
})

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: "AI Tool Roadmapper — From idea to AI stack in minutes",
  description:
    "Describe what you're building. Get a curated AI tool stack, cost breakdown, and week-by-week build sequence tailored to your budget and skill level.",
  openGraph: {
    title: "AI Tool Roadmapper",
    description: "From idea to AI stack in minutes.",
    type: "website",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${display.variable} ${sans.variable}`}>{children}</body>
    </html>
  )
}

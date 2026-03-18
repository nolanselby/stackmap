import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
  weight: ["400", "500", "600", "700", "800"],
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
      <body className={jakarta.variable}>{children}</body>
    </html>
  )
}

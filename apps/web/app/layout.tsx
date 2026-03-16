import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@xyflow/react/dist/style.css"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
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
      <body className={inter.variable}>{children}</body>
    </html>
  )
}

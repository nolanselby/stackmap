import { ChatInterface } from "@/components/chat/ChatInterface"

export default function HomePage() {
  return (
    <main className="h-screen bg-gradient-to-b from-orange-50 to-white flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-orange-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <span className="font-semibold text-gray-800">AI Tool Roadmapper</span>
        </div>
        <p className="text-sm text-gray-500 hidden sm:block">
          Tell us what to build. Get your AI stack.
        </p>
      </header>

      {/* Chat fills remaining height */}
      <div className="flex-1 min-h-0 flex flex-col">
        <ChatInterface />
      </div>
    </main>
  )
}

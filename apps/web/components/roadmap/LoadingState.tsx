"use client"

export function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-orange-500 rounded-lg" />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-800">Building your roadmap...</h2>
          <p className="text-gray-500 text-sm">Analyzing tools across our database</p>
        </div>
        <div className="flex justify-center gap-1">
          {["Identifying workflow stages", "Matching tools", "Ranking by fit"].map(
            (step, i) => (
              <span
                key={step}
                className="text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded-full"
                style={{ animationDelay: `${i * 500}ms` }}
              >
                {step}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  )
}

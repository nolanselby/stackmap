"use client"
import { useState } from "react"
import { Download, Copy, Github, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ExportMenuProps {
  shortId: string
}

export function ExportMenu({ shortId }: ExportMenuProps) {
  const [open, setOpen] = useState(false)
  const [ghToken, setGhToken] = useState("")
  const [ghRepo, setGhRepo] = useState("")
  const [ghModalOpen, setGhModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleCopyMarkdown() {
    const res = await fetch(`/api/roadmap/${shortId}/export/markdown`)
    const text = await res.text()
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    setOpen(false)
  }

  async function handleDownloadMarkdown() {
    const res = await fetch(`/api/roadmap/${shortId}/export/markdown`)
    const text = await res.text()
    const blob = new Blob([text], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `roadmap-${shortId}.md`
    a.click()
    URL.revokeObjectURL(url)
    setOpen(false)
  }

  async function handleGitHubExport() {
    if (!ghToken || !ghRepo) return
    const res = await fetch(`/api/roadmap/${shortId}/export/github-issues`)
    const issues: Array<{ title: string; body: string; labels: string[] }> = await res.json()

    const [owner, repo] = ghRepo.split("/")
    let successCount = 0

    for (const issue of issues) {
      try {
        const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ghToken}`,
            "Content-Type": "application/json",
            Accept: "application/vnd.github+json",
          },
          body: JSON.stringify(issue),
        })
        if (ghRes.ok) successCount++
        else {
          const err = await ghRes.json()
          alert(`Failed to create issue: ${err.message}`)
          break
        }
      } catch (e) {
        alert(`Network error: ${String(e)}`)
        break
      }
    }

    if (successCount > 0) {
      alert(`Created ${successCount} GitHub issues in ${ghRepo}`)
      setGhModalOpen(false)
      setGhToken("")
    }
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        className="gap-1.5"
      >
        <Download className="h-3.5 w-3.5" />
        Export
        <ChevronDown className="h-3 w-3" />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-white rounded-xl border border-gray-100 shadow-lg z-20 min-w-[180px] py-1 overflow-hidden">
            <button
              onClick={handleCopyMarkdown}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 flex items-center gap-2.5"
            >
              <Copy className="h-3.5 w-3.5 text-gray-400" />
              {copied ? "Copied!" : "Copy as Markdown"}
            </button>
            <button
              onClick={handleDownloadMarkdown}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 flex items-center gap-2.5"
            >
              <Download className="h-3.5 w-3.5 text-gray-400" />
              Download Markdown
            </button>
            <button
              onClick={() => {
                setGhModalOpen(true)
                setOpen(false)
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 flex items-center gap-2.5"
            >
              <Github className="h-3.5 w-3.5 text-gray-400" />
              GitHub Issues
            </button>
          </div>
        </>
      )}

      {/* GitHub Issues Modal */}
      {ghModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="font-semibold text-gray-800">Export to GitHub Issues</h3>
            <p className="text-xs text-gray-500">
              Your token is held only in this modal and never sent to our servers.
            </p>
            <input
              type="password"
              placeholder="GitHub personal access token"
              value={ghToken}
              onChange={(e) => setGhToken(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <input
              type="text"
              placeholder="owner/repo (e.g. myuser/myproject)"
              value={ghRepo}
              onChange={(e) => setGhRepo(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setGhModalOpen(false)
                  setGhToken("")
                }}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleGitHubExport} disabled={!ghToken || !ghRepo}>
                Create Issues
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

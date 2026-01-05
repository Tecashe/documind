"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, CheckCircle } from "lucide-react"

interface ReviewDocumentProps {
  results: any
  onExport: (format: "docx" | "xlsx") => void
  onReset: () => void
}

export function ReviewDocument({ results, onExport, onReset }: ReviewDocumentProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(results.extractedText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isTabular = results.classification === "spreadsheet"

  return (
    <div className="space-y-6">
      {/* Classification info */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Document Classification</h3>
            <p className="text-sm text-foreground/80">
              {isTabular
                ? "✓ Detected as tabular data - will export to Excel"
                : "✓ Detected as regular document - will export to Word"}
            </p>
          </div>
        </div>
      </Card>

      {/* Extracted text preview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Extracted Content Preview</h3>
          <Button size="sm" variant="ghost" onClick={handleCopy} className="gap-2">
            <Copy className="h-4 w-4" />
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
        <div className="bg-muted/50 p-4 rounded-lg max-h-96 overflow-y-auto whitespace-pre-wrap text-sm font-mono text-foreground/80 break-words">
          {results.extractedText.substring(0, 2000)}
          {results.extractedText.length > 2000 && "..."}
        </div>
      </Card>

      {/* Export options */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Export Options</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => onExport("docx")}
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2"
          >
            <span className="text-2xl">📄</span>
            <span className="text-xs">Export to Word</span>
          </Button>
          <Button
            onClick={() => onExport("xlsx")}
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2"
          >
            <span className="text-2xl">📊</span>
            <span className="text-xs">Export to Excel</span>
          </Button>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onReset} className="flex-1 bg-transparent">
          Process Another Document
        </Button>
      </div>
    </div>
  )
}

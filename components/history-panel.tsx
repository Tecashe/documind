"use client"

import { useState } from "react"
import { Trash2, Copy, ChevronDown } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { DocumentRecord } from "@/hooks/use-document-history"

interface HistoryPanelProps {
  history: DocumentRecord[]
  onRemove: (id: string) => void
  onLoadRecord: (record: DocumentRecord) => void
}

export function HistoryPanel({ history, onRemove, onLoadRecord }: HistoryPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  if (history.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        <p>No processing history yet. Your last 10 documents will appear here.</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Processing History</h3>
      <div className="space-y-2">
        {history.map((record) => (
          <div key={record.id} className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 text-left">
                <p className="font-medium text-sm truncate">{record.filename}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(record.timestamp)} • {formatSize(record.size)}
                </p>
              </div>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded mr-2">{record.classification}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${expandedId === record.id ? "rotate-180" : ""}`} />
            </button>

            {expandedId === record.id && (
              <div className="px-4 py-3 bg-muted/30 border-t border-border space-y-3">
                <div className="text-xs text-muted-foreground bg-background/50 p-2 rounded max-h-24 overflow-y-auto rounded break-words">
                  {record.extractedText.substring(0, 300)}
                  {record.extractedText.length > 300 && "..."}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onLoadRecord(record)}
                    className="flex-1 gap-2 text-xs"
                  >
                    <Copy className="h-3 w-3" />
                    Load
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemove(record.id)}
                    className="gap-2 text-xs text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

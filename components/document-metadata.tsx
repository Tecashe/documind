// components/document/document-metadata.tsx
"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info, Calendar, FileType, Zap, CheckCircle2, Clock, XCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface DocumentMetadataProps {
  document: {
    id: string
    title: string
    fileName: string
    fileSize: number
    fileType: string
    status: string
    documentType: string
    createdAt: Date
    processedAt?: Date | null
    confidence?: number | null
    pages?: number | null
    language?: string | null
  }
}

export function DocumentMetadata({ document }: DocumentMetadataProps) {
  const statusConfig = {
    COMPLETED: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
    PROCESSING: { icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
    PENDING: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    FAILED: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
  }

  const status = statusConfig[document.status as keyof typeof statusConfig] || statusConfig.PENDING
  const StatusIcon = status.icon

  return (
    <Card className="border border-border/40 bg-card/50 backdrop-blur-sm sticky top-4 animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border/40">
        <CardTitle className="text-lg flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          Document Info
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {/* Status */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
          <div className={`flex items-center gap-2 p-3 rounded-lg ${status.bg}`}>
            <StatusIcon className={`h-5 w-5 ${status.color}`} />
            <span className="font-semibold">{document.status}</span>
          </div>
        </div>

        {/* Type */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Document Type</label>
          <Badge variant="outline" className="text-sm py-1.5 px-3">
            <FileType className="h-3.5 w-3.5 mr-1.5" />
            {document.documentType}
          </Badge>
        </div>

        {/* Confidence */}
        {document.confidence && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">AI Confidence</label>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{(document.confidence * 100).toFixed(1)}%</span>
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all"
                  style={{ width: `${document.confidence * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="h-px bg-border" />

        {/* File Details */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">File Size</span>
            <span className="font-medium">{(document.fileSize / 1024 / 1024).toFixed(2)} MB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Format</span>
            <span className="font-medium">{document.fileType.split("/")[1].toUpperCase()}</span>
          </div>
          {document.pages && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pages</span>
              <span className="font-medium">{document.pages}</span>
            </div>
          )}
          {document.language && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Language</span>
              <span className="font-medium">{document.language.toUpperCase()}</span>
            </div>
          )}
        </div>

        <div className="h-px bg-border" />

        {/* Timestamps */}
        <div className="space-y-3 text-sm">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>Uploaded</span>
            </div>
            <p className="font-medium pl-5">{formatDistanceToNow(new Date(document.createdAt), { addSuffix: true })}</p>
          </div>
          {document.processedAt && (
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Processed</span>
              </div>
              <p className="font-medium pl-5">{formatDistanceToNow(new Date(document.processedAt), { addSuffix: true })}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}



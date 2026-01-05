"use client"

import type { Document } from "@prisma/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, MoreVertical, Download, Share2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
//
interface DocumentGridProps {
  documents: Document[]
}

export function DocumentGrid({ documents }: DocumentGridProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Recent Documents</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <Card key={doc.id} className="hover:shadow-lg transition-shadow overflow-hidden">
            <div className="p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <Link href={`/dashboard/documents/${doc.id}`}>
                      <h3 className="font-semibold truncate hover:underline cursor-pointer">{doc.title}</h3>
                    </Link>
                    <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(doc.createdAt))}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical size={16} />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      doc.status === "COMPLETED"
                        ? "bg-green-500"
                        : doc.status === "PROCESSING"
                          ? "bg-yellow-500"
                          : "bg-gray-500"
                    }`}
                  />
                  <span className="text-muted-foreground capitalize">{doc.status.toLowerCase()}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {(doc.fileSize / 1024 / 1024).toFixed(2)} MB • {doc.pages} pages
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Download size={14} />
                  <span className="hidden sm:inline">Export</span>
                </Button>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Share2 size={14} />
                  <span className="hidden sm:inline">Share</span>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

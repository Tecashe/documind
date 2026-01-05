import type { Document } from "@prisma/client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { FileText, Calendar, BookMarked } from "lucide-react"

interface DocumentDetailsProps {
  document: Document & {
    classifications: any
  }
}
//
export function DocumentDetails({ document }: DocumentDetailsProps) {
  const statusColors: Record<string, string> = {
    COMPLETED: "bg-green-500",
    PROCESSING: "bg-yellow-500",
    PENDING: "bg-blue-500",
    FAILED: "bg-red-500",
    ARCHIVED: "bg-gray-500",
  }

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="font-semibold mb-4">Details</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <BookMarked size={16} className="text-muted-foreground" />
            <span className="text-muted-foreground">Type</span>
            <Badge variant="secondary" className="ml-auto">
              {document.documentType}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${statusColors[document.status] || "bg-gray-500"}`} />
            <span className="text-muted-foreground">Status</span>
            <span className="ml-auto font-medium capitalize">{document.status.toLowerCase()}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-muted-foreground" />
            <span className="text-muted-foreground">Uploaded</span>
            <span className="ml-auto">{formatDistanceToNow(new Date(document.createdAt), { addSuffix: true })}</span>
          </div>

          <div className="flex items-center gap-2">
            <FileText size={16} className="text-muted-foreground" />
            <span className="text-muted-foreground">Size</span>
            <span className="ml-auto">{(document.fileSize / 1024 / 1024).toFixed(2)} MB</span>
          </div>

          {document.pages && (
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-muted-foreground" />
              <span className="text-muted-foreground">Pages</span>
              <span className="ml-auto">{document.pages}</span>
            </div>
          )}

          {document.confidence && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Confidence</span>
              <Badge variant="secondary" className="ml-auto">
                {(document.confidence * 100).toFixed(0)}%
              </Badge>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

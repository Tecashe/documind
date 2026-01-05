import { Button } from "@/components/ui/button"
import { FileText, Upload } from "lucide-react"

export function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
        <FileText size={32} className="text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
      <p className="text-muted-foreground mb-6">Upload your first document to get started</p>
      <Button size="lg">
        <Upload size={18} />
        Upload Document
      </Button>
    </div>
  )
}

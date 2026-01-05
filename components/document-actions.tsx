// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Download, Share2, MoreVertical, Copy } from "lucide-react"
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// interface DocumentActionsProps {
//   documentId: string
// }

// export function DocumentActions({ documentId }: DocumentActionsProps) {
//   const [isExporting, setIsExporting] = useState(false)

//   const handleExport = async (format: string) => {
//     setIsExporting(true)
//     try {
//       const response = await fetch(`/api/documents/${documentId}/export`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ format }),
//       })

//       const blob = await response.blob()
//       const url = window.URL.createObjectURL(blob)
//       const a = document.createElement("a")
//       a.href = url
//       a.download = `document.${format}`
//       a.click()
//       window.URL.revokeObjectURL(url)
//     } finally {
//       setIsExporting(false)
//     }
//   }

//   return (
//     <div className="flex gap-2">
//       <DropdownMenu>
//         <DropdownMenuTrigger asChild>
//           <Button variant="outline">
//             <Download size={18} />
//             Export
//           </Button>
//         </DropdownMenuTrigger>
//         <DropdownMenuContent align="end">
//           <DropdownMenuItem onClick={() => handleExport("docx")}>Export as Word (.docx)</DropdownMenuItem>
//           <DropdownMenuItem onClick={() => handleExport("xlsx")}>Export as Excel (.xlsx)</DropdownMenuItem>
//           <DropdownMenuItem onClick={() => handleExport("csv")}>Export as CSV</DropdownMenuItem>
//           <DropdownMenuItem onClick={() => handleExport("json")}>Export as JSON</DropdownMenuItem>
//         </DropdownMenuContent>
//       </DropdownMenu>

//       <Button variant="outline">
//         <Share2 size={18} />
//         Share
//       </Button>

//       <DropdownMenu>
//         <DropdownMenuTrigger asChild>
//           <Button variant="ghost" size="icon">
//             <MoreVertical size={18} />
//           </Button>
//         </DropdownMenuTrigger>
//         <DropdownMenuContent align="end">
//           <DropdownMenuItem onClick={() => navigator.clipboard.writeText(documentId)}>
//             <Copy size={14} className="mr-2" />
//             Copy ID
//           </DropdownMenuItem>
//         </DropdownMenuContent>
//       </DropdownMenu>
//     </div>
//   )
// }


"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  FileCode,
  File as FilePdf,
  RefreshCw,
  Trash2,
  Share2,
  MoreVertical,
  Loader2,
} from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface DocumentActionsProps {
  doc: {  // ✅ Changed from 'document' to 'doc' to avoid shadowing
    id: string
    title: string
    status: string
  }
}

export function DocumentActions({ doc }: DocumentActionsProps) {  // ✅ Updated here too
  const router = useRouter()
  const [isDownloading, setIsDownloading] = useState(false)
  const [isReprocessing, setIsReprocessing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDownload = async (format: string) => {
    setIsDownloading(true)
    try {
      const response = await fetch(`/api/documents/${doc.id}/export`, {  // ✅ Changed to doc
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format }),
      })

      if (!response.ok) throw new Error("Export failed")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")  // ✅ Now accesses global document
      a.href = url
      a.download = `${doc.title}.${format}`  // ✅ Changed to doc
      document.body.appendChild(a)  // ✅ Now works correctly
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)  // ✅ Now works correctly
    } catch (error) {
      console.error("Download error:", error)
      alert("Download failed. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  const handleReprocess = async () => {
    setIsReprocessing(true)
    try {
      const response = await fetch(`/api/documents/${doc.id}/process`, {  // ✅ Changed to doc
        method: "POST",
      })

      if (!response.ok) throw new Error("Reprocess failed")

      router.refresh()
    } catch (error) {
      console.error("Reprocess error:", error)
      alert("Reprocess failed. Please try again.")
    } finally {
      setIsReprocessing(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this document? This action cannot be undone.")) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/documents/${doc.id}`, {  // ✅ Changed to doc
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Delete failed")

      router.push("/dashboard")
    } catch (error) {
      console.error("Delete error:", error)
      alert("Delete failed. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Quick Download */}
      {doc.status === "COMPLETED" && (  // ✅ Changed to doc
        <Button
          onClick={() => handleDownload("docx")}
          disabled={isDownloading}
          className="shadow-lg hover:shadow-xl transition-all"
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export as Word
            </>
          )}
        </Button>
      )}

      {/* More Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="shadow-lg">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Export Options</DropdownMenuLabel>
          {doc.status === "COMPLETED" && (  // ✅ Changed to doc
            <>
              <DropdownMenuItem
                disabled={isDownloading}
                onClick={() => handleDownload("docx")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Export as Word (.docx)
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={isDownloading}
                onClick={() => handleDownload("xlsx")}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export as Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={isDownloading}
                onClick={() => handleDownload("pdf")}
              >
                <FilePdf className="h-4 w-4 mr-2" />
                Export as PDF (.pdf)
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={isDownloading}
                onClick={() => handleDownload("csv")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Export as CSV (.csv)
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={isDownloading}
                onClick={() => handleDownload("json")}
              >
                <FileJson className="h-4 w-4 mr-2" />
                Export as JSON (.json)
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={isDownloading}
                onClick={() => handleDownload("markdown")}
              >
                <FileCode className="h-4 w-4 mr-2" />
                Export as Markdown (.md)
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          
          <DropdownMenuItem onClick={handleReprocess} disabled={isReprocessing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isReprocessing ? "animate-spin" : ""}`} />
            Reprocess Document
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => alert("Share feature coming soon!")}>
            <Share2 className="h-4 w-4 mr-2" />
            Share Document
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? "Deleting..." : "Delete Document"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

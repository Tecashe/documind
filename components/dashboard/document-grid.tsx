// "use client"

// import type { Document } from "@prisma/client"
// import { Card } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { FileText, MoreVertical, Download, Share2 } from "lucide-react"
// import { formatDistanceToNow } from "date-fns"
// import Link from "next/link"
// //
// interface DocumentGridProps {
//   documents: Document[]
// }

// export function DocumentGrid({ documents }: DocumentGridProps) {
//   return (
//     <div className="space-y-4">
//       <h2 className="text-lg font-semibold">Recent Documents</h2>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {documents.map((doc) => (
//           <Card key={doc.id} className="hover:shadow-lg transition-shadow overflow-hidden">
//             <div className="p-4 space-y-4">
//               <div className="flex items-start justify-between">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
//                     <FileText className="w-6 h-6 text-primary" />
//                   </div>
//                   <div className="min-w-0">
//                     <Link href={`/dashboard/documents/${doc.id}`}>
//                       <h3 className="font-semibold truncate hover:underline cursor-pointer">{doc.title}</h3>
//                     </Link>
//                     <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(doc.createdAt))}</p>
//                   </div>
//                 </div>
//                 <Button variant="ghost" size="sm">
//                   <MoreVertical size={16} />
//                 </Button>
//               </div>

//               <div className="space-y-2">
//                 <div className="flex items-center gap-2 text-sm">
//                   <div
//                     className={`w-2 h-2 rounded-full ${
//                       doc.status === "COMPLETED"
//                         ? "bg-green-500"
//                         : doc.status === "PROCESSING"
//                           ? "bg-yellow-500"
//                           : "bg-gray-500"
//                     }`}
//                   />
//                   <span className="text-muted-foreground capitalize">{doc.status.toLowerCase()}</span>
//                 </div>
//                 <p className="text-xs text-muted-foreground">
//                   {(doc.fileSize / 1024 / 1024).toFixed(2)} MB • {doc.pages} pages
//                 </p>
//               </div>

//               <div className="flex gap-2 pt-2">
//                 <Button variant="outline" size="sm" className="flex-1 bg-transparent">
//                   <Download size={14} />
//                   <span className="hidden sm:inline">Export</span>
//                 </Button>
//                 <Button variant="outline" size="sm" className="flex-1 bg-transparent">
//                   <Share2 size={14} />
//                   <span className="hidden sm:inline">Share</span>
//                 </Button>
//               </div>
//             </div>
//           </Card>
//         ))}
//       </div>
//     </div>
//   )
// }

// "use client"

// import { useState } from "react"
// import { Card } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
//   DropdownMenuSeparator,
// } from "@/components/ui/dropdown-menu"
// import {
//   FileText,
//   Download,
//   Share2,
//   Trash2,
//   MoreVertical,
//   CheckCircle2,
//   Clock,
//   XCircle,
//   FileSpreadsheet,
//   FileJson,
//   FileCode,
//   File as FilePdf,
//   Loader2,
// } from "lucide-react"
// import { formatDistanceToNow } from "date-fns"
// import { useRouter } from "next/navigation"
// import type { Document } from "@prisma/client"

// interface DocumentGridProps {
//   documents: (Document & { owner: { firstName: string | null; lastName: string | null } })[]
// }

// export function DocumentGrid({ documents }: DocumentGridProps) {
//   const router = useRouter()
//   const [downloadingId, setDownloadingId] = useState<string | null>(null)

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case "COMPLETED":
//         return <CheckCircle2 className="h-4 w-4 text-green-500" />
//       case "PROCESSING":
//         return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
//       case "PENDING":
//         return <Clock className="h-4 w-4 text-yellow-500" />
//       case "FAILED":
//         return <XCircle className="h-4 w-4 text-red-500" />
//       default:
//         return <Clock className="h-4 w-4 text-gray-500" />
//     }
//   }

//   const getStatusBadge = (status: string) => {
//     const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
//       COMPLETED: "default",
//       PROCESSING: "secondary",
//       PENDING: "outline",
//       FAILED: "destructive",
//     }
//     return <Badge variant={variants[status] || "outline"}>{status}</Badge>
//   }

//   const getDocumentTypeIcon = (type: string) => {
//     switch (type) {
//       case "INVOICE":
//       case "RECEIPT":
//       case "FINANCIAL":
//         return <FileSpreadsheet className="h-5 w-5 text-green-500" />
//       case "CONTRACT":
//       case "LEGAL":
//         return <FileText className="h-5 w-5 text-blue-500" />
//       case "FORM":
//         return <FileCode className="h-5 w-5 text-purple-500" />
//       default:
//         return <FileText className="h-5 w-5 text-gray-500" />
//     }
//   }

//   const handleDownload = async (docId: string, format: string) => {
//     setDownloadingId(docId)
//     try {
//       const response = await fetch(`/api/documents/${docId}/export`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ format }),
//       })

//       if (!response.ok) throw new Error("Export failed")

//       const blob = await response.blob()
//       const url = window.URL.createObjectURL(blob)
//       const a = document.createElement("a")
//       a.href = url
//       a.download = `document.${format}`
//       document.body.appendChild(a)
//       a.click()
//       window.URL.revokeObjectURL(url)
//       document.body.removeChild(a)
//     } catch (error) {
//       console.error("Download error:", error)
//       alert("Download failed. Please try again.")
//     } finally {
//       setDownloadingId(null)
//     }
//   }

//   const handleDelete = async (docId: string) => {
//     if (!confirm("Are you sure you want to delete this document?")) return

//     try {
//       const response = await fetch(`/api/documents/${docId}`, {
//         method: "DELETE",
//       })

//       if (!response.ok) throw new Error("Delete failed")

//       router.refresh()
//     } catch (error) {
//       console.error("Delete error:", error)
//       alert("Delete failed. Please try again.")
//     }
//   }

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//       {documents.map((doc) => (
//         <Card
//           key={doc.id}
//           className="group hover:shadow-lg transition-all duration-300 border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden cursor-pointer"
//           onClick={() => router.push(`/documents/${doc.id}`)}
//         >
//           <div className="p-5 space-y-4">
//             {/* Header */}
//             <div className="flex items-start justify-between gap-3">
//               <div className="flex items-start gap-3 flex-1 min-w-0">
//                 <div className="mt-0.5">{getDocumentTypeIcon(doc.documentType)}</div>
//                 <div className="flex-1 min-w-0">
//                   <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
//                     {doc.title}
//                   </h3>
//                   <p className="text-xs text-muted-foreground truncate mt-0.5">{doc.fileName}</p>
//                 </div>
//               </div>

//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
//                   <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
//                     <MoreVertical className="h-4 w-4" />
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end" className="w-48">
//                   <DropdownMenuItem onClick={(e) => {
//                     e.stopPropagation()
//                     router.push(`/documents/${doc.id}`)
//                   }}>
//                     <FileText className="h-4 w-4 mr-2" />
//                     View Details
//                   </DropdownMenuItem>
                  
//                   {doc.status === "COMPLETED" && (
//                     <>
//                       <DropdownMenuSeparator />
//                       <DropdownMenuItem
//                         disabled={downloadingId === doc.id}
//                         onClick={(e) => {
//                           e.stopPropagation()
//                           handleDownload(doc.id, "docx")
//                         }}
//                       >
//                         <FileText className="h-4 w-4 mr-2" />
//                         Export as Word
//                       </DropdownMenuItem>
//                       <DropdownMenuItem
//                         disabled={downloadingId === doc.id}
//                         onClick={(e) => {
//                           e.stopPropagation()
//                           handleDownload(doc.id, "xlsx")
//                         }}
//                       >
//                         <FileSpreadsheet className="h-4 w-4 mr-2" />
//                         Export as Excel
//                       </DropdownMenuItem>
//                       <DropdownMenuItem
//                         disabled={downloadingId === doc.id}
//                         onClick={(e) => {
//                           e.stopPropagation()
//                           handleDownload(doc.id, "pdf")
//                         }}
//                       >
//                         <FilePdf className="h-4 w-4 mr-2" />
//                         Export as PDF
//                       </DropdownMenuItem>
//                       <DropdownMenuItem
//                         disabled={downloadingId === doc.id}
//                         onClick={(e) => {
//                           e.stopPropagation()
//                           handleDownload(doc.id, "json")
//                         }}
//                       >
//                         <FileJson className="h-4 w-4 mr-2" />
//                         Export as JSON
//                       </DropdownMenuItem>
//                       <DropdownMenuItem
//                         disabled={downloadingId === doc.id}
//                         onClick={(e) => {
//                           e.stopPropagation()
//                           handleDownload(doc.id, "markdown")
//                         }}
//                       >
//                         <FileCode className="h-4 w-4 mr-2" />
//                         Export as Markdown
//                       </DropdownMenuItem>
//                     </>
//                   )}

//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem
//                     onClick={(e) => {
//                       e.stopPropagation()
//                       // TODO: Implement share modal
//                       alert("Share feature coming soon!")
//                     }}
//                   >
//                     <Share2 className="h-4 w-4 mr-2" />
//                     Share
//                   </DropdownMenuItem>
//                   <DropdownMenuItem
//                     className="text-destructive"
//                     onClick={(e) => {
//                       e.stopPropagation()
//                       handleDelete(doc.id)
//                     }}
//                   >
//                     <Trash2 className="h-4 w-4 mr-2" />
//                     Delete
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>

//             {/* Status & Type */}
//             <div className="flex items-center gap-2 flex-wrap">
//               <div className="flex items-center gap-1.5">
//                 {getStatusIcon(doc.status)}
//                 {getStatusBadge(doc.status)}
//               </div>
//               <Badge variant="outline" className="text-xs">
//                 {doc.documentType}
//               </Badge>
//             </div>

//             {/* Metadata */}
//             <div className="space-y-1.5 text-xs text-muted-foreground">
//               <div className="flex items-center justify-between">
//                 <span>Size:</span>
//                 <span className="font-medium">{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
//               </div>
//               {doc.confidence && (
//                 <div className="flex items-center justify-between">
//                   <span>Confidence:</span>
//                   <span className="font-medium">{(doc.confidence * 100).toFixed(1)}%</span>
//                 </div>
//               )}
//               <div className="flex items-center justify-between">
//                 <span>Uploaded:</span>
//                 <span className="font-medium">{formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}</span>
//               </div>
//             </div>

//             {/* Action Button */}
//             {doc.status === "COMPLETED" && (
//               <Button
//                 variant="outline"
//                 size="sm"
//                 className="w-full"
//                 onClick={(e) => {
//                   e.stopPropagation()
//                   handleDownload(doc.id, "docx")
//                 }}
//                 disabled={downloadingId === doc.id}
//               >
//                 {downloadingId === doc.id ? (
//                   <>
//                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                     Downloading...
//                   </>
//                 ) : (
//                   <>
//                     <Download className="h-4 w-4 mr-2" />
//                     Quick Download (Word)
//                   </>
//                 )}
//               </Button>
//             )}

//             {doc.status === "PROCESSING" && (
//               <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
//                 <div className="h-full bg-primary animate-pulse" style={{ width: "60%" }} />
//               </div>
//             )}
//           </div>
//         </Card>
//       ))}
//     </div>
//   )
// }


"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  FileText,
  Download,
  Share2,
  Trash2,
  MoreVertical,
  CheckCircle2,
  Clock,
  XCircle,
  FileSpreadsheet,
  FileJson,
  FileCode,
  File as FilePdf,
  Loader2,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Document } from "@prisma/client"

interface DocumentGridProps {
  documents: (Document & { owner: { firstName: string | null; lastName: string | null } })[]
}

export function DocumentGrid({ documents }: DocumentGridProps) {
  const router = useRouter()
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "PROCESSING":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "FAILED":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      COMPLETED: "default",
      PROCESSING: "secondary",
      PENDING: "outline",
      FAILED: "destructive",
    }
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>
  }

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case "INVOICE":
      case "RECEIPT":
      case "FINANCIAL":
        return <FileSpreadsheet className="h-5 w-5 text-green-500" />
      case "CONTRACT":
      case "LEGAL":
        return <FileText className="h-5 w-5 text-blue-500" />
      case "FORM":
        return <FileCode className="h-5 w-5 text-purple-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const handleDownload = async (docId: string, format: string) => {
    setDownloadingId(docId)
    const toastId = toast.loading(`Exporting as ${format.toUpperCase()}...`)
    
    try {
      const response = await fetch(`/api/documents/${docId}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Export failed")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `document.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("Downloaded successfully!", { id: toastId })
    } catch (error) {
      console.error("Download error:", error)
      toast.error(error instanceof Error ? error.message : "Download failed", { id: toastId })
    } finally {
      setDownloadingId(null)
    }
  }

  const handleDelete = async (docId: string) => {
    const toastId = toast.loading("Deleting document...")

    try {
      const response = await fetch(`/api/documents/${docId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Delete failed")

      toast.success("Document deleted successfully!", { id: toastId })
      router.refresh()
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Failed to delete document", { id: toastId })
    }
  }

  const confirmDelete = (docId: string, title: string) => {
    toast.warning(`Delete "${title}"?`, {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: () => handleDelete(docId),
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc) => (
        <Card
          key={doc.id}
          className="group hover:shadow-lg transition-all duration-300 border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden cursor-pointer"
          onClick={() => router.push(`/documents/${doc.id}`)}
        >
          <div className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="mt-0.5">{getDocumentTypeIcon(doc.documentType)}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{doc.fileName}</p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/documents/${doc.id}`)
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>

                  {doc.status === "COMPLETED" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        disabled={downloadingId === doc.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownload(doc.id, "docx")
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Export as Word
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={downloadingId === doc.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownload(doc.id, "xlsx")
                        }}
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export as Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={downloadingId === doc.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownload(doc.id, "pdf")
                        }}
                      >
                        <FilePdf className="h-4 w-4 mr-2" />
                        Export as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={downloadingId === doc.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownload(doc.id, "json")
                        }}
                      >
                        <FileJson className="h-4 w-4 mr-2" />
                        Export as JSON
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={downloadingId === doc.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownload(doc.id, "markdown")
                        }}
                      >
                        <FileCode className="h-4 w-4 mr-2" />
                        Export as Markdown
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      toast.info("Share feature coming soon!")
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" 
                   onClick={(e) => { e.stopPropagation() 
                   confirmDelete(doc.id, doc.title) }} > 
                   <Trash2 className="h-4 w-4 mr-2" /> 
                   Delete 
                   </DropdownMenuItem> 
                   </DropdownMenuContent> 
                   </DropdownMenu> 
                   </div>
                   {/* Status & Type */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  {getStatusIcon(doc.status)}
                  {getStatusBadge(doc.status)}
                </div>
                <Badge variant="outline" className="text-xs">
                  {doc.documentType}
                </Badge>
              </div>

              {/* Metadata */}
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Size:</span>
                  <span className="font-medium">{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                {doc.confidence && (
                  <div className="flex items-center justify-between">
                    <span>Confidence:</span>
                    <span className="font-medium">{(doc.confidence * 100).toFixed(1)}%</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Uploaded:</span>
                  <span className="font-medium">
                    {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              {doc.status === "COMPLETED" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownload(doc.id, "docx")
                  }}
                  disabled={downloadingId === doc.id}
                >
                  {downloadingId === doc.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Quick Download (Word)
                    </>
                  )}
                </Button>
              )}

              {doc.status === "PROCESSING" && (
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary animate-pulse" style={{ width: "60%" }} />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
  )
}
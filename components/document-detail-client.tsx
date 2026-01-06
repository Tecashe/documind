
// ============================================
// components/document/document-detail-client.tsx
// ============================================
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Play,
  Download,
  Share2,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  FileText,
  FileSpreadsheet,
  FileJson,
  FileCode,
  File as FilePdf,
  Eye,
  Code,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Database,
  Table as TableIcon,
  Info,
  Calendar,
  FileType,
  Zap,
  Mail,
  UserPlus,
  X,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import ReactMarkdown from "react-markdown"

interface DocumentDetailClientProps {
  document: any
  user: any
}

export function DocumentDetailClient({ document: initialDocument, user }: DocumentDetailClientProps) {
  const router = useRouter()
  const [document, setDocument] = useState(initialDocument)
  const [isProcessing, setIsProcessing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [activeTab, setActiveTab] = useState("formatted")
  const [isDownloading, setIsDownloading] = useState(false)
  const [shareEmail, setShareEmail] = useState("")
  const [isSharing, setIsSharing] = useState(false)

  // Auto-refresh when processing
  useEffect(() => {
    if (document.status === "PROCESSING") {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/documents/${document.id}`)
          if (response.ok) {
            const updated = await response.json()
            setDocument(updated)
            
            if (updated.status === "COMPLETED") {
              toast.success("Document processed successfully!")
              clearInterval(interval)
              router.refresh()
            } else if (updated.status === "FAILED") {
              toast.error("Document processing failed")
              clearInterval(interval)
            }
          }
        } catch (error) {
          console.error("Failed to fetch document status:", error)
        }
      }, 3000) // Poll every 3 seconds

      return () => clearInterval(interval)
    }
  }, [document.status, document.id, router])

  const handleProcess = async () => {
    setIsProcessing(true)
    const toastId = toast.loading("Starting document processing...")

    try {
      const response = await fetch(`/api/documents/${document.id}/process`, {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Processing failed")
      }

      toast.success("Processing started! This may take a few moments.", { id: toastId })
      setDocument({ ...document, status: "PROCESSING" })
    } catch (error) {
      console.error("Process error:", error)
      toast.error(error instanceof Error ? error.message : "Processing failed", { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = async (format: string) => {
    setIsDownloading(true)
    const toastId = toast.loading(`Exporting as ${format.toUpperCase()}...`)

    try {
      const response = await fetch(`/api/documents/${document.id}/export`, {
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
      const a = globalThis.document.createElement("a")
      a.href = url
      a.download = `${document.title}.${format}`
      globalThis.document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      globalThis.document.body.removeChild(a)

      toast.success("Document exported successfully!", { id: toastId })
    } catch (error) {
      console.error("Download error:", error)
      toast.error(error instanceof Error ? error.message : "Export failed", { id: toastId })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleCopy = () => {
    if (document.content?.rawText) {
      navigator.clipboard.writeText(document.content.rawText)
      setCopied(true)
      toast.success("Text copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDelete = async () => {
    const toastId = toast.loading("Deleting document...")

    try {
      const response = await fetch(`/api/documents/${document.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Delete failed")

      toast.success("Document deleted successfully!", { id: toastId })
      router.push("/dashboard")
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Failed to delete document", { id: toastId })
    }
  }

  const confirmDelete = () => {
    toast.warning(`Delete "${document.title}"?`, {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: handleDelete,
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    })
  }

  const handleShare = async () => {
    if (!shareEmail) {
      toast.error("Please enter an email address")
      return
    }

    setIsSharing(true)
    const toastId = toast.loading("Sharing document...")

    try {
      const response = await fetch(`/api/documents/${document.id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: shareEmail, role: "VIEWER" }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Share failed")
      }

      setShareEmail("")
      toast.success(`Document shared with ${shareEmail}`, { id: toastId })
      router.refresh()
    } catch (error) {
      console.error("Share error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to share document", { id: toastId })
    } finally {
      setIsSharing(false)
    }
  }

  const getStatusConfig = () => {
    const configs = {
      PENDING: { 
        icon: Clock, 
        color: "text-yellow-500", 
        bg: "bg-yellow-500/10",
        badge: "outline" as const,
      },
      PROCESSING: { 
        icon: Loader2, 
        color: "text-blue-500", 
        bg: "bg-blue-500/10",
        badge: "secondary" as const,
      },
      COMPLETED: { 
        icon: CheckCircle2, 
        color: "text-green-500", 
        bg: "bg-green-500/10",
        badge: "default" as const,
      },
      FAILED: { 
        icon: XCircle, 
        color: "text-red-500", 
        bg: "bg-red-500/10",
        badge: "destructive" as const,
      },
    }
    return configs[document.status as keyof typeof configs] || configs.PENDING
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon
  const isPDF = document.fileType === "application/pdf"
  const isImage = document.fileType.startsWith("image/")
  const wordCount = document.content?.rawText?.split(/\s+/).length || 0
  const charCount = document.content?.rawText?.length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Floating background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] animate-float rounded-full bg-primary/5 blur-3xl" />
        <div
          className="absolute right-1/4 bottom-0 h-[500px] w-[500px] animate-float rounded-full bg-primary/5 blur-3xl"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 animate-fadeInUp">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4 group">
              <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                {document.title}
              </h1>
              <p className="text-muted-foreground">{document.fileName}</p>
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusConfig.bg}`}>
                  <StatusIcon className={`h-4 w-4 ${statusConfig.color} ${document.status === "PROCESSING" ? "animate-spin" : ""}`} />
                  <Badge variant={statusConfig.badge}>{document.status}</Badge>
                </div>
                <Badge variant="outline">{document.documentType}</Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Process Button */}
              {document.status === "PENDING" && (
                <Button
                  onClick={handleProcess}
                  disabled={isProcessing}
                  size="lg"
                  className="shadow-lg hover:shadow-xl transition-all"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Process Document
                    </>
                  )}
                </Button>
              )}

              {/* Quick Download */}
              {document.status === "COMPLETED" && (
                <Button
                  onClick={() => handleDownload("docx")}
                  disabled={isDownloading}
                  size="lg"
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
                  <Button variant="outline" size="lg" className="shadow-lg">
                    <FileText className="h-4 w-4 mr-2" />
                    More Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                  {document.status === "COMPLETED" && (
                    <>
                      <DropdownMenuItem disabled={isDownloading} onClick={() => handleDownload("docx")}>
                        <FileText className="h-4 w-4 mr-2" />
                        Export as Word
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={isDownloading} onClick={() => handleDownload("xlsx")}>
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export as Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={isDownloading} onClick={() => handleDownload("pdf")}>
                        <FilePdf className="h-4 w-4 mr-2" />
                        Export as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={isDownloading} onClick={() => handleDownload("csv")}>
                        <FileText className="h-4 w-4 mr-2" />
                        Export as CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={isDownloading} onClick={() => handleDownload("json")}>
                        <FileJson className="h-4 w-4 mr-2" />
                        Export as JSON
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={isDownloading} onClick={() => handleDownload("markdown")}>
                        <FileCode className="h-4 w-4 mr-2" />
                        Export as Markdown
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>

                  {document.status === "COMPLETED" && (
                    <DropdownMenuItem onClick={handleCopy}>
                      {copied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
                      Copy Text
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem onClick={handleProcess} disabled={document.status === "PROCESSING"}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${document.status === "PROCESSING" ? "animate-spin" : ""}`} />
                    Reprocess
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={confirmDelete} className="text-destructive focus:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Document
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Document Viewer */}
            <Card className="overflow-hidden border border-border/40 bg-card/50 backdrop-blur-sm shadow-xl animate-fadeInUp">
              <div className="bg-muted/30 border-b border-border/40 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-sm font-medium">Live Preview</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {document.fileType.split("/")[1].toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setZoom((prev) => Math.max(prev - 25, 50))} disabled={zoom <= 50}>
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-xs font-medium min-w-[4ch] text-center">{zoom}%</span>
                    <Button variant="ghost" size="sm" onClick={() => setZoom((prev) => Math.min(prev + 25, 200))} disabled={zoom >= 200}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-4 bg-border mx-1" />
                    <Button variant="ghost" size="sm" onClick={() => setRotation((prev) => (prev + 90) % 360)}>
                      <RotateCw className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={document.fileUrl} download={document.title}>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-muted/10 p-6 min-h-[600px] flex items-center justify-center relative overflow-auto">
                {document.status === "PENDING" && (
                  <div className="text-center space-y-4">
                    <div className="inline-block h-16 w-16 rounded-full border-4 border-solid border-muted-foreground/20 border-t-primary animate-spin" />
                    <div className="space-y-2">
                      <p className="text-lg font-medium">Ready to Process</p>
                      <p className="text-sm text-muted-foreground">Click "Process Document" to extract text and analyze content</p>
                    </div>
                    <Button onClick={handleProcess} size="lg" className="mt-4">
                      <Play className="h-5 w-5 mr-2" />
                      Start Processing
                    </Button>
                  </div>
                )}

                {document.status === "PROCESSING" && (
                  <div className="text-center space-y-4">
                    <Loader2 className="inline-block h-16 w-16 animate-spin text-primary" />
                    <div className="space-y-2">
                      <p className="text-lg font-medium">Processing document...</p>
                      <p className="text-sm text-muted-foreground">Extracting text, analyzing content, and classifying document type</p>
                    </div>
                    <div className="w-full max-w-xs mx-auto h-2 bg-muted rounded-full overflow-hidden mt-4">
                      <div className="h-full bg-primary animate-pulse" style={{ width: "60%" }} />
                    </div>
                  </div>
                )}

                {document.status === "FAILED" && (
                  <div className="text-center space-y-4">
                    <XCircle className="inline-block h-16 w-16 text-destructive" />
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-destructive">Processing Failed</p>
                      <p className="text-sm text-muted-foreground">Unable to process this document. Try reprocessing or contact support.</p>
                    </div>
                    <Button onClick={handleProcess} variant="outline" size="lg" className="mt-4">
                      <RefreshCw className="h-5 w-5 mr-2" />
                      Retry Processing
                    </Button>
                  </div>
                )}

                {document.status === "COMPLETED" && isPDF && (
                  <div className="w-full max-w-4xl">
                    <iframe
                      src={`${document.fileUrl}#toolbar=0`}
                      className="w-full h-[600px] rounded-lg border border-border/40 shadow-lg"
                      style={{
                        transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                        transformOrigin: "center center",
                      }}
                    />
                  </div>
                )}

                {document.status === "COMPLETED" && isImage && (
                  <div
                    className="relative max-w-4xl transition-transform duration-300"
                    style={{
                      transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    }}
                  >
                    <Image
                      src={document.fileUrl}
                      alt={document.title}
                      width={800}
                      height={600}
                      className="rounded-lg border border-border/40 shadow-lg object-contain"
                    />
                  </div>
                )}
              </div>
            </Card>

            {/* Extracted Content */}
            {document.status === "COMPLETED" && document.content?.rawText && (
              <Card className="border border-border/40 bg-card/50 backdrop-blur-sm animate-fadeInUp overflow-hidden" style={{ animationDelay: "0.1s" }}>
                <div className="bg-gradient-to-r from-muted/30 to-muted/10 border-b border-border/40 px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-semibold">Extracted Content</h3>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{wordCount.toLocaleString()} words</span>
                        <span>•</span>
                        <span>{charCount.toLocaleString()} characters</span>
                        {document.confidence && (
                          <>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">
                              {(document.confidence * 100).toFixed(1)}% confidence
                            </Badge>
                          </>
                        )}
                        {document.language && (
                          <>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">
                              {document.language.toUpperCase()}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>

                    <Button variant="outline" size="sm" onClick={handleCopy} className="shadow-sm">
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Text
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="border-b border-border/40 bg-muted/20 px-6">
                    <TabsList className="bg-transparent h-auto p-0 border-none">
                      <TabsTrigger
                        value="formatted"
                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Formatted
                      </TabsTrigger>
                      <TabsTrigger
                        value="raw"
                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3"
                      >
                        <Code className="h-4 w-4 mr-2" />
                        Raw Text
                      </TabsTrigger>
                      {document.content.markdown && (
                        <TabsTrigger
                          value="markdown"
                          className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Markdown
                        </TabsTrigger>
                      )}
                    </TabsList>
                  </div>

                  <TabsContent value="formatted" className="p-6 m-0">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed bg-muted/30 rounded-lg p-6 border border-border/40">
                        {document.content.rawText}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="raw" className="p-6 m-0">
                    <pre className="bg-muted/30 rounded-lg p-6 border border-border/40 overflow-auto max-h-[600px]">
                      <code className="text-xs font-mono">{document.content.rawText}</code>
                    </pre>
                  </TabsContent>

                  {document.content.markdown && (
                    <TabsContent value="markdown" className="p-6 m-0">
                      <div className="prose prose-sm max-w-none dark:prose-invert bg-muted/30 rounded-lg p-6 border border-border/40">
                        <ReactMarkdown>{document.content.markdown}</ReactMarkdown>
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </Card>
            )}

            {/* Tables */}
            {document.status === "COMPLETED" && document.tables && document.tables.length > 0 && (
              <div className="space-y-6">
                {document.tables.map((table: any, idx: number) => (
                  <Card
                    key={table.id}
                    className="border border-border/40 bg-card/50 backdrop-blur-sm animate-fadeInUp overflow-hidden"
                    style={{ animationDelay: `${0.2 + idx * 0.1}s` }}
                  >
                    <div className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border/40 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TableIcon className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-semibold">{table.title || `Table ${idx + 1}`}</h3>
                        </div>
                        <Badge variant="outline">Page {table.pageNum}</Badge>
                      </div>
                    </div>
                    <div className="p-0 overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30 hover:bg-muted/40">
                            {table.headers.map((header: string, i: number) => (
                              <TableHead key={i} className="font-semibold">
                                {header}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {table.rows.map((row: any, rowIdx: number) => (
                            <TableRow key={rowIdx} className="hover:bg-muted/20">
                              {table.headers.map((header: string, cellIdx: number) => (
                                <TableCell key={cellIdx}>{String(row[header] || "")}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Metadata & Actions */}
          <div className="space-y-6">
            {/* Document Metadata */}
            <Card className="border border-border/40 bg-card/50 backdrop-blur-sm sticky top-4 animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
              <div className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border/40 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Document Info</h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {/* Status */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${statusConfig.bg}`}>
                    <StatusIcon className={`h-5 w-5 ${statusConfig.color} ${document.status === "PROCESSING" ? "animate-spin" : ""}`} />
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
              </div>
            </Card>

            {/* Extracted Fields */}
            {document.status === "COMPLETED" && document.fields && document.fields.length > 0 && (
              <Card className="border border-border/40 bg-card/50 backdrop-blur-sm animate-fadeInUp" style={{ animationDelay: "0.3s" }}>
                <div className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border/40 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Extracted Fields</h3>
                    </div>
                    <Badge variant="secondary">{document.fields.length}</Badge>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  {document.fields.map((field: any) => (
                    <div
                      key={field.id}
                      className="p-4 rounded-lg bg-muted/30 border border-border/40 space-y-2 hover:bg-muted/50 transition-colors"
                    >
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {field.label}
                      </label>
                      <p className="text-sm font-medium">{field.value}</p>
                      <Badge variant="outline" className="text-xs">
                        {(field.confidence * 100).toFixed(1)}% confidence
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Share Document */}
            <Card className="border border-border/40 bg-card/50 backdrop-blur-sm animate-fadeInUp" style={{ animationDelay: "0.4s" }}>
              <div className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border/40 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Share Document</h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      className="pl-9"
                      disabled={isSharing}
                    />
                  </div>
                  <Button onClick={handleShare} disabled={isSharing || !shareEmail}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>

                {document.shares && document.shares.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Shared With ({document.shares.length})
                    </label>
                    <div className="space-y-2">
                      {document.shares.map((share: any) => (
                        <div
                          key={share.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {share.user.email[0].toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{share.user.email}</p>
                              <Badge variant="secondary" className="text-xs mt-0.5">
                                {share.role}
                              </Badge>
                            </div>
                          </div>
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="border border-border/40 bg-card/50 backdrop-blur-sm animate-fadeInUp" style={{ animationDelay: "0.5s" }}>
              <div className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border/40 px-6 py-4">
                <h3 className="text-lg font-semibold">Quick Actions</h3>
              </div>
              <div className="p-6 space-y-2">
                {document.status === "PENDING" && (
                  <Button onClick={handleProcess} disabled={isProcessing} className="w-full justify-start" variant="outline">
                    <Play className="h-4 w-4 mr-2" />
                    Process Document
                  </Button>
                )}

                {document.status === "COMPLETED" && (
                  <>
                    <Button onClick={handleCopy} className="w-full justify-start" variant="outline">
                      {copied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
                      Copy All Text
                    </Button>

                    <Button onClick={() => handleDownload("docx")} disabled={isDownloading} className="w-full justify-start" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Download as Word
                    </Button>

                    <Button onClick={() => handleDownload("xlsx")} disabled={isDownloading} className="w-full justify-start" variant="outline">
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Download as Excel
                    </Button>
                  </>
                )}

                <Button onClick={handleProcess} disabled={document.status === "PROCESSING"} className="w-full justify-start" variant="outline">
                  <RefreshCw className={`h-4 w-4 mr-2 ${document.status === "PROCESSING" ? "animate-spin" : ""}`} />
                  Reprocess
                </Button>

                <Button onClick={confirmDelete} className="w-full justify-start text-destructive hover:bg-destructive/10" variant="outline">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Document
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
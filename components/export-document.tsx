// "use client"

// import { useState } from "react"
// import { Card } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { CheckCircle, Download } from "lucide-react"

// interface ExportDocumentProps {
//   results: any
//   onReset: () => void
// }

// export function ExportDocument({ results, onReset }: ExportDocumentProps) {
//   const [exporting, setExporting] = useState(false)
//   const [exported, setExported] = useState<"docx" | "xlsx" | null>(null)

//   const handleExport = async (format: "docx" | "xlsx") => {
//     setExporting(true)
//     try {
//       const response = await fetch("/api/export-document", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           text: results.extractedText,
//           format,
//           classification: results.classification,
//         }),
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

//       setExported(format)
//     } catch (err) {
//       console.error("Export error:", err)
//     } finally {
//       setExporting(false)
//     }
//   }

//   return (
//     <div className="space-y-6">
//       <Card className="p-8 text-center">
//         <div className="mb-6">
//           <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
//             <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
//           </div>
//           <h2 className="text-2xl font-bold mb-2">Ready to Export</h2>
//           <p className="text-muted-foreground">Your document has been processed and is ready to download</p>
//         </div>

//         <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
//           <Button
//             onClick={() => handleExport("docx")}
//             disabled={exporting}
//             className="h-20 flex flex-col items-center justify-center gap-2"
//           >
//             <Download className="h-5 w-5" />
//             <span className="text-xs">Word Document</span>
//           </Button>
//           <Button
//             onClick={() => handleExport("xlsx")}
//             disabled={exporting}
//             className="h-20 flex flex-col items-center justify-center gap-2"
//           >
//             <Download className="h-5 w-5" />
//             <span className="text-xs">Excel Sheet</span>
//           </Button>
//         </div>

//         {exported && (
//           <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-4">
//             ✓ Your {exported.toUpperCase()} file is downloading...
//           </p>
//         )}
//       </Card>

//       <Button onClick={onReset} size="lg" className="w-full bg-transparent" variant="outline">
//         Process Another Document
//       </Button>
//     </div>
//   )
// }

"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CheckCircle,
  Download,
  FileText,
  Table,
  Code,
  FileJson,
  Settings,
  Eye,
  Sparkles,
  Clock,
  Palette,
  Layers,
  RefreshCw,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ExportDocumentProps {
  results: any
  onReset: () => void
}

interface ExportOptions {
  title: string
  author: string
  subject: string
  includeMetadata: boolean
  includeTimestamp: boolean
  styling: {
    fontSize: number
    fontFamily: string
    lineSpacing: number
    margins: {
      top: number
      bottom: number
      left: number
      right: number
    }
    headerFooter: boolean
    pageNumbers: boolean
    theme: "light" | "dark" | "blue" | "green"
  }
  tableOptions: {
    headerStyle: "bold" | "colored" | "minimal"
    borders: boolean
    alternatingRows: boolean
  }
}

export function ExportDocument({ results, onReset }: ExportDocumentProps) {
  const [exporting, setExporting] = useState(false)
  const [activeTab, setActiveTab] = useState("quick")
  const [showPreview, setShowPreview] = useState(false)
  const [exportHistory, setExportHistory] = useState<any[]>([])
  
  const [options, setOptions] = useState<ExportOptions>({
    title: results.classification?.type
      ? `${results.classification.type} Document`
      : "Extracted Document",
    author: "",
    subject: "",
    includeMetadata: true,
    includeTimestamp: true,
    styling: {
      fontSize: 12,
      fontFamily: "Calibri",
      lineSpacing: 1.15,
      margins: { top: 1, bottom: 1, left: 1, right: 1 },
      headerFooter: true,
      pageNumbers: true,
      theme: "light",
    },
    tableOptions: {
      headerStyle: "colored",
      borders: true,
      alternatingRows: true,
    },
  })

  const [selectedFormat, setSelectedFormat] = useState<
    "docx" | "xlsx" | "csv" | "json" | "txt"
  >("docx")

  // Load export history from localStorage
  useEffect(() => {
    const history = localStorage.getItem("exportHistory")
    if (history) {
      setExportHistory(JSON.parse(history))
    }
  }, [])

  const handleExport = async (format: typeof selectedFormat, customOptions?: Partial<ExportOptions>) => {
    setExporting(true)

    try {
      const exportOptions = customOptions || options
      const response = await fetch("/api/export-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: results.extractedText,
          format,
          classification: results.classification,
          options: exportOptions,
          filename: `${exportOptions.title?.replace(/\s+/g, "-").toLowerCase()}.${format}`,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || "Export failed")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${exportOptions.title?.replace(/\s+/g, "-")}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Add to history
      const historyEntry = {
        id: Date.now(),
        format,
        title: exportOptions.title,
        timestamp: new Date().toISOString(),
        size: blob.size,
      }
      const newHistory = [historyEntry, ...exportHistory].slice(0, 10)
      setExportHistory(newHistory)
      localStorage.setItem("exportHistory", JSON.stringify(newHistory))
    } catch (err) {
      console.error("Export error:", err)
      alert(err instanceof Error ? err.message : "Export failed")
    } finally {
      setExporting(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const exportFormats = [
    {
      id: "docx",
      name: "Word Document",
      icon: FileText,
      description: "Rich formatted document with styling",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      id: "xlsx",
      name: "Excel Spreadsheet",
      icon: Table,
      description: "Structured data in spreadsheet format",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      id: "csv",
      name: "CSV File",
      icon: Table,
      description: "Comma-separated values for data processing",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
    {
      id: "json",
      name: "JSON Data",
      icon: Code,
      description: "Structured data with metadata",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      id: "txt",
      name: "Plain Text",
      icon: FileJson,
      description: "Simple text file without formatting",
      color: "text-gray-600",
      bgColor: "bg-gray-50 dark:bg-gray-950",
    },
  ]

  const themes = [
    { id: "light", name: "Light", color: "bg-white border-2" },
    { id: "dark", name: "Dark", color: "bg-gray-900 border-2" },
    { id: "blue", name: "Ocean Blue", color: "bg-blue-500 border-2" },
    { id: "green", name: "Forest Green", color: "bg-green-500 border-2" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Document Ready for Export</h2>
                <p className="text-sm text-muted-foreground">
                  Choose format and customize your export
                </p>
              </div>
            </div>
            
            {results.classification && (
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {results.classification.type || "Unknown Type"}
                </Badge>
                {results.classification.confidence && (
                  <Badge variant="outline">
                    {(results.classification.confidence * 100).toFixed(0)}% Confidence
                  </Badge>
                )}
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {showPreview ? "Hide" : "Show"} Preview
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Export Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="quick">Quick Export</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {/* Quick Export */}
            <TabsContent value="quick" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Formats
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {exportFormats.map((format) => {
                    const Icon = format.icon
                    return (
                      <button
                        key={format.id}
                        onClick={() => handleExport(format.id as any)}
                        disabled={exporting}
                        className={`p-4 rounded-lg border-2 transition-all hover:scale-105 hover:shadow-md text-left ${
                          selectedFormat === format.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        } ${format.bgColor} disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${format.bgColor}`}>
                            <Icon className={`h-5 w-5 ${format.color}`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1">
                              {format.name}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {format.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </Card>
            </TabsContent>

            {/* Advanced Settings */}
            <TabsContent value="advanced" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Document Settings
                </h3>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Document Title</Label>
                      <Input
                        id="title"
                        value={options.title}
                        onChange={(e) =>
                          setOptions({ ...options, title: e.target.value })
                        }
                        placeholder="Enter document title"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="author">Author</Label>
                        <Input
                          id="author"
                          value={options.author}
                          onChange={(e) =>
                            setOptions({ ...options, author: e.target.value })
                          }
                          placeholder="Author name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          value={options.subject}
                          onChange={(e) =>
                            setOptions({ ...options, subject: e.target.value })
                          }
                          placeholder="Document subject"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Metadata Options */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Metadata</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="metadata" className="text-sm">
                          Include Metadata
                        </Label>
                        <Switch
                          id="metadata"
                          checked={options.includeMetadata}
                          onCheckedChange={(checked) =>
                            setOptions({ ...options, includeMetadata: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="timestamp" className="text-sm">
                          Include Timestamp
                        </Label>
                        <Switch
                          id="timestamp"
                          checked={options.includeTimestamp}
                          onCheckedChange={(checked) =>
                            setOptions({
                              ...options,
                              includeTimestamp: checked,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Styling */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Styling
                    </h4>

                    <div>
                      <Label>Theme</Label>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {themes.map((theme) => (
                          <button
                            key={theme.id}
                            onClick={() =>
                              setOptions({
                                ...options,
                                styling: {
                                  ...options.styling,
                                  theme: theme.id as any,
                                },
                              })
                            }
                            className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                              options.styling.theme === theme.id
                                ? "border-primary"
                                : "border-border"
                            }`}
                          >
                            <div className={`w-full h-8 rounded ${theme.color} mb-1`} />
                            <p className="text-xs font-medium">{theme.name}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Font Size: {options.styling.fontSize}pt</Label>
                      <Slider
                        value={[options.styling.fontSize]}
                        onValueChange={([value]) =>
                          setOptions({
                            ...options,
                            styling: { ...options.styling, fontSize: value },
                          })
                        }
                        min={8}
                        max={24}
                        step={1}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="font">Font Family</Label>
                      <Select
                        value={options.styling.fontFamily}
                        onValueChange={(value) =>
                          setOptions({
                            ...options,
                            styling: { ...options.styling, fontFamily: value },
                          })
                        }
                      >
                        <SelectTrigger id="font">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Calibri">Calibri</SelectItem>
                          <SelectItem value="Arial">Arial</SelectItem>
                          <SelectItem value="Times New Roman">
                            Times New Roman
                          </SelectItem>
                          <SelectItem value="Georgia">Georgia</SelectItem>
                          <SelectItem value="Courier New">Courier New</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Header & Footer</Label>
                        <Switch
                          checked={options.styling.headerFooter}
                          onCheckedChange={(checked) =>
                            setOptions({
                              ...options,
                              styling: {
                                ...options.styling,
                                headerFooter: checked,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Page Numbers</Label>
                        <Switch
                          checked={options.styling.pageNumbers}
                          onCheckedChange={(checked) =>
                            setOptions({
                              ...options,
                              styling: {
                                ...options.styling,
                                pageNumbers: checked,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Table Options */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Table Formatting
                    </h4>

                    <div>
                      <Label htmlFor="headerStyle">Header Style</Label>
                      <Select
                        value={options.tableOptions.headerStyle}
                        onValueChange={(value: any) =>
                          setOptions({
                            ...options,
                            tableOptions: {
                              ...options.tableOptions,
                              headerStyle: value,
                            },
                          })
                        }
                      >
                        <SelectTrigger id="headerStyle">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bold">Bold</SelectItem>
                          <SelectItem value="colored">Colored</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Table Borders</Label>
                        <Switch
                          checked={options.tableOptions.borders}
                          onCheckedChange={(checked) =>
                            setOptions({
                              ...options,
                              tableOptions: {
                                ...options.tableOptions,
                                borders: checked,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Alternating Rows</Label>
                        <Switch
                          checked={options.tableOptions.alternatingRows}
                          onCheckedChange={(checked) =>
                            setOptions({
                              ...options,
                              tableOptions: {
                                ...options.tableOptions,
                                alternatingRows: checked,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    onClick={() => handleExport("docx")}
                    disabled={exporting}
                    className="w-full"
                    size="lg"
                  >
                    {exporting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Export with Custom Settings
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* Export History */}
            <TabsContent value="history">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Exports
                </h3>

                {exportHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No export history yet</p>
                    <p className="text-sm">Your exports will appear here</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {exportHistory.map((entry) => (
                        <div
                          key={entry.id}
                          className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">
                                {entry.title}
                              </h4>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <span className="uppercase font-mono">
                                  {entry.format}
                                </span>
                                <span>•</span>
                                <span>{formatFileSize(entry.size)}</span>
                                <span>•</span>
                                <span>
                                  {new Date(entry.timestamp).toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <Badge variant="outline">{entry.format}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel */}
        <div className="space-y-4">
          {showPreview && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Document Preview
              </h3>
              <ScrollArea className="h-[600px]">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {options.title && (
                    <h1 className="text-center border-b pb-2">{options.title}</h1>
                  )}
                  {options.includeMetadata && (
                    <div className="text-sm text-muted-foreground italic mb-4">
                      {options.author && <p>Author: {options.author}</p>}
                      {options.includeTimestamp && (
                        <p>Generated: {new Date().toLocaleString()}</p>
                      )}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap font-mono text-xs">
                    {results.extractedText.substring(0, 2000)}
                    {results.extractedText.length > 2000 && "..."}
                  </div>
                </div>
              </ScrollArea>
            </Card>
          )}

          {/* Quick Stats */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Document Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Characters</span>
                <Badge variant="secondary">
                  {results.extractedText.length.toLocaleString()}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Words</span>
                <Badge variant="secondary">
                  {results.extractedText.split(/\s+/).filter(Boolean).length.toLocaleString()}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Lines</span>
                <Badge variant="secondary">
                  {results.extractedText.split("\n").length.toLocaleString()}
                </Badge>
              </div>
              {results.classification && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <Badge>{results.classification.type || "Unknown"}</Badge>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Reset Button */}
      <Card className="p-4">
        <Button
          onClick={onReset}
          size="lg"
          className="w-full"
          variant="outline"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Process Another Document
        </Button>
      </Card>
    </div>
  )
}
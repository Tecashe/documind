// "use client"

// import type { Document } from "@prisma/client"
// import { Card } from "@/components/ui/card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Badge } from "@/components/ui/badge"

// interface DocumentViewerProps {
//   document: Document & {
//     content: any
//     classifications: any
//     tables: any[]
//     fields: any[]
//   }
// }
// //
// export function DocumentViewer({ document }: DocumentViewerProps) {
//   return (
//     <Card className="p-6">
//       <Tabs defaultValue="content" className="space-y-4">
//         <TabsList>
//           <TabsTrigger value="content">Extracted Text</TabsTrigger>
//           <TabsTrigger value="fields">Fields</TabsTrigger>
//           {document.tables.length > 0 && <TabsTrigger value="tables">Tables</TabsTrigger>}
//         </TabsList>

//         <TabsContent value="content" className="space-y-4">
//           <div className="prose prose-sm max-w-none dark:prose-invert">
//             <p className="text-sm text-muted-foreground whitespace-pre-wrap">{document.content?.rawText}</p>
//           </div>
//         </TabsContent>

//         <TabsContent value="fields" className="space-y-4">
//           {document.fields.length === 0 ? (
//             <p className="text-sm text-muted-foreground">No fields extracted</p>
//           ) : (
//             <div className="space-y-3">
//               {document.fields.map((field, index) => (
//                 <div key={index} className="space-y-1">
//                   <label className="text-sm font-medium">{field.label}</label>
//                   <p className="text-sm p-2 bg-muted rounded text-muted-foreground">{field.value}</p>
//                   <div className="flex items-center gap-2">
//                     <Badge variant="secondary">{(field.confidence * 100).toFixed(0)}%</Badge>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </TabsContent>

//         {document.tables.length > 0 && (
//           <TabsContent value="tables" className="space-y-4">
//             {document.tables.map((table, index) => (
//               <div key={index} className="space-y-2 overflow-x-auto">
//                 <h4 className="font-semibold text-sm">Table {index + 1}</h4>
//                 <table className="w-full text-sm border-collapse border border-border">
//                   <thead>
//                     <tr className="bg-muted">
//                       {table.headers.map((header: string, i: number) => (
//                         <th key={i} className="border border-border p-2 text-left">
//                           {header}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {table.rows.map((row: any, i: number) => (
//                       <tr key={i}>
//                         {(Array.isArray(row) ? row : Object.values(row)).map((cell: any, j: number) => (
//                           <td key={j} className="border border-border p-2">
//                             {cell}
//                           </td>
//                         ))}
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             ))}
//           </TabsContent>
//         )}
//       </Tabs>
//     </Card>
//   )
// }

"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ZoomIn, ZoomOut, RotateCw, Download, Maximize2 } from "lucide-react"
import { useState } from "react"
import Image from "next/image"

interface DocumentViewerProps {
  document: {
    fileUrl: string
    fileType: string
    title: string
    status: string
  }
}

export function DocumentViewer({ document }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const isPDF = document.fileType === "application/pdf"
  const isImage = document.fileType.startsWith("image/")

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50))
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360)

  return (
    <Card className="overflow-hidden border border-border/40 bg-card/50 backdrop-blur-sm shadow-xl animate-fadeInUp">
      {/* Viewer Header */}
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
            <Button variant="ghost" size="sm" onClick={handleZoomOut} disabled={zoom <= 50}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium min-w-[4ch] text-center">{zoom}%</span>
            <Button variant="ghost" size="sm" onClick={handleZoomIn} disabled={zoom >= 200}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <div className="w-px h-4 bg-border mx-1" />
            <Button variant="ghost" size="sm" onClick={handleRotate}>
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href={document.fileUrl} download={document.title}>
                <Download className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Viewer Content */}
      <div className="bg-muted/10 p-6 min-h-[600px] flex items-center justify-center relative overflow-auto">
        {document.status === "PROCESSING" && (
          <div className="text-center space-y-4">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
            <p className="text-muted-foreground">Processing document...</p>
          </div>
        )}

        {document.status === "FAILED" && (
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-destructive">Processing Failed</p>
            <p className="text-sm text-muted-foreground">Unable to process this document</p>
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

        {document.status === "PENDING" && (
          <div className="text-center space-y-4">
            <div className="inline-block h-12 w-12 rounded-full border-4 border-solid border-muted-foreground/20 border-t-primary animate-spin" />
            <p className="text-muted-foreground">Queued for processing...</p>
          </div>
        )}
      </div>
    </Card>
  )
}
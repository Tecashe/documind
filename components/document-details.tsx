// import type { Document } from "@prisma/client"
// import { Card } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { formatDistanceToNow } from "date-fns"
// import { FileText, Calendar, BookMarked } from "lucide-react"

// interface DocumentDetailsProps {
//   document: Document & {
//     classifications: any
//   }
// }
// //
// export function DocumentDetails({ document }: DocumentDetailsProps) {
//   const statusColors: Record<string, string> = {
//     COMPLETED: "bg-green-500",
//     PROCESSING: "bg-yellow-500",
//     PENDING: "bg-blue-500",
//     FAILED: "bg-red-500",
//     ARCHIVED: "bg-gray-500",
//   }

//   return (
//     <Card className="p-6 space-y-6">
//       <div>
//         <h3 className="font-semibold mb-4">Details</h3>
//         <div className="space-y-3 text-sm">
//           <div className="flex items-center gap-2">
//             <BookMarked size={16} className="text-muted-foreground" />
//             <span className="text-muted-foreground">Type</span>
//             <Badge variant="secondary" className="ml-auto">
//               {document.documentType}
//             </Badge>
//           </div>

//           <div className="flex items-center gap-2">
//             <div className={`w-2 h-2 rounded-full ${statusColors[document.status] || "bg-gray-500"}`} />
//             <span className="text-muted-foreground">Status</span>
//             <span className="ml-auto font-medium capitalize">{document.status.toLowerCase()}</span>
//           </div>

//           <div className="flex items-center gap-2">
//             <Calendar size={16} className="text-muted-foreground" />
//             <span className="text-muted-foreground">Uploaded</span>
//             <span className="ml-auto">{formatDistanceToNow(new Date(document.createdAt), { addSuffix: true })}</span>
//           </div>

//           <div className="flex items-center gap-2">
//             <FileText size={16} className="text-muted-foreground" />
//             <span className="text-muted-foreground">Size</span>
//             <span className="ml-auto">{(document.fileSize / 1024 / 1024).toFixed(2)} MB</span>
//           </div>

//           {document.pages && (
//             <div className="flex items-center gap-2">
//               <FileText size={16} className="text-muted-foreground" />
//               <span className="text-muted-foreground">Pages</span>
//               <span className="ml-auto">{document.pages}</span>
//             </div>
//           )}

//           {document.confidence && (
//             <div className="flex items-center gap-2">
//               <span className="text-muted-foreground">Confidence</span>
//               <Badge variant="secondary" className="ml-auto">
//                 {(document.confidence * 100).toFixed(0)}%
//               </Badge>
//             </div>
//           )}
//         </div>
//       </div>
//     </Card>
//   )
// }

import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { DocumentViewer } from "@/components/document-viewer"
import { DocumentActions } from "@/components/document-actions"
import { ExtractedContent } from "@/components/extracted-content"
import { DocumentMetadata } from "@/components/document-metadata"
import { ExtractedFields } from "@/components/extracted-fields"
import { ExtractedTables } from "@/components/extracted-tables"
import { ShareDialog } from "@/components/share-dialog"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

interface PageProps {
  params: { id: string }
}

export default async function DocumentDetailPage({ params }: PageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) {
    redirect("/sign-in")
  }

  const document = await prisma.document.findUnique({
    where: { id: params.id },
    include: {
      owner: true,
      content: true,
      extractedText: true,
      classifications: true,
      fields: {
        orderBy: { createdAt: "asc" },
      },
      tables: {
        orderBy: { pageNum: "asc" },
      },
      shares: {
        include: {
          user: true,
        },
      },
      versions: {
        orderBy: { version: "desc" },
        take: 5,
      },
      annotations: {
        orderBy: { createdAt: "desc" },
      },
      comments: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  })

  if (!document) {
    redirect("/dashboard")
  }

  // Check if user has access
  const hasAccess =
    document.ownerId === user.id ||
    document.shares.some((share) => share.userId === user.id)

  if (!hasAccess) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Floating background elements */}
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
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                {document.title}
              </h1>
              <p className="text-muted-foreground">{document.fileName}</p>
            </div>

           <DocumentActions doc={document} />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Document Viewer & Content */}
          <div className="lg:col-span-2 space-y-6">
            <DocumentViewer document={document} />
            <ExtractedContent document={document} />
            {document.tables && document.tables.length > 0 && (
              <ExtractedTables tables={document.tables} />
            )}
          </div>

          {/* Right Column - Metadata & Fields */}
          <div className="space-y-6">
            <DocumentMetadata document={document} />
            {document.fields && document.fields.length > 0 && (
              <ExtractedFields fields={document.fields} documentId={document.id} />
            )}
            <ShareDialog document={document} shares={document.shares} />
          </div>
        </div>
      </div>
    </div>
  )
}
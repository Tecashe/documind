// import { notFound } from "next/navigation"
// import { auth } from "@clerk/nextjs/server"
// import { prisma } from "@/lib/db"
// import { DocumentViewer } from "@/components/document-viewer"
// import { DocumentActions } from "@/components/document-actions"
// import DocumentDetails from "@/components/document-details"

// export default async function DocumentPage({
//   params,
// }: {
//   params: { id: string }
// }) {
//   const { userId } = await auth()

//   if (!userId) {
//     notFound()
//   }

//   const document = await prisma.document.findUnique({
//     where: { id: params.id },
//     include: {
//       content: true,
//       classifications: true,
//       tables: true,
//       fields: true,
//       shares: true,
//     },
//   })

//   if (!document) {
//     notFound()
//   }

//   return (
//     <div className="space-y-6 p-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-3xl font-bold">{document.title}</h1>
//         <DocumentActions documentId={document.id} />
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-2">
//           <DocumentViewer document={document} />
//         </div>
//         <div>
//           <DocumentDetails document={document} />
//         </div>
//       </div>
//     </div>
//   )
// }


// import { redirect } from "next/navigation"
// import { auth } from "@clerk/nextjs/server"
// import { prisma } from "@/lib/db"
// import { DocumentViewer } from "@/components/document-viewer"
// import { DocumentActions } from "@/components/document-actions"
// import { ExtractedContent } from "@/components/extracted-content"
// import { DocumentMetadata } from "@/components/document-metadata"
// import { ExtractedFields } from "@/components/extracted-fields"
// import { ExtractedTables } from "@/components/extracted-tables"
// import { ShareDialog } from "@/components/share-dialog"
// import { Button } from "@/components/ui/button"
// import { ArrowLeft } from "lucide-react"
// import Link from "next/link"

// export const dynamic = "force-dynamic"

// interface PageProps {
//   params: { id: string }
// }

// export default async function DocumentDetailPage({ params }: PageProps) {
//   const { userId } = await auth()

//   if (!userId) {
//     redirect("/sign-in")
//   }

//   const user = await prisma.user.findUnique({
//     where: { clerkId: userId },
//   })

//   if (!user) {
//     redirect("/sign-in")
//   }

//   const document = await prisma.document.findUnique({
//     where: { id: params.id },
//     include: {
//       owner: true,
//       content: true,
//       extractedText: true,
//       classifications: true,
//       fields: {
//         orderBy: { createdAt: "asc" },
//       },
//       tables: {
//         orderBy: { pageNum: "asc" },
//       },
//       shares: {
//         include: {
//           user: true,
//         },
//       },
//       versions: {
//         orderBy: { version: "desc" },
//         take: 5,
//       },
//       annotations: {
//         orderBy: { createdAt: "desc" },
//       },
//       comments: {
//         orderBy: { createdAt: "desc" },
//         take: 10,
//       },
//     },
//   })

//   if (!document) {
//     redirect("/dashboard")
//   }

//   // Check if user has access
//   const hasAccess =
//     document.ownerId === user.id ||
//     document.shares.some((share) => share.userId === user.id)

//   if (!hasAccess) {
//     redirect("/dashboard")
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
//       {/* Floating background elements */}
//       <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
//         <div className="absolute left-1/4 top-0 h-[500px] w-[500px] animate-float rounded-full bg-primary/5 blur-3xl" />
//         <div
//           className="absolute right-1/4 bottom-0 h-[500px] w-[500px] animate-float rounded-full bg-primary/5 blur-3xl"
//           style={{ animationDelay: "2s" }}
//         />
//       </div>

//       <div className="container mx-auto px-4 py-8 max-w-7xl">
//         {/* Header */}
//         <div className="mb-8 animate-fadeInUp">
//           <Link href="/dashboard">
//             <Button variant="ghost" size="sm" className="mb-4 group">
//               <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
//               Back to Dashboard
//             </Button>
//           </Link>

//           <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
//             <div className="space-y-1">
//               <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
//                 {document.title}
//               </h1>
//               <p className="text-muted-foreground">{document.fileName}</p>
//             </div>

//            <DocumentActions doc={document} />
//           </div>
//         </div>

//         {/* Main Content Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Left Column - Document Viewer & Content */}
//           <div className="lg:col-span-2 space-y-6">
//             <DocumentViewer document={document} />
//             <ExtractedContent document={document} />
//             {document.tables && document.tables.length > 0 && (
//               <ExtractedTables tables={document.tables} />
//             )}
//           </div>

//           {/* Right Column - Metadata & Fields */}
//           <div className="space-y-6">
//             <DocumentMetadata document={document} />
//             {document.fields && document.fields.length > 0 && (
//               <ExtractedFields fields={document.fields} documentId={document.id} />
//             )}
//             <ShareDialog document={document} shares={document.shares} />
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// import { redirect } from "next/navigation"
// import { auth } from "@clerk/nextjs/server"
// import { prisma } from "@/lib/db"
// import { DocumentViewer } from "@/components/document-viewer"
// import { DocumentActions } from "@/components/document-actions"
// import { ExtractedContent } from "@/components/extracted-content"
// import { DocumentMetadata } from "@/components/document-metadata"
// import { ExtractedFields } from "@/components/extracted-fields"
// import { ExtractedTables } from "@/components/extracted-tables"
// import { ShareDialog } from "@/components/share-dialog"
// import { Button } from "@/components/ui/button"
// import { ArrowLeft } from "lucide-react"
// import Link from "next/link"

// export const dynamic = "force-dynamic"

// interface PageProps {
//   params: Promise<{ id: string }>  // ✅ Params is now a Promise in Next.js 15
// }

// export default async function DocumentDetailPage({ params }: PageProps) {
//   // ✅ Await params to get the actual values
//   const { id } = await params
  
//   const { userId } = await auth()

//   if (!userId) {
//     redirect("/sign-in")
//   }

//   const user = await prisma.user.findUnique({
//     where: { clerkId: userId },
//   })

//   if (!user) {
//     redirect("/sign-in")
//   }

//   const document = await prisma.document.findUnique({
//     where: { id },  // ✅ Now id is properly defined
//     include: {
//       owner: true,
//       content: true,
//       extractedText: true,
//       classifications: true,
//       fields: {
//         orderBy: { createdAt: "asc" },
//       },
//       tables: {
//         orderBy: { pageNum: "asc" },
//       },
//       shares: {
//         include: {
//           user: true,
//         },
//       },
//       versions: {
//         orderBy: { version: "desc" },
//         take: 5,
//       },
//       annotations: {
//         orderBy: { createdAt: "desc" },
//       },
//       comments: {
//         orderBy: { createdAt: "desc" },
//         take: 10,
//       },
//     },
//   })

//   if (!document) {
//     redirect("/dashboard")
//   }

//   // Check if user has access
//   const hasAccess =
//     document.ownerId === user.id ||
//     document.shares.some((share) => share.userId === user.id)

//   if (!hasAccess) {
//     redirect("/dashboard")
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
//       {/* Floating background elements */}
//       <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
//         <div className="absolute left-1/4 top-0 h-[500px] w-[500px] animate-float rounded-full bg-primary/5 blur-3xl" />
//         <div
//           className="absolute right-1/4 bottom-0 h-[500px] w-[500px] animate-float rounded-full bg-primary/5 blur-3xl"
//           style={{ animationDelay: "2s" }}
//         />
//       </div>

//       <div className="container mx-auto px-4 py-8 max-w-7xl">
//         {/* Header */}
//         <div className="mb-8 animate-fadeInUp">
//           <Link href="/dashboard">
//             <Button variant="ghost" size="sm" className="mb-4 group">
//               <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
//               Back to Dashboard
//             </Button>
//           </Link>

//           <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
//             <div className="space-y-1">
//               <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
//                 {document.title}
//               </h1>
//               <p className="text-muted-foreground">{document.fileName}</p>
//             </div>

//             <DocumentActions doc={document} />
//           </div>
//         </div>

//         {/* Main Content Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Left Column - Document Viewer & Content */}
//           <div className="lg:col-span-2 space-y-6">
//             <DocumentViewer document={document} />
//             <ExtractedContent document={document} />
//             {document.tables && document.tables.length > 0 && (
//               <ExtractedTables tables={document.tables} />
//             )}
//           </div>

//           {/* Right Column - Metadata & Fields */}
//           <div className="space-y-6">
//             <DocumentMetadata document={document} />
//             {document.fields && document.fields.length > 0 && (
//               <ExtractedFields fields={document.fields} documentId={document.id} />
//             )}
//             <ShareDialog document={document} shares={document.shares} />
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// // app/(app)/documents/[id]/page.tsx
// import { redirect } from "next/navigation"
// import { auth } from "@clerk/nextjs/server"
// import { prisma } from "@/lib/db"
// import { DocumentViewer } from "@/components/document-viewer"
// import { DocumentActions } from "@/components/document-actions"
// import { ExtractedContent } from "@/components/extracted-content"
// import { DocumentMetadata } from "@/components/document-metadata"
// import { ExtractedFields } from "@/components/extracted-fields"
// import { ExtractedTables } from "@/components/extracted-tables"
// import { ShareDialog } from "@/components/share-dialog"
// import { Button } from "@/components/ui/button"
// import { ArrowLeft } from "lucide-react"
// import Link from "next/link"

// export const dynamic = "force-dynamic"

// interface PageProps {
//   params: Promise<{ id: string }>
// }

// export default async function DocumentDetailPage({ params }: PageProps) {
//   const { id } = await params
//   const { userId } = await auth()

//   if (!userId) {
//     redirect("/sign-in")
//   }

//   const user = await prisma.user.findUnique({
//     where: { clerkId: userId },
//   })

//   if (!user) {
//     redirect("/sign-in")
//   }

//   const document = await prisma.document.findUnique({
//     where: { id },
//     include: {
//       owner: true,
//       content: true,
//       extractedText: true,
//       classifications: true,
//       fields: {
//         orderBy: { createdAt: "asc" },
//       },
//       tables: {
//         orderBy: { pageNum: "asc" },
//       },
//       shares: {
//         include: {
//           user: true,
//         },
//       },
//       versions: {
//         orderBy: { version: "desc" },
//         take: 5,
//       },
//       annotations: {
//         orderBy: { createdAt: "desc" },
//       },
//       comments: {
//         orderBy: { createdAt: "desc" },
//         take: 10,
//       },
//     },
//   })

//   if (!document) {
//     redirect("/dashboard")
//   }

//   // Check if user has access
//   const hasAccess =
//     document.ownerId === user.id ||
//     document.shares.some((share) => share.userId === user.id)

//   if (!hasAccess) {
//     redirect("/dashboard")
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
//       {/* Floating background elements */}
//       <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
//         <div className="absolute left-1/4 top-0 h-[500px] w-[500px] animate-float rounded-full bg-primary/5 blur-3xl" />
//         <div
//           className="absolute right-1/4 bottom-0 h-[500px] w-[500px] animate-float rounded-full bg-primary/5 blur-3xl"
//           style={{ animationDelay: "2s" }}
//         />
//       </div>

//       <div className="container mx-auto px-4 py-8 max-w-7xl">
//         {/* Header */}
//         <div className="mb-8 animate-fadeInUp">
//           <Link href="/dashboard">
//             <Button variant="ghost" size="sm" className="mb-4 group">
//               <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
//               Back to Dashboard
//             </Button>
//           </Link>

//           <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
//             <div className="space-y-1">
//               <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
//                 {document.title}
//               </h1>
//               <p className="text-muted-foreground">{document.fileName}</p>
//             </div>

//             <DocumentActions doc={document} />
//           </div>
//         </div>

//         {/* Main Content Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Left Column - Document Viewer & Content */}
//           <div className="lg:col-span-2 space-y-6">
//             <DocumentViewer document={document} />
//             <ExtractedContent document={document} />
//             {document.tables && document.tables.length > 0 && (
//               <ExtractedTables tables={document.tables} />
//             )}
//           </div>

//           {/* Right Column - Metadata & Fields */}
//           <div className="space-y-6">
//             <DocumentMetadata document={document} />
//             {document.fields && document.fields.length > 0 && (
//               <ExtractedFields fields={document.fields} documentId={document.id} />
//             )}
//             <ShareDialog document={document} shares={document.shares} />
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }















// app/(app)/documents/[id]/page.tsx
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { DocumentDetailClient } from "@/components/document-detail-client"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function DocumentDetailPage({ params }: PageProps) {
  const { id } = await params
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
    where: { id },
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

  return <DocumentDetailClient document={document} user={user} />
}

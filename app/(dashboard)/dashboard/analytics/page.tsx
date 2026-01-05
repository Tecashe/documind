// import { getUser } from "@/lib/auth"
// import { prisma } from "@/lib/db"
// import { AnalyticsCharts } from "@/components/analytics/charts"
// import { AuditLogs } from "@/components/analytics/audit-logs"

// interface DocumentWithTimestamps {
//   status: string
//   processedAt: Date | null
//   createdAt: Date
//   documentType: string | null
// }

// export default async function AnalyticsPage() {
//   const user = await getUser()
//   if (!user) {
//     return null
//   }

//   const documents = await prisma.document.findMany({
//     where: { ownerId: user.id },
//   })

//   const auditLogs = await prisma.auditLog.findMany({
//     where: { userId: user.id },
//     orderBy: { createdAt: "desc" },
//     take: 50,
//     include: { user: true, document: true },
//   })

//   const processingLogs = auditLogs.filter(
//     (log: (typeof auditLogs)[number]) => log.action === "PROCESS_START" || log.action === "PROCESS_COMPLETE",
//   )
//   let averageProcessingTime = 0

//   if (processingLogs.length >= 2) {
//     const completedDocs = documents.filter((d: DocumentWithTimestamps) => d.processedAt)
//     if (completedDocs.length > 0) {
//       const totalTime = completedDocs.reduce((sum: number, doc: DocumentWithTimestamps): number => {
//         if (doc.processedAt && doc.createdAt) {
//           return sum + (new Date(doc.processedAt).getTime() - new Date(doc.createdAt).getTime())
//         }
//         return sum
//       }, 0)
//       averageProcessingTime = totalTime / completedDocs.length / 1000 / 60
//     }
//   }

//   const stats = {
//     totalDocuments: documents.length,
//     byStatus: {
//       completed: documents.filter((d: DocumentWithTimestamps) => d.status === "COMPLETED").length,
//       processing: documents.filter((d: DocumentWithTimestamps) => d.status === "PROCESSING").length,
//       failed: documents.filter((d: DocumentWithTimestamps) => d.status === "FAILED").length,
//     },
//     byType: documents.reduce((acc: Record<string, number>, doc: DocumentWithTimestamps): Record<string, number> => {
//       acc[doc.documentType || "UNKNOWN"] = (acc[doc.documentType || "UNKNOWN"] || 0) + 1
//       return acc
//     }, {}),
//     averageProcessingTime: Math.round(averageProcessingTime * 100) / 100,
//     creditsUsed: Math.max(0, (user.credits || 0) - 100),
//   }

//   return (
//     <div className="space-y-6 p-6">
//       <div>
//         <h1 className="text-3xl font-bold">Analytics</h1>
//         <p className="text-muted-foreground mt-1">Track your document processing activity</p>
//       </div>

//       <AnalyticsCharts stats={stats} />

//       <AuditLogs logs={auditLogs} />
//     </div>
//   )
// }

import { getUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { AnalyticsCharts } from "@/components/analytics/charts"
import { AuditLogs } from "@/components/analytics/audit-logs"
import { Document, AuditLog } from "@prisma/client"

export default async function AnalyticsPage() {
  const user = await getUser()
  if (!user) {
    return null
  }

  const documents = await prisma.document.findMany({
    where: { ownerId: user.id },
  })

  const auditLogs = await prisma.auditLog.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { user: true, document: true },
  })

  // Calculate real average processing time 
  const processingLogs = auditLogs.filter(
    (log: AuditLog) => log.action === "PROCESS_START" || log.action === "PROCESS_COMPLETE"
  )
  let averageProcessingTime = 0

  if (processingLogs.length >= 2) {
    const completedDocs = documents.filter((d: Document) => d.processedAt)
    if (completedDocs.length > 0) {
      const totalTime = completedDocs.reduce((sum: number, doc: Document) => {
        if (doc.processedAt && doc.createdAt) {
          return sum + (new Date(doc.processedAt).getTime() - new Date(doc.createdAt).getTime())
        }
        return sum
      }, 0)
      averageProcessingTime = totalTime / completedDocs.length / 1000 / 60 // Convert to minutes
    }
  }

  const stats = {
    totalDocuments: documents.length,
    byStatus: {
      completed: documents.filter((d: Document) => d.status === "COMPLETED").length,
      processing: documents.filter((d: Document) => d.status === "PROCESSING").length,
      failed: documents.filter((d: Document) => d.status === "FAILED").length,
    },
    byType: documents.reduce((acc: Record<string, number>, doc: Document) => {
      acc[doc.documentType || "UNKNOWN"] = (acc[doc.documentType || "UNKNOWN"] || 0) + 1
      return acc
    }, {}),
    averageProcessingTime: Math.round(averageProcessingTime * 100) / 100, // Real calculation
    creditsUsed: Math.max(0, (user.credits || 0) - 100),
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your document processing activity</p>
      </div>

      <AnalyticsCharts stats={stats} />

      <AuditLogs logs={auditLogs} />
    </div>
  )
}
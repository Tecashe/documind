import { notFound } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { DocumentViewer } from "@/components/document-viewer"
import { DocumentActions } from "@/components/document-actions"
import { DocumentDetails } from "@/components/document-details"

export default async function DocumentPage({
  params,
}: {
  params: { id: string }
}) {
  const { userId } = await auth()

  if (!userId) {
    notFound()
  }

  const document = await prisma.document.findUnique({
    where: { id: params.id },
    include: {
      content: true,
      classifications: true,
      tables: true,
      fields: true,
      shares: true,
    },
  })

  if (!document) {
    notFound()
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{document.title}</h1>
        <DocumentActions documentId={document.id} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DocumentViewer document={document} />
        </div>
        <div>
          <DocumentDetails document={document} />
        </div>
      </div>
    </div>
  )
}

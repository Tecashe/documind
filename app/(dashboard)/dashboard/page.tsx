// import { redirect } from "next/navigation"
// import { auth } from "@clerk/nextjs/server"
// import { getUser } from "@/lib/auth"
// import { prisma } from "@/lib/db"
// import { DocumentGrid } from "@/components/dashboard/document-grid"
// import { DashboardHeader } from "@/components/dashboard/dashboard-header"
// import { EmptyState } from "@/components/dashboard/empty-state"
// import { StatsCards } from "@/components/dashboard/stats-cards"
// import { FileUploader } from "@/components/file-uploader"
// import { CameraCapture } from "@/components/camera-capture"
// import { Card } from "@/components/ui/card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// export default async function DashboardPage() {
//   const { userId } = await auth()

//   if (!userId) {
//     redirect("/sign-in")
//   }
// //
//   const user = await getUser()
//   if (!user) {
//     redirect("/sign-in")
//   }

//   const documents = await prisma.document.findMany({
//     where: {
//       ownerId: user.id,
//     },
//     orderBy: {
//       createdAt: "desc",
//     },
//     take: 20,
//     include: {
//       owner: true,
//     },
//   })

//   const stats = {
//     totalDocuments: documents.length,
//     processed: documents.filter((d) => d.status === "COMPLETED").length,
//     pending: documents.filter((d) => d.status === "PENDING").length,
//     credits: user.credits,
//   }

//   return (
//     <div className="space-y-6 p-6 animate-fadeInUp">
//       <DashboardHeader user={user} />
//       <StatsCards stats={stats} />

//       <Card className="p-6">
//         <h2 className="text-lg font-semibold mb-4">Upload Documents</h2>
//         <Tabs defaultValue="files" className="space-y-4">
//           <TabsList>
//             <TabsTrigger value="files">Files</TabsTrigger>
//             <TabsTrigger value="camera">Camera</TabsTrigger>
//           </TabsList>

//           <TabsContent value="files">
//             <FileUploader
//               onFilesAdded={async (files) => {
//                 // Handle file upload
//               }}
//             />
//           </TabsContent>

//           <TabsContent value="camera">
//             <CameraCapture
//               onCapture={async (file) => {
//                 // Handle camera capture
//               }}
//             />
//           </TabsContent>
//         </Tabs>
//       </Card>

//       {documents.length === 0 ? <EmptyState /> : <DocumentGrid documents={documents} />}
//     </div>
//   )
// }

import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { getUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { DocumentGrid } from "@/components/dashboard/document-grid"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { EmptyState } from "@/components/dashboard/empty-state"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { FileUploader } from "@/components/file-uploader"
import { CameraCapture } from "@/components/camera-capture"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Document = {
  id: string
  status: string
  createdAt: Date
  ownerId: string
}

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }
//
  const user = await getUser()
  if (!user) {
    redirect("/sign-in")
  }

  const documents = await prisma.document.findMany({
    where: {
      ownerId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
    include: {
      owner: true,
    },
  })

  const stats = {
    totalDocuments: documents.length,
    processed: documents.filter((d: Document) => d.status === "COMPLETED").length,
    pending: documents.filter((d: Document) => d.status === "PENDING").length,
    credits: user.credits,
  }

  return (
    <div className="space-y-6 p-6 animate-fadeInUp">
      <DashboardHeader user={user} />
      <StatsCards stats={stats} />

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Upload Documents</h2>
        <Tabs defaultValue="files" className="space-y-4">
          <TabsList>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="camera">Camera</TabsTrigger>
          </TabsList>

          <TabsContent value="files">
            <FileUploader
              onFilesAdded={async (files) => {
                // Handle file upload
              }}
            />
          </TabsContent>

          <TabsContent value="camera">
            <CameraCapture
              onCapture={async (file) => {
                // Handle camera capture
              }}
            />
          </TabsContent>
        </Tabs>
      </Card>

      {documents.length === 0 ? <EmptyState /> : <DocumentGrid documents={documents} />}
    </div>
  )
}
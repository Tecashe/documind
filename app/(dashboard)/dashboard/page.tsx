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

// type Document = {
//   id: string
//   status: string
//   createdAt: Date
//   ownerId: string
// }

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
//     processed: documents.filter((d: Document) => d.status === "COMPLETED").length,
//     pending: documents.filter((d: Document) => d.status === "PENDING").length,
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
// import type { Document } from "@prisma/client"

// export default async function DashboardPage() {
//   const { userId } = await auth()

//   if (!userId) {
//     redirect("/sign-in")
//   }

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
//     processed: documents.filter((d: Document) => d.status === "COMPLETED").length,
//     pending: documents.filter((d: Document) => d.status === "PENDING").length,
//     credits: user.credits,
//   }

//   const handleFilesAdded = async (files: File[]) => {
//     "use server"
//     // Handle file upload in server action
//   }

//   const handleCapture = async (file: File) => {
//     "use server"
//     // Handle camera capture in server action
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="space-y-8 p-6 md:p-8 animate-fadeInUp">
//         <DashboardHeader user={user} />
//         <StatsCards stats={stats} />

//         {/* Upload Section */}
//         <Card className="border border-border/40 rounded-xl p-8 bg-card/50 backdrop-blur-sm">
//           <div className="space-y-6">
//             <div>
//               <h2 className="text-2xl font-semibold tracking-tight">Upload Documents</h2>
//               <p className="text-sm text-muted-foreground mt-1">
//                 Drag files, choose from files, or capture with camera. Processing starts automatically.
//               </p>
//             </div>

//             <Tabs defaultValue="files" className="space-y-4 w-full">
//               <TabsList className="bg-background border border-border/40 p-1 rounded-lg">
//                 <TabsTrigger value="files" className="gap-2">
//                   📁 Files
//                 </TabsTrigger>
//                 <TabsTrigger value="camera" className="gap-2">
//                   📷 Camera
//                 </TabsTrigger>
//               </TabsList>

//               <TabsContent value="files" className="space-y-4">
//                 <FileUploader onFilesAdded={handleFilesAdded} />
//               </TabsContent>

//               <TabsContent value="camera" className="space-y-4">
//                 <CameraCapture onCapture={handleCapture} />
//               </TabsContent>
//             </Tabs>
//           </div>
//         </Card>

//         {/* Documents Section */}
//         <div className="space-y-4">
//           <div>
//             <h2 className="text-2xl font-semibold tracking-tight">Recent Documents</h2>
//             <p className="text-sm text-muted-foreground mt-1">
//               {documents.length === 0
//                 ? "Upload your first document to get started"
//                 : `You have ${documents.length} document${documents.length === 1 ? "" : "s"}`}
//             </p>
//           </div>

//           {documents.length === 0 ? <EmptyState /> : <DocumentGrid documents={documents} />}
//         </div>
//       </div>
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
import type { Document } from "@prisma/client"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

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
    <div className="min-h-screen bg-background">
      <div className="space-y-8 p-6 md:p-8 animate-fadeInUp">
        <DashboardHeader user={user} />
        <StatsCards stats={stats} />

        {/* Upload Section */}
        <Card className="border border-border/40 rounded-xl p-8 bg-card/50 backdrop-blur-sm">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Upload Documents</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Drag files, choose from files, or capture with camera. Processing starts automatically.
              </p>
            </div>

            <Tabs defaultValue="files" className="space-y-4 w-full">
              <TabsList className="bg-background border border-border/40 p-1 rounded-lg">
                <TabsTrigger value="files" className="gap-2">
                  📁 Files
                </TabsTrigger>
                <TabsTrigger value="camera" className="gap-2">
                  📷 Camera
                </TabsTrigger>
              </TabsList>

              <TabsContent value="files" className="space-y-4">
                <FileUploader />
              </TabsContent>

              <TabsContent value="camera" className="space-y-4">
                <CameraCapture />
              </TabsContent>
            </Tabs>
          </div>
        </Card>

        {/* Documents Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Recent Documents</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {documents.length === 0
                ? "Upload your first document to get started"
                : `You have ${documents.length} document${documents.length === 1 ? "" : "s"}`}
            </p>
          </div>

          {documents.length === 0 ? <EmptyState /> : <DocumentGrid documents={documents} />}
        </div>
      </div>
    </div>
  )
}
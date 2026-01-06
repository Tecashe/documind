// import { prisma } from "@/lib/db"
// import { getUser, getCurrentTeam } from "@/lib/auth"
// import { v4 as uuidv4 } from "uuid"
// import { put } from "@vercel/blob"
// import { Queue } from "bullmq"
// import Redis from "ioredis"

// export const config = {
//   api: {
//     bodyParser: {
//       sizeLimit: "100mb",
//     },
//   },
// }

// const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379")
// const processingQueue = new Queue("document-processing", { connection: redis })

// export async function POST(req: Request) {
//   try {
//     const user = await getUser()
//     if (!user) {
//       return new Response("Unauthorized", { status: 401 })
//     }

//     const team = await getCurrentTeam()
//     const formData = await req.formData()
//     const files = formData.getAll("files") as File[]

//     if (!files || files.length === 0) {
//       return new Response(JSON.stringify({ error: "No files provided" }), { status: 400 })
//     }

//     const documents = []

//     for (const file of files) {
//       //Validate file type
//       const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/tiff", "image/heic"]

//       if (!allowedTypes.includes(file.type)) {
//         continue
//       }

//       // Upload to Blob storage
//       const buffer = await file.arrayBuffer()
//       const blobName = `${user.id}/${uuidv4()}/${file.name}`
//       const blob = await put(blobName, buffer, {
//         access: "public",//TODO-CHnage to private
//         contentType: file.type,
//       })

//       // Create document record
//       const document = await prisma.document.create({
//         data: {
//           title: file.name.replace(/\.[^/.]+$/, ""),
//           fileName: file.name,
//           fileUrl: blob.url,
//           fileSize: file.size,
//           fileType: file.type,
//           ownerId: user.id,
//           teamId: team?.id,
//           status: "PENDING",
//         },
//       })

//       documents.push({
//         id: document.id,
//         title: document.title,
//         fileUrl: document.fileUrl,
//       })

//       await processingQueue.add(
//         `process-${document.id}`,
//         {
//           documentId: document.id,
//           fileUrl: blob.url,
//           fileType: file.type,
//           userId: user.id,
//         },
//         {
//           attempts: 3,
//           backoff: {
//             type: "exponential",
//             delay: 2000,
//           },
//           removeOnComplete: true,
//         },
//       )

//       // Log the upload
//       await prisma.auditLog.create({
//         data: {
//           userId: user.id,
//           documentId: document.id,
//           action: "UPLOAD",
//           details: `Uploaded ${file.name}`,
//         },
//       })
//     }

//     return new Response(JSON.stringify({ documents, count: documents.length }), { status: 201 })
//   } catch (error) {
//     console.error("Upload error:", error)
//     return new Response(JSON.stringify({ error: "Upload failed" }), { status: 500 })
//   }
// }

// import { prisma } from "@/lib/db"
// import { getUser, getCurrentTeam } from "@/lib/auth"
// import { v4 as uuidv4 } from "uuid"
// import { put } from "@vercel/blob"
// import { Queue } from "bullmq"
// import Redis from "ioredis"
// import { NextRequest, NextResponse } from "next/server"

// // Next.js 15+ route segment config (replaces deprecated config export)
// export const maxDuration = 60 // Maximum execution time in seconds
// export const dynamic = "force-dynamic" // Disable caching for this route

// const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379")
// const processingQueue = new Queue("document-processing", { connection: redis })

// export async function POST(req: NextRequest) {
//   try {
//     const user = await getUser()
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const team = await getCurrentTeam()
//     const formData = await req.formData()
//     const files = formData.getAll("files") as File[]

//     if (!files || files.length === 0) {
//       return NextResponse.json({ error: "No files provided" }, { status: 400 })
//     }

//     const documents = []

//     for (const file of files) {
//       // Validate file type
//       const allowedTypes = [
//         "application/pdf",
//         "image/jpeg",
//         "image/png",
//         "image/tiff",
//         "image/heic",
//         "image/webp",
//       ]

//       if (!allowedTypes.includes(file.type)) {
//         console.warn(`Skipping unsupported file type: ${file.type}`)
//         continue
//       }

//       // Validate file size (100MB limit)
//       const maxSize = 100 * 1024 * 1024 // 100MB in bytes
//       if (file.size > maxSize) {
//         console.warn(`Skipping file ${file.name}: exceeds 100MB limit`)
//         continue
//       }

//       // Upload to Blob storage
//       const buffer = await file.arrayBuffer()
//       const blobName = `${user.id}/${uuidv4()}/${file.name}`
//       const blob = await put(blobName, buffer, {
//         access: "public", // TODO: Change to private in production
//         contentType: file.type,
//       })

//       // Create document record
//       const document = await prisma.document.create({
//         data: {
//           title: file.name.replace(/\.[^/.]+$/, ""),
//           fileName: file.name,
//           fileUrl: blob.url,
//           fileSize: file.size,
//           fileType: file.type,
//           ownerId: user.id,
//           teamId: team?.id,
//           status: "PENDING",
//         },
//       })

//       documents.push({
//         id: document.id,
//         title: document.title,
//         fileUrl: document.fileUrl,
//         status: document.status,
//       })

//       // Add to processing queue
//       await processingQueue.add(
//         `process-${document.id}`,
//         {
//           documentId: document.id,
//           fileUrl: blob.url,
//           fileType: file.type,
//           userId: user.id,
//         },
//         {
//           attempts: 3,
//           backoff: {
//             type: "exponential",
//             delay: 2000,
//           },
//           removeOnComplete: true,
//         }
//       )

//       // Log the upload
//       await prisma.auditLog.create({
//         data: {
//           userId: user.id,
//           documentId: document.id,
//           action: "UPLOAD",
//           details: `Uploaded ${file.name}`,
//         },
//       })
//     }

//     return NextResponse.json(
//       {
//         documents,
//         count: documents.length,
//         message: `Successfully uploaded ${documents.length} document(s)`,
//       },
//       { status: 201 }
//     )
//   } catch (error) {
//     console.error("Upload error:", error)
//     return NextResponse.json(
//       {
//         error: "Upload failed",
//         details: error instanceof Error ? error.message : "Unknown error",
//       },
//       { status: 500 }
//     )
//   }
// }

// import { NextRequest, NextResponse } from "next/server"
// import { prisma } from "@/lib/db"
// import { getUser } from "@/lib/auth"
// import { put } from "@vercel/blob"
// import { v4 as uuidv4 } from "uuid"

// export const maxDuration = 60
// export const dynamic = "force-dynamic"

// export async function POST(req: NextRequest) {
//   try {
//     const user = await getUser()
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const formData = await req.formData()
//     const files = formData.getAll("files") as File[]

//     if (!files || files.length === 0) {
//       return NextResponse.json({ error: "No files provided" }, { status: 400 })
//     }

//     const documents = []

//     for (const file of files) {
//       // Validate file
//       const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/tiff", "image/heic"]
//       if (!allowedTypes.includes(file.type)) continue
//       if (file.size > 100 * 1024 * 1024) continue // 100MB limit

//       // Upload to blob storage
//       const buffer = await file.arrayBuffer()
//       const blobName = `${user.id}/${uuidv4()}/${file.name}`
//       const blob = await put(blobName, buffer, {
//         access: "public",
//         contentType: file.type,
//       })

//       // Create document
//       const document = await prisma.document.create({
//         data: {
//           title: file.name.replace(/\.[^/.]+$/, ""),
//           fileName: file.name,
//           fileUrl: blob.url,
//           fileSize: file.size,
//           fileType: file.type,
//           ownerId: user.id,
//           status: "PENDING",
//         },
//       })

//       documents.push(document)

//       // Trigger immediate processing (no queue for now - simpler)
//       fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/documents/${document.id}/process`, {
//         method: "POST",
//       }).catch(console.error)
//     }

//     return NextResponse.json({ documents, count: documents.length }, { status: 201 })
//   } catch (error) {
//     console.error("Upload error:", error)
//     return NextResponse.json({ error: "Upload failed" }, { status: 500 })
//   }
// }

// import { NextRequest, NextResponse } from "next/server"
// import { auth } from "@clerk/nextjs/server"
// import { prisma } from "@/lib/db"
// import { put } from "@vercel/blob"
// import { v4 as uuidv4 } from "uuid"

// export const maxDuration = 60
// export const dynamic = "force-dynamic"

// export async function POST(req: NextRequest) {
//   try {
//     const { userId } = await auth()
    
//     if (!userId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const user = await prisma.user.findUnique({
//       where: { clerkId: userId },
//     })

//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 })
//     }

//     const formData = await req.formData()
//     const files = formData.getAll("files") as File[]

//     if (!files || files.length === 0) {
//       return NextResponse.json({ error: "No files provided" }, { status: 400 })
//     }

//     const documents = []
//     const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/tiff", "image/heic"]

//     for (const file of files) {
//       // Validate file
//       if (!allowedTypes.includes(file.type)) {
//         console.warn(`Skipping unsupported file type: ${file.type}`)
//         continue
//       }
      
//       if (file.size > 100 * 1024 * 1024) {
//         console.warn(`Skipping file ${file.name}: exceeds 100MB limit`)
//         continue
//       }

//       // Upload to blob storage
//       const buffer = await file.arrayBuffer()
//       const blobName = `${user.id}/${uuidv4()}/${file.name}`
      
//       const blob = await put(blobName, buffer, {
//         access: "public",
//         contentType: file.type,
//       })

//       // Create document
//       const document = await prisma.document.create({
//         data: {
//           title: file.name.replace(/\.[^/.]+$/, ""),
//           fileName: file.name,
//           fileUrl: blob.url,
//           fileSize: file.size,
//           fileType: file.type,
//           ownerId: user.id,
//           status: "PENDING",
//         },
//       })

//       documents.push(document)

//       // Trigger processing immediately (don't wait for response)
//       const origin = req.nextUrl.origin
//       fetch(`${origin}/api/documents/${document.id}/process`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//       }).catch((err) => {
//         console.error(`Failed to trigger processing for ${document.id}:`, err)
//       })

//       // Log upload
//       await prisma.auditLog.create({
//         data: {
//           userId: user.id,
//           documentId: document.id,
//           action: "UPLOAD",
//           details: `Uploaded ${file.name}`,
//         },
//       })
//     }

//     return NextResponse.json(
//       {
//         documents,
//         count: documents.length,
//         message: `Successfully uploaded ${documents.length} document(s)`,
//       },
//       { status: 201 }
//     )
//   } catch (error) {
//     console.error("Upload error:", error)
//     return NextResponse.json(
//       {
//         error: "Upload failed",
//         details: error instanceof Error ? error.message : "Unknown error",
//       },
//       { status: 500 }
//     )
//   }
// }

// app/api/documents/upload/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { put } from "@vercel/blob"
import { v4 as uuidv4 } from "uuid"

export const maxDuration = 60
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const formData = await req.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    const documents = []
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/tiff", "image/heic"]

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        console.warn(`Skipping unsupported file type: ${file.type}`)
        continue
      }

      if (file.size > 100 * 1024 * 1024) {
        console.warn(`Skipping file ${file.name}: exceeds 100MB limit`)
        continue
      }

      const buffer = await file.arrayBuffer()
      const blobName = `${user.id}/${uuidv4()}/${file.name}`

      const blob = await put(blobName, buffer, {
        access: "public",
        contentType: file.type,
      })

      // ✅ Create with status UPLOADED (not auto-processing)
      const document = await prisma.document.create({
        data: {
          title: file.name.replace(/\.[^/.]+$/, ""),
          fileName: file.name,
          fileUrl: blob.url,
          fileSize: file.size,
          fileType: file.type,
          ownerId: user.id,
          status: "PENDING", // Will change to PROCESSING when user clicks process
        },
      })

      documents.push(document)

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          documentId: document.id,
          action: "UPLOAD",
          details: `Uploaded ${file.name}`,
        },
      })
    }

    return NextResponse.json(
      {
        documents,
        count: documents.length,
        message: `Successfully uploaded ${documents.length} document(s). Ready to process.`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
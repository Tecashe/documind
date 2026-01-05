import { prisma } from "@/lib/db"
import { getUser, getCurrentTeam } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid"
import { put } from "@vercel/blob"
import { Queue } from "bullmq"
import Redis from "ioredis"

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "100mb",
    },
  },
}

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379")
const processingQueue = new Queue("document-processing", { connection: redis })

export async function POST(req: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const team = await getCurrentTeam()
    const formData = await req.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return new Response(JSON.stringify({ error: "No files provided" }), { status: 400 })
    }

    const documents = []

    for (const file of files) {
      //Validate file type
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/tiff", "image/heic"]

      if (!allowedTypes.includes(file.type)) {
        continue
      }

      // Upload to Blob storage
      const buffer = await file.arrayBuffer()
      const blobName = `${user.id}/${uuidv4()}/${file.name}`
      const blob = await put(blobName, buffer, {
        access: "public",//TODO-CHnage to private
        contentType: file.type,
      })

      // Create document record
      const document = await prisma.document.create({
        data: {
          title: file.name.replace(/\.[^/.]+$/, ""),
          fileName: file.name,
          fileUrl: blob.url,
          fileSize: file.size,
          fileType: file.type,
          ownerId: user.id,
          teamId: team?.id,
          status: "PENDING",
        },
      })

      documents.push({
        id: document.id,
        title: document.title,
        fileUrl: document.fileUrl,
      })

      await processingQueue.add(
        `process-${document.id}`,
        {
          documentId: document.id,
          fileUrl: blob.url,
          fileType: file.type,
          userId: user.id,
        },
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 2000,
          },
          removeOnComplete: true,
        },
      )

      // Log the upload
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          documentId: document.id,
          action: "UPLOAD",
          details: `Uploaded ${file.name}`,
        },
      })
    }

    return new Response(JSON.stringify({ documents, count: documents.length }), { status: 201 })
  } catch (error) {
    console.error("Upload error:", error)
    return new Response(JSON.stringify({ error: "Upload failed" }), { status: 500 })
  }
}

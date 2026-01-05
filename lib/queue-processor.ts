import { Queue, Worker } from "bullmq"
import Redis from "ioredis"
import { prisma } from "./db"
import vision from "@google-cloud/vision"
import { Anthropic } from "@anthropic-ai/sdk"

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379")
const processingQueue = new Queue("document-processing", { connection: redis })

const visionClient = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
})

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Create worker to process queued documents
export const documentProcessor = new Worker(
  "document-processing",
  async (job) => {
    const { documentId, fileUrl, fileType, userId } = job.data

    try {
      // Update status to processing
      await prisma.document.update({
        where: { id: documentId },
        data: { status: "PROCESSING" },
      })

      // Extract text using Google Vision API
      const [result] = await visionClient.documentTextDetection({
        image: { source: { imageUri: fileUrl } },
      })

      const extractedText = result.fullTextAnnotation?.text || ""

      if (!extractedText) {
        throw new Error("No text extracted")
      }

      // Store content
      await prisma.documentContent.upsert({
        where: { documentId },
        create: {
          documentId,
          rawText: extractedText,
        },
        update: { rawText: extractedText },
      })

      // Classify using Claude
      const classificationResponse = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `Classify this document and extract key fields. Return JSON with type and confidence:
${extractedText.substring(0, 3000)}`,
          },
        ],
      })

      const classificationText =
        classificationResponse.content[0].type === "text" ? classificationResponse.content[0].text : ""

      let classificationData: any = { type: "GENERAL", confidence: 0.5 }
      try {
        const jsonMatch = classificationText.match(/\{[\s\S]*\}/)
        classificationData = jsonMatch ? JSON.parse(jsonMatch[0]) : classificationData
      } catch {
        // Use default
      }

      // Update document with results
      await prisma.document.update({
        where: { id: documentId },
        data: {
          status: "COMPLETED",
          processedAt: new Date(),
          documentType: classificationData.type || "GENERAL",
          language: "en",
        },
      })

      // Log completion
      await prisma.auditLog.create({
        data: {
          userId,
          documentId,
          action: "PROCESS_COMPLETE",
          details: `Processed document: ${classificationData.type}`,
        },
      })

      return { success: true, documentId }
    } catch (error) {
      await prisma.document.update({
        where: { id: documentId },
        data: { status: "FAILED" },
      })

      await prisma.auditLog.create({
        data: {
          userId,
          documentId,
          action: "PROCESS_FAILED",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      })

      throw error
    }
  },
  { connection: redis, concurrency: 5 },
)

export default processingQueue

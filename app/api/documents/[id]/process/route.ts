import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { Anthropic } from "@anthropic-ai/sdk"
import vision from "@google-cloud/vision"
import { ERROR_CODES, DocumentProcessingError } from "@/lib/errors"
import type { ClassificationResult } from "@/lib/types"

const visionClient = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
})

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const startTime = Date.now()

  try {
    const { userId } = await auth()
    if (!userId) {
      throw new DocumentProcessingError(
        ERROR_CODES.UNAUTHORIZED.code,
        ERROR_CODES.UNAUTHORIZED.message,
        ERROR_CODES.UNAUTHORIZED.status,
      )
    }

    const document = await prisma.document.findUnique({
      where: { id: params.id },
    })

    if (!document) {
      throw new DocumentProcessingError(
        ERROR_CODES.NOT_FOUND.code,
        ERROR_CODES.NOT_FOUND.message,
        ERROR_CODES.NOT_FOUND.status,
      )
    }

    await prisma.document.update({
      where: { id: params.id },
      data: { status: "PROCESSING" },
    })

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (user) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          documentId: params.id,
          action: "PROCESS_START",
          details: `Started processing: ${document.fileName}`,
        },
      })
    }

    // Fetch and process document
    let extractedText: string

    try {
      const response = await fetch(document.fileUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch document: ${response.statusText}`)
      }

      const buffer = await response.arrayBuffer()
      const [result] = await visionClient.documentTextDetection({
        image: { content: Buffer.from(buffer) },
      })

      extractedText = result.fullTextAnnotation?.text || ""

      if (!extractedText.trim()) {
        throw new DocumentProcessingError(
          ERROR_CODES.NO_TEXT_EXTRACTED.code,
          ERROR_CODES.NO_TEXT_EXTRACTED.message,
          ERROR_CODES.NO_TEXT_EXTRACTED.status,
        )
      }
    } catch (error) {
      if (error instanceof DocumentProcessingError) throw error

      console.error("[v0] Vision API error:", error)
      throw new DocumentProcessingError(
        ERROR_CODES.VISION_API_ERROR.code,
        ERROR_CODES.VISION_API_ERROR.message,
        ERROR_CODES.VISION_API_ERROR.status,
      )
    }

    // Store extracted content
    await prisma.documentContent.upsert({
      where: { documentId: document.id },
      create: {
        documentId: document.id,
        rawText: extractedText,
      },
      update: {
        rawText: extractedText,
      },
    })

    // Classify document
    let classificationData: ClassificationResult = {
      type: "GENERAL",
      confidence: 0.5,
      language: "en",
    }

    try {
      const classificationResponse = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: `Analyze this document and return ONLY a JSON response (no markdown, no explanation) with:
{
  "type": one of [INVOICE, RECEIPT, FORM, CONTRACT, ID_DOCUMENT, MEDICAL, FINANCIAL, LEGAL, GENERAL],
  "confidence": 0-1,
  "language": "detected language code",
  "extractedFields": {
    "key": "value pairs for the document type"
  }
}

Document text:
${extractedText.substring(0, 4000)}`,
          },
        ],
      })

      const classificationText =
        classificationResponse.content[0].type === "text" ? classificationResponse.content[0].text : ""

      try {
        const jsonMatch = classificationText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          classificationData = {
            type: parsed.type || "GENERAL",
            confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
            language: parsed.language || "en",
            extractedFields: parsed.extractedFields || {},
          }
        }
      } catch (parseError) {
        console.error("[v0] Failed to parse classification JSON:", parseError)
        // Use default classification
      }
    } catch (error) {
      console.error("[v0] Classification error:", error)
      // Continue with default classification
    }

    // Save classification and extracted fields
    await prisma.classification.upsert({
      where: { documentId: document.id },
      create: {
        documentId: document.id,
        type: classificationData.type,
        confidence: classificationData.confidence,
      },
      update: {
        type: classificationData.type,
        confidence: classificationData.confidence,
      },
    })

    // Save extracted fields
    if (classificationData.extractedFields) {
      // Clear existing fields
      await prisma.field.deleteMany({
        where: { documentId: document.id },
      })

      // Create new fields
      await Promise.all(
        Object.entries(classificationData.extractedFields).map(([label, value]) =>
          prisma.field.create({
            data: {
              documentId: document.id,
              label,
              value: String(value),
              confidence: classificationData.confidence,
            },
          }),
        ),
      )
    }

    const processingTimeMs = Date.now() - startTime

    const updatedDocument = await prisma.document.update({
      where: { id: params.id },
      data: {
        status: "COMPLETED",
        processedAt: new Date(),
        documentType: classificationData.type,
        language: classificationData.language,
        confidence: classificationData.confidence,
      },
      include: {
        content: true,
        classifications: true,
        fields: true,
      },
    })

    if (user) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          documentId: params.id,
          action: "PROCESS_COMPLETE",
          details: `Processed as ${classificationData.type} (${processingTimeMs}ms, confidence: ${(classificationData.confidence * 100).toFixed(1)}%)`,
        },
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        document: updatedDocument,
        processingTimeMs,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  } catch (error) {
    const processingTimeMs = Date.now() - startTime

    const user = await prisma.user.findFirst({
      where: { clerkId: (await auth()).userId || "" },
    })

    const errorMessage = error instanceof Error ? error.message : "Unknown processing error"

    if (user) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          documentId: params.id,
          action: "PROCESS_FAILED",
          details: `Failed after ${processingTimeMs}ms: ${errorMessage}`,
        },
      })
    }

    await prisma.document.update({
      where: { id: params.id },
      data: { status: "FAILED" },
    })

    if (error instanceof DocumentProcessingError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
          code: error.code,
        }),
        { status: error.statusCode, headers: { "Content-Type": "application/json" } },
      )
    }

    console.error("[v0] Processing error:", error)

    return new Response(
      JSON.stringify({
        success: false,
        error: ERROR_CODES.PROCESSING_FAILED.message,
        code: ERROR_CODES.PROCESSING_FAILED.code,
      }),
      { status: ERROR_CODES.PROCESSING_FAILED.status, headers: { "Content-Type": "application/json" } },
    )
  }
}

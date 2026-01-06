// import { auth } from "@clerk/nextjs/server"
// import { prisma } from "@/lib/db"
// import { Anthropic } from "@anthropic-ai/sdk"
// import vision from "@google-cloud/vision"
// import { ERROR_CODES, DocumentProcessingError } from "@/lib/errors"
// import type { ClassificationResult } from "@/lib/types"

// const visionClient = new vision.ImageAnnotatorClient({
//   keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
// })

// const anthropic = new Anthropic({
//   apiKey: process.env.ANTHROPIC_API_KEY,
// })

// export async function POST(req: Request, { params }: { params: { id: string } }) {
//   const startTime = Date.now()

//   try {
//     const { userId } = await auth()
//     if (!userId) {
//       throw new DocumentProcessingError(
//         ERROR_CODES.UNAUTHORIZED.code,
//         ERROR_CODES.UNAUTHORIZED.message,
//         ERROR_CODES.UNAUTHORIZED.status,
//       )
//     }

//     const document = await prisma.document.findUnique({
//       where: { id: params.id },
//     })

//     if (!document) {
//       throw new DocumentProcessingError(
//         ERROR_CODES.NOT_FOUND.code,
//         ERROR_CODES.NOT_FOUND.message,
//         ERROR_CODES.NOT_FOUND.status,
//       )
//     }

//     await prisma.document.update({
//       where: { id: params.id },
//       data: { status: "PROCESSING" },
//     })

//     const user = await prisma.user.findUnique({
//       where: { clerkId: userId },
//     })

//     if (user) {
//       await prisma.auditLog.create({
//         data: {
//           userId: user.id,
//           documentId: params.id,
//           action: "PROCESS_START",
//           details: `Started processing: ${document.fileName}`,
//         },
//       })
//     }

//     // Fetch and process document
//     let extractedText: string

//     try {
//       const response = await fetch(document.fileUrl)
//       if (!response.ok) {
//         throw new Error(`Failed to fetch document: ${response.statusText}`)
//       }

//       const buffer = await response.arrayBuffer()
//       const [result] = await visionClient.documentTextDetection({
//         image: { content: Buffer.from(buffer) },
//       })

//       extractedText = result.fullTextAnnotation?.text || ""

//       if (!extractedText.trim()) {
//         throw new DocumentProcessingError(
//           ERROR_CODES.NO_TEXT_EXTRACTED.code,
//           ERROR_CODES.NO_TEXT_EXTRACTED.message,
//           ERROR_CODES.NO_TEXT_EXTRACTED.status,
//         )
//       }
//     } catch (error) {
//       if (error instanceof DocumentProcessingError) throw error

//       console.error("[v0] Vision API error:", error)
//       throw new DocumentProcessingError(
//         ERROR_CODES.VISION_API_ERROR.code,
//         ERROR_CODES.VISION_API_ERROR.message,
//         ERROR_CODES.VISION_API_ERROR.status,
//       )
//     }

//     // Store extracted content
//     await prisma.documentContent.upsert({
//       where: { documentId: document.id },
//       create: {
//         documentId: document.id,
//         rawText: extractedText,
//       },
//       update: {
//         rawText: extractedText,
//       },
//     })

//     // Classify document
//     let classificationData: ClassificationResult = {
//       type: "GENERAL",
//       confidence: 0.5,
//       language: "en",
//     }

//     try {
//       const classificationResponse = await anthropic.messages.create({
//         model: "claude-3-5-sonnet-20241022",
//         max_tokens: 2048,
//         messages: [
//           {
//             role: "user",
//             content: `Analyze this document and return ONLY a JSON response (no markdown, no explanation) with:
// {
//   "type": one of [INVOICE, RECEIPT, FORM, CONTRACT, ID_DOCUMENT, MEDICAL, FINANCIAL, LEGAL, GENERAL],
//   "confidence": 0-1,
//   "language": "detected language code",
//   "extractedFields": {
//     "key": "value pairs for the document type"
//   }
// }

// Document text:
// ${extractedText.substring(0, 4000)}`,
//           },
//         ],
//       })

//       const classificationText =
//         classificationResponse.content[0].type === "text" ? classificationResponse.content[0].text : ""

//       try {
//         const jsonMatch = classificationText.match(/\{[\s\S]*\}/)
//         if (jsonMatch) {
//           const parsed = JSON.parse(jsonMatch[0])
//           classificationData = {
//             type: parsed.type || "GENERAL",
//             confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
//             language: parsed.language || "en",
//             extractedFields: parsed.extractedFields || {},
//           }
//         }
//       } catch (parseError) {
//         console.error("[v0] Failed to parse classification JSON:", parseError)
//         // Use default classification
//       }
//     } catch (error) {
//       console.error("[v0] Classification error:", error)
//       // Continue with default classification
//     }

//     // Save classification and extracted fields
//     await prisma.classification.upsert({
//       where: { documentId: document.id },
//       create: {
//         documentId: document.id,
//         type: classificationData.type,
//         confidence: classificationData.confidence,
//       },
//       update: {
//         type: classificationData.type,
//         confidence: classificationData.confidence,
//       },
//     })

//     // Save extracted fields
//     if (classificationData.extractedFields) {
//       // Clear existing fields
//       await prisma.field.deleteMany({
//         where: { documentId: document.id },
//       })

//       // Create new fields
//       await Promise.all(
//         Object.entries(classificationData.extractedFields).map(([label, value]) =>
//           prisma.field.create({
//             data: {
//               documentId: document.id,
//               label,
//               value: String(value),
//               confidence: classificationData.confidence,
//             },
//           }),
//         ),
//       )
//     }

//     const processingTimeMs = Date.now() - startTime

//     const updatedDocument = await prisma.document.update({
//       where: { id: params.id },
//       data: {
//         status: "COMPLETED",
//         processedAt: new Date(),
//         documentType: classificationData.type,
//         language: classificationData.language,
//         confidence: classificationData.confidence,
//       },
//       include: {
//         content: true,
//         classifications: true,
//         fields: true,
//       },
//     })

//     if (user) {
//       await prisma.auditLog.create({
//         data: {
//           userId: user.id,
//           documentId: params.id,
//           action: "PROCESS_COMPLETE",
//           details: `Processed as ${classificationData.type} (${processingTimeMs}ms, confidence: ${(classificationData.confidence * 100).toFixed(1)}%)`,
//         },
//       })
//     }

//     return new Response(
//       JSON.stringify({
//         success: true,
//         document: updatedDocument,
//         processingTimeMs,
//       }),
//       { status: 200, headers: { "Content-Type": "application/json" } },
//     )
//   } catch (error) {
//     const processingTimeMs = Date.now() - startTime

//     const user = await prisma.user.findFirst({
//       where: { clerkId: (await auth()).userId || "" },
//     })

//     const errorMessage = error instanceof Error ? error.message : "Unknown processing error"

//     if (user) {
//       await prisma.auditLog.create({
//         data: {
//           userId: user.id,
//           documentId: params.id,
//           action: "PROCESS_FAILED",
//           details: `Failed after ${processingTimeMs}ms: ${errorMessage}`,
//         },
//       })
//     }

//     await prisma.document.update({
//       where: { id: params.id },
//       data: { status: "FAILED" },
//     })

//     if (error instanceof DocumentProcessingError) {
//       return new Response(
//         JSON.stringify({
//           success: false,
//           error: error.message,
//           code: error.code,
//         }),
//         { status: error.statusCode, headers: { "Content-Type": "application/json" } },
//       )
//     }

//     console.error("[v0] Processing error:", error)

//     return new Response(
//       JSON.stringify({
//         success: false,
//         error: ERROR_CODES.PROCESSING_FAILED.message,
//         code: ERROR_CODES.PROCESSING_FAILED.code,
//       }),
//       { status: ERROR_CODES.PROCESSING_FAILED.status, headers: { "Content-Type": "application/json" } },
//     )
//   }
// }


// import { auth } from "@clerk/nextjs/server"
// import { prisma } from "@/lib/db"
// import { Anthropic } from "@anthropic-ai/sdk"
// import vision from "@google-cloud/vision"
// import { ERROR_CODES, DocumentProcessingError } from "@/lib/errors"
// import type { ClassificationResult } from "@/lib/types"

// // ✅ Updated: Parse credentials from environment variable
// const credentials = process.env.GOOGLE_CLOUD_KEY 
//   ? JSON.parse(process.env.GOOGLE_CLOUD_KEY)
//   : undefined

// const visionClient = new vision.ImageAnnotatorClient({
//   credentials, // ✅ Use credentials object instead of keyFilename
// })

// const anthropic = new Anthropic({
//   apiKey: process.env.ANTHROPIC_API_KEY,
// })

// export async function POST(req: Request, { params }: { params: { id: string } }) {
//   const startTime = Date.now()

//   try {
//     // ✅ Verify credentials are configured
//     if (!process.env.GOOGLE_CLOUD_KEY) {
//       throw new DocumentProcessingError(
//         "MISSING_CREDENTIALS",
//         "Google Cloud credentials not configured",
//         500,
//       )
//     }

//     const { userId } = await auth()
//     if (!userId) {
//       throw new DocumentProcessingError(
//         ERROR_CODES.UNAUTHORIZED.code,
//         ERROR_CODES.UNAUTHORIZED.message,
//         ERROR_CODES.UNAUTHORIZED.status,
//       )
//     }

//     const document = await prisma.document.findUnique({
//       where: { id: params.id },
//     })

//     if (!document) {
//       throw new DocumentProcessingError(
//         ERROR_CODES.NOT_FOUND.code,
//         ERROR_CODES.NOT_FOUND.message,
//         ERROR_CODES.NOT_FOUND.status,
//       )
//     }

//     await prisma.document.update({
//       where: { id: params.id },
//       data: { status: "PROCESSING" },
//     })

//     const user = await prisma.user.findUnique({
//       where: { clerkId: userId },
//     })

//     if (user) {
//       await prisma.auditLog.create({
//         data: {
//           userId: user.id,
//           documentId: params.id,
//           action: "PROCESS_START",
//           details: `Started processing: ${document.fileName}`,
//         },
//       })
//     }

//     // Fetch and process document
//     let extractedText: string

//     try {
//       const response = await fetch(document.fileUrl)
//       if (!response.ok) {
//         throw new Error(`Failed to fetch document: ${response.statusText}`)
//       }

//       const buffer = await response.arrayBuffer()
//       const [result] = await visionClient.documentTextDetection({
//         image: { content: Buffer.from(buffer) },
//       })

//       extractedText = result.fullTextAnnotation?.text || ""

//       if (!extractedText.trim()) {
//         throw new DocumentProcessingError(
//           ERROR_CODES.NO_TEXT_EXTRACTED.code,
//           ERROR_CODES.NO_TEXT_EXTRACTED.message,
//           ERROR_CODES.NO_TEXT_EXTRACTED.status,
//         )
//       }
//     } catch (error) {
//       if (error instanceof DocumentProcessingError) throw error

//       console.error("[Document Processing] Vision API error:", error)
//       throw new DocumentProcessingError(
//         ERROR_CODES.VISION_API_ERROR.code,
//         ERROR_CODES.VISION_API_ERROR.message,
//         ERROR_CODES.VISION_API_ERROR.status,
//       )
//     }

//     // Store extracted content
//     await prisma.documentContent.upsert({
//       where: { documentId: document.id },
//       create: {
//         documentId: document.id,
//         rawText: extractedText,
//       },
//       update: {
//         rawText: extractedText,
//       },
//     })

//     // Classify document
//     let classificationData: ClassificationResult = {
//       type: "GENERAL",
//       confidence: 0.5,
//       language: "en",
//     }

//     try {
//       const classificationResponse = await anthropic.messages.create({
//         model: "claude-3-5-sonnet-20241022",
//         max_tokens: 2048,
//         messages: [
//           {
//             role: "user",
//             content: `Analyze this document and return ONLY a JSON response (no markdown, no explanation) with:
// {
//   "type": one of [INVOICE, RECEIPT, FORM, CONTRACT, ID_DOCUMENT, MEDICAL, FINANCIAL, LEGAL, GENERAL],
//   "confidence": 0-1,
//   "language": "detected language code",
//   "extractedFields": {
//     "key": "value pairs for the document type"
//   }
// }

// Document text:
// ${extractedText.substring(0, 4000)}`,
//           },
//         ],
//       })

//       const classificationText =
//         classificationResponse.content[0].type === "text" ? classificationResponse.content[0].text : ""

//       try {
//         const jsonMatch = classificationText.match(/\{[\s\S]*\}/)
//         if (jsonMatch) {
//           const parsed = JSON.parse(jsonMatch[0])
//           classificationData = {
//             type: parsed.type || "GENERAL",
//             confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
//             language: parsed.language || "en",
//             extractedFields: parsed.extractedFields || {},
//           }
//         }
//       } catch (parseError) {
//         console.error("[Document Processing] Failed to parse classification JSON:", parseError)
//         // Use default classification
//       }
//     } catch (error) {
//       console.error("[Document Processing] Classification error:", error)
//       // Continue with default classification
//     }

//     // Save classification and extracted fields
//     await prisma.classification.upsert({
//       where: { documentId: document.id },
//       create: {
//         documentId: document.id,
//         type: classificationData.type,
//         confidence: classificationData.confidence,
//       },
//       update: {
//         type: classificationData.type,
//         confidence: classificationData.confidence,
//       },
//     })

//     // Save extracted fields
//     if (classificationData.extractedFields) {
//       // Clear existing fields
//       await prisma.field.deleteMany({
//         where: { documentId: document.id },
//       })

//       // Create new fields
//       await Promise.all(
//         Object.entries(classificationData.extractedFields).map(([label, value]) =>
//           prisma.field.create({
//             data: {
//               documentId: document.id,
//               label,
//               value: String(value),
//               confidence: classificationData.confidence,
//             },
//           }),
//         ),
//       )
//     }

//     const processingTimeMs = Date.now() - startTime

//     const updatedDocument = await prisma.document.update({
//       where: { id: params.id },
//       data: {
//         status: "COMPLETED",
//         processedAt: new Date(),
//         documentType: classificationData.type,
//         language: classificationData.language,
//         confidence: classificationData.confidence,
//       },
//       include: {
//         content: true,
//         classifications: true,
//         fields: true,
//       },
//     })

//     if (user) {
//       await prisma.auditLog.create({
//         data: {
//           userId: user.id,
//           documentId: params.id,
//           action: "PROCESS_COMPLETE",
//           details: `Processed as ${classificationData.type} (${processingTimeMs}ms, confidence: ${(classificationData.confidence * 100).toFixed(1)}%)`,
//         },
//       })
//     }

//     return new Response(
//       JSON.stringify({
//         success: true,
//         document: updatedDocument,
//         processingTimeMs,
//       }),
//       { status: 200, headers: { "Content-Type": "application/json" } },
//     )
//   } catch (error) {
//     const processingTimeMs = Date.now() - startTime

//     const user = await prisma.user.findFirst({
//       where: { clerkId: (await auth()).userId || "" },
//     })

//     const errorMessage = error instanceof Error ? error.message : "Unknown processing error"

//     if (user) {
//       await prisma.auditLog.create({
//         data: {
//           userId: user.id,
//           documentId: params.id,
//           action: "PROCESS_FAILED",
//           details: `Failed after ${processingTimeMs}ms: ${errorMessage}`,
//         },
//       })
//     }

//     await prisma.document.update({
//       where: { id: params.id },
//       data: { status: "FAILED" },
//     })

//     if (error instanceof DocumentProcessingError) {
//       return new Response(
//         JSON.stringify({
//           success: false,
//           error: error.message,
//           code: error.code,
//         }),
//         { status: error.statusCode, headers: { "Content-Type": "application/json" } },
//       )
//     }

//     console.error("[Document Processing] Processing error:", error)

//     return new Response(
//       JSON.stringify({
//         success: false,
//         error: ERROR_CODES.PROCESSING_FAILED.message,
//         code: ERROR_CODES.PROCESSING_FAILED.code,
//       }),
//       { status: ERROR_CODES.PROCESSING_FAILED.status, headers: { "Content-Type": "application/json" } },
//     )
//   }
// }


// import { auth } from "@clerk/nextjs/server"
// import { prisma } from "@/lib/db"
// import { Anthropic } from "@anthropic-ai/sdk"
// import vision from "@google-cloud/vision"
// import { ERROR_CODES, DocumentProcessingError } from "@/lib/errors"
// import { DocumentType } from "@prisma/client"
// import { NextRequest, NextResponse } from "next/server"

// // Type-safe classification result
// interface ClassificationResult {
//   type: DocumentType
//   confidence: number
//   language: string
//   extractedFields?: Record<string, string | number>
// }

// // Valid document types from Prisma enum
// const VALID_DOCUMENT_TYPES: DocumentType[] = [
//   "INVOICE",
//   "RECEIPT",
//   "FORM",
//   "CONTRACT",
//   "ID_DOCUMENT",
//   "MEDICAL",
//   "FINANCIAL",
//   "LEGAL",
//   "GENERAL",
// ]

// // Type guard to check if string is valid DocumentType
// function isValidDocumentType(type: string): type is DocumentType {
//   return VALID_DOCUMENT_TYPES.includes(type as DocumentType)
// }

// // Parse credentials from environment variable
// const credentials = process.env.GOOGLE_CLOUD_KEY
//   ? JSON.parse(process.env.GOOGLE_CLOUD_KEY)
//   : undefined

// const visionClient = new vision.ImageAnnotatorClient({
//   credentials,
// })

// const anthropic = new Anthropic({
//   apiKey: process.env.ANTHROPIC_API_KEY,
// })

// export async function POST(
//   req: NextRequest,
//  { params }: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await params
//   const startTime = Date.now()

//   try {
//     // Verify credentials are configured
//     if (!process.env.GOOGLE_CLOUD_KEY) {
//       throw new DocumentProcessingError(
//         "MISSING_CREDENTIALS",
//         "Google Cloud credentials not configured",
//         500
//       )
//     }

//     const { userId } = await auth()
//     if (!userId) {
//       throw new DocumentProcessingError(
//         ERROR_CODES.UNAUTHORIZED.code,
//         ERROR_CODES.UNAUTHORIZED.message,
//         ERROR_CODES.UNAUTHORIZED.status
//       )
//     }

//     const document = await prisma.document.findUnique({
//      where: { id },
//     })

//     if (!document) {
//       throw new DocumentProcessingError(
//         ERROR_CODES.NOT_FOUND.code,
//         ERROR_CODES.NOT_FOUND.message,
//         ERROR_CODES.NOT_FOUND.status
//       )
//     }

//     await prisma.document.update({
//       where: { id },
//       data: { status: "PROCESSING" },
//     })

//     const user = await prisma.user.findUnique({
//       where: { clerkId: userId },
//     })

//     if (user) {
//       await prisma.auditLog.create({
//         data: {
//           userId: user.id,
//           documentId: id,
//           action: "PROCESS_START",
//           details: `Started processing: ${document.fileName}`,
//         },
//       })
//     }

//     // Fetch and process document
//     let extractedText: string

//     try {
//       const response = await fetch(document.fileUrl)
//       if (!response.ok) {
//         throw new Error(`Failed to fetch document: ${response.statusText}`)
//       }

//       const buffer = await response.arrayBuffer()
//       const [result] = await visionClient.documentTextDetection({
//         image: { content: Buffer.from(buffer) },
//       })

//       extractedText = result.fullTextAnnotation?.text || ""

//       if (!extractedText.trim()) {
//         throw new DocumentProcessingError(
//           ERROR_CODES.NO_TEXT_EXTRACTED.code,
//           ERROR_CODES.NO_TEXT_EXTRACTED.message,
//           ERROR_CODES.NO_TEXT_EXTRACTED.status
//         )
//       }
//     } catch (error) {
//       if (error instanceof DocumentProcessingError) throw error

//       console.error("[Document Processing] Vision API error:", error)
//       throw new DocumentProcessingError(
//         ERROR_CODES.VISION_API_ERROR.code,
//         ERROR_CODES.VISION_API_ERROR.message,
//         ERROR_CODES.VISION_API_ERROR.status
//       )
//     }

//     // Store extracted content
//     await prisma.documentContent.upsert({
//       where: { documentId: document.id },
//       create: {
//         documentId: document.id,
//         rawText: extractedText,
//       },
//       update: {
//         rawText: extractedText,
//       },
//     })

//     // Classify document with type safety
//     let classificationData: ClassificationResult = {
//       type: DocumentType.GENERAL,
//       confidence: 0.5,
//       language: "en",
//     }

//     try {
//       const classificationResponse = await anthropic.messages.create({
//         model: "claude-3-5-sonnet-20241022",
//         max_tokens: 2048,
//         messages: [
//           {
//             role: "user",
//             content: `Analyze this document and return ONLY a JSON response (no markdown, no explanation) with:
// {
//   "type": one of [INVOICE, RECEIPT, FORM, CONTRACT, ID_DOCUMENT, MEDICAL, FINANCIAL, LEGAL, GENERAL],
//   "confidence": 0-1,
//   "language": "detected language code (e.g., 'en', 'es', 'fr')",
//   "extractedFields": {
//     "key": "value pairs for the document type"
//   }
// }

// For invoices, extract: invoice_number, date, total_amount, vendor_name
// For receipts, extract: merchant, date, total_amount, payment_method
// For contracts, extract: parties, date, contract_type, effective_date
// For ID documents, extract: name, date_of_birth, id_number, expiry_date

// Document text:
// ${extractedText.substring(0, 4000)}`,
//           },
//         ],
//       })

//       const classificationText =
//         classificationResponse.content[0].type === "text"
//           ? classificationResponse.content[0].text
//           : ""

//       try {
//         // Extract JSON from response (handle markdown code blocks)
//         const jsonMatch = classificationText.match(/\{[\s\S]*\}/)
//         if (jsonMatch) {
//           const parsed = JSON.parse(jsonMatch[0])
          
//           // Validate and assign type with type safety
//           const detectedType = typeof parsed.type === "string" 
//             ? parsed.type.toUpperCase() 
//             : "GENERAL"
          
//           classificationData = {
//             type: isValidDocumentType(detectedType) 
//               ? detectedType 
//               : DocumentType.GENERAL,
//             confidence:
//               typeof parsed.confidence === "number"
//                 ? Math.max(0, Math.min(1, parsed.confidence))
//                 : 0.5,
//             language: parsed.language || "en",
//             extractedFields: parsed.extractedFields || {},
//           }
//         }
//       } catch (parseError) {
//         console.error(
//           "[Document Processing] Failed to parse classification JSON:",
//           parseError
//         )
//         // Use default classification
//       }
//     } catch (error) {
//       console.error("[Document Processing] Classification error:", error)
//       // Continue with default classification
//     }

//     // Save classification
//     await prisma.classification.upsert({
//       where: { documentId: document.id },
//       create: {
//         documentId: document.id,
//         type: classificationData.type,
//         confidence: classificationData.confidence,
//       },
//       update: {
//         type: classificationData.type,
//         confidence: classificationData.confidence,
//       },
//     })

//     // Save extracted fields
//     if (
//       classificationData.extractedFields &&
//       Object.keys(classificationData.extractedFields).length > 0
//     ) {
//       // Clear existing fields
//       await prisma.field.deleteMany({
//         where: { documentId: document.id },
//       })

//       // Create new fields
//       const fieldCreations = Object.entries(
//         classificationData.extractedFields
//       ).map(([label, value]) =>
//         prisma.field.create({
//           data: {
//             documentId: document.id,
//             label,
//             value: String(value),
//             confidence: classificationData.confidence,
//           },
//         })
//       )

//       await Promise.all(fieldCreations)
//     }

//     const processingTimeMs = Date.now() - startTime

//     // Update document with classification results
//     const updatedDocument = await prisma.document.update({
//       where: { id },
//       data: {
//         status: "COMPLETED",
//         processedAt: new Date(),
//         documentType: classificationData.type, // Now properly typed as DocumentType
//         language: classificationData.language,
//         confidence: classificationData.confidence,
//       },
//       include: {
//         content: true,
//         classifications: true,
//         fields: true,
//       },
//     })

//     if (user) {
//       await prisma.auditLog.create({
//         data: {
//           userId: user.id,
//           documentId: id,
//           action: "PROCESS_COMPLETE",
//           details: `Processed as ${classificationData.type} (${processingTimeMs}ms, confidence: ${(classificationData.confidence * 100).toFixed(1)}%)`,
//         },
//       })
//     }

//     return NextResponse.json(
//       {
//         success: true,
//         document: updatedDocument,
//         processingTimeMs,
//         classification: {
//           type: classificationData.type,
//           confidence: classificationData.confidence,
//           language: classificationData.language,
//         },
//       },
//       { status: 200 }
//     )
//   } catch (error) {
//     const processingTimeMs = Date.now() - startTime

//     const user = await prisma.user.findFirst({
//       where: { clerkId: (await auth()).userId || "" },
//     })

//     const errorMessage =
//       error instanceof Error ? error.message : "Unknown processing error"

//     if (user) {
//       await prisma.auditLog.create({
//         data: {
//           userId: user.id,
//           documentId: id,
//           action: "PROCESS_FAILED",
//           details: `Failed after ${processingTimeMs}ms: ${errorMessage}`,
//         },
//       })
//     }

//     await prisma.document.update({
//       where: { id },
//       data: { status: "FAILED" },
//     })

//     if (error instanceof DocumentProcessingError) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: error.message,
//           code: error.code,
//         },
//         { status: error.statusCode }
//       )
//     }

//     console.error("[Document Processing] Processing error:", error)

//     return NextResponse.json(
//       {
//         success: false,
//         error: ERROR_CODES.PROCESSING_FAILED.message,
//         code: ERROR_CODES.PROCESSING_FAILED.code,
//         details: errorMessage,
//       },
//       { status: ERROR_CODES.PROCESSING_FAILED.status }
//     )
//   }
// }


// app/api/documents/[id]/process/route.ts
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { Anthropic } from "@anthropic-ai/sdk"
import { DocumentType } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import Tesseract from "tesseract.js"

const VALID_DOCUMENT_TYPES: DocumentType[] = [
  "INVOICE",
  "RECEIPT",
  "FORM",
  "CONTRACT",
  "ID_DOCUMENT",
  "MEDICAL",
  "FINANCIAL",
  "LEGAL",
  "GENERAL",
]

function isValidDocumentType(type: string): type is DocumentType {
  return VALID_DOCUMENT_TYPES.includes(type as DocumentType)
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()
  const { id } = await context.params

  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const document = await prisma.document.findUnique({
      where: { id },
    })

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    await prisma.document.update({
      where: { id },
      data: { status: "PROCESSING" },
    })

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (user) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          documentId: id,
          action: "PROCESS_START",
          details: `Started processing: ${document.fileName}`,
        },
      })
    }

    // Fetch and process document with Tesseract.js
    let extractedText: string

    try {
      console.log("[OCR] Starting Tesseract.js processing for:", document.fileUrl)

      // Tesseract.js can process images directly from URLs
      const result = await Tesseract.recognize(
        document.fileUrl,
        'eng', // Language - can be changed to 'eng+spa' for multiple languages
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              console.log(`[OCR] Progress: ${Math.round(m.progress * 100)}%`)
            }
          },
        }
      )

      extractedText = result.data.text

      console.log("[OCR] Extraction complete. Text length:", extractedText.length)

      if (!extractedText.trim()) {
        throw new Error("No text detected in document")
      }
    } catch (error) {
      console.error("[Document Processing] OCR error:", error)

      await prisma.document.update({
        where: { id },
        data: { status: "FAILED" },
      })

      return NextResponse.json(
        { error: "Failed to extract text from document" },
        { status: 500 }
      )
    }

    // Store extracted content
    await prisma.documentContent.upsert({
      where: { documentId: id },
      create: {
        documentId: id,
        rawText: extractedText,
      },
      update: {
        rawText: extractedText,
      },
    })

   
   let classificationData: {
      type: DocumentType
      confidence: number
      language: string
      extractedFields: Record<string, any>
    } = {
      type: DocumentType.GENERAL,
      confidence: 0.5,
      language: "en",
      extractedFields: {},
    }

  

    try {
      const classificationResponse = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: `Analyze this document and return ONLY a JSON response (no markdown) with:
{
  "type": one of [INVOICE, RECEIPT, FORM, CONTRACT, ID_DOCUMENT, MEDICAL, FINANCIAL, LEGAL, GENERAL],
  "confidence": 0-1,
  "language": "detected language code",
  "extractedFields": {
    "key": "value pairs"
  }
}

For invoices: extract invoice_number, date, total_amount, vendor_name
For receipts: extract merchant, date, total_amount, payment_method
For contracts: extract parties, date, contract_type, effective_date

Document text:
${extractedText.substring(0, 4000)}`,
          },
        ],
      })

      const classificationText =
        classificationResponse.content[0].type === "text"
          ? classificationResponse.content[0].text
          : ""

      const jsonMatch = classificationText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        const detectedType =
          typeof parsed.type === "string" ? parsed.type.toUpperCase() : "GENERAL"

        classificationData = {
          type: isValidDocumentType(detectedType) ? detectedType : DocumentType.GENERAL,
          confidence:
            typeof parsed.confidence === "number"
              ? Math.max(0, Math.min(1, parsed.confidence))
              : 0.5,
          language: parsed.language || "en",
          extractedFields: parsed.extractedFields || {},
        }
      }
    } catch (error) {
      console.error("[Document Processing] Classification error:", error)
    }

    // Save classification
    await prisma.classification.upsert({
      where: { documentId: id },
      create: {
        documentId: id,
        type: classificationData.type,
        confidence: classificationData.confidence,
      },
      update: {
        type: classificationData.type,
        confidence: classificationData.confidence,
      },
    })

    // Save extracted fields
    if (Object.keys(classificationData.extractedFields).length > 0) {
      await prisma.field.deleteMany({
        where: { documentId: id },
      })

      const fieldCreations = Object.entries(classificationData.extractedFields).map(
        ([label, value]) =>
          prisma.field.create({
            data: {
              documentId: id,
              label,
              value: String(value),
              confidence: classificationData.confidence,
            },
          })
      )

      await Promise.all(fieldCreations)
    }

    const processingTimeMs = Date.now() - startTime

    const updatedDocument = await prisma.document.update({
      where: { id },
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
          documentId: id,
          action: "PROCESS_COMPLETE",
          details: `Processed as ${classificationData.type} (${processingTimeMs}ms, confidence: ${(classificationData.confidence * 100).toFixed(1)}%)`,
        },
      })
    }

    return NextResponse.json(
      {
        success: true,
        document: updatedDocument,
        processingTimeMs,
        classification: {
          type: classificationData.type,
          confidence: classificationData.confidence,
          language: classificationData.language,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    const processingTimeMs = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    console.error("[Document Processing] Error:", error)

    await prisma.document.update({
      where: { id },
      data: { status: "FAILED" },
    })

    return NextResponse.json(
      {
        success: false,
        error: "Processing failed",
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}
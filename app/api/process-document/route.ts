import { type NextRequest, NextResponse } from "next/server"
import vision from "@google-cloud/vision"

const client = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
})

function isTabularContent(text: string): boolean {
  const lines = text.split("\n").filter((l) => l.trim())
  if (lines.length < 2) return false

  const firstLineWords = lines[0].trim().split(/\s{2,}/).length
  const tabularLines = lines.filter((line) => {
    const words = line.trim().split(/\s{2,}/)
    return words.length >= 2 && Math.abs(words.length - firstLineWords) <= 2
  })

  return tabularLines.length / lines.length > 0.7
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    const results = []

    for (const file of files) {
      try {
        const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/tiff", "image/heic"]
        if (!validTypes.includes(file.type)) {
          results.push({
            filename: file.name,
            extractedText: "",
            classification: "document",
            error: "Unsupported file type. Please use PDF, JPG, PNG, TIFF, or HEIC.",
          })
          continue
        }

        // Convert file to buffer and upload to Vision API
        const buffer = Buffer.from(await file.arrayBuffer())

        const [result] = await client.documentTextDetection({
          image: { content: buffer },
        })

        const fullTextAnnotation = result.fullTextAnnotation
        const extractedText = fullTextAnnotation?.text || ""

        if (!extractedText) {
          results.push({
            filename: file.name,
            extractedText: "",
            classification: "document",
            warning: "No text detected in document",
          })
          continue
        }

        // Classify document based on content analysis
        const isTabular = isTabularContent(extractedText)
        const classification = isTabular ? "spreadsheet" : "document"

        results.push({
          filename: file.name,
          extractedText,
          classification,
          confidence: 0.95,
        })
      } catch (fileError) {
        console.error(`Error processing ${file.name}:`, fileError)
        results.push({
          filename: file.name,
          extractedText: "",
          classification: "document",
          error: `Failed to process file: ${fileError instanceof Error ? fileError.message : "Unknown error"}`,
        })
      }
    }

    // Return combined results
    const extractedText = results
      .filter((r) => r.extractedText)
      .map((r) => r.extractedText)
      .join("\n\n---\n\n")

    return NextResponse.json({
      extractedText,
      classification: results[0]?.classification || "document",
      files: results,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Failed to process document" }, { status: 500 })
  }
}

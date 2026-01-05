import { type NextRequest, NextResponse } from "next/server"
import { processIncomingEmail } from "@/lib/email"

// This webhook would be called by your email service provider (Mailgun, SendGrid, etc)
export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-mailgun-signature")

  // Verify webhook signature with your email provider
  const body = await req.json()

  try {
    const { recipient, from, subject, attachments } = body

    const attachmentBuffers = await Promise.all(
      (attachments || []).map(async (att: any) => {
        const response = await fetch(att.url)
        return Buffer.from(await response.arrayBuffer())
      }),
    )

    const documents = await processIncomingEmail(recipient, from, subject, attachmentBuffers)

    return NextResponse.json({
      success: true,
      documentsCreated: documents.length,
      documentIds: documents.map((d) => d.id),
    })
  } catch (error) {
    console.error("[email-webhook] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process email" },
      { status: 500 },
    )
  }
}

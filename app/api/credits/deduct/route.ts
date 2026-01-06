import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"

const CREDIT_COSTS = {
  DOCUMENT_PROCESSING: 1,
  PDF_EXPORT: 1,
  OCR_STANDARD: 2,
  OCR_PREMIUM: 5,
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const { documentId, type } = await req.json()

    // Validate type
    if (!Object.keys(CREDIT_COSTS).includes(type)) {
      return new Response(JSON.stringify({ error: "Invalid credit type" }), { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 })
    }

    const creditCost = CREDIT_COSTS[type as keyof typeof CREDIT_COSTS]

    // Check if user has enough credits
    if (user.credits < creditCost) {
      return new Response(
        JSON.stringify({
          error: "Insufficient credits",
          currentCredits: user.credits,
          requiredCredits: creditCost,
        }),
        { status: 402 },
      )
    }

    // Deduct credits and create transaction record
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        credits: {
          decrement: creditCost,
        },
      },
    })

    // Log transaction
    await prisma.creditTransaction.create({
      data: {
        userId: user.id,
        documentId,
        amount: creditCost,
        type,
        description: `${type} - Document: ${documentId}`,
      },
    })

    return new Response(
      JSON.stringify({
        success: true,
        creditsRemaining: updatedUser.credits,
        creditsCost: creditCost,
      }),
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Credit deduction error:", error)
    return new Response(JSON.stringify({ error: "Failed to deduct credits" }), { status: 500 })
  }
}

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { generateUniqueEmailAddress } from "@/lib/email"
import { NextResponse } from "next/server"

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    // Check if user already has email forwarding enabled
    if (user.emailForwardingAddress) {
      return NextResponse.json({ email: user.emailForwardingAddress })
    }

    const uniqueEmail = await generateUniqueEmailAddress(user.id)

    // Update user with new email forwarding address
    const updatedUser = await prisma.user.update({ //TODO - not used
      where: { id: user.id },
      data: { emailForwardingAddress: uniqueEmail },
    })

    //Log the action
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "EMAIL_FORWARDING_ENABLED",
        details: { email: uniqueEmail },
      },
    })

    return NextResponse.json({ email: uniqueEmail })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate email address" },
      { status: 500 },
    )
  }
}

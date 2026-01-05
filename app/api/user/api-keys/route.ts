import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import crypto from "crypto"

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const apiKey = `doc_${crypto.randomBytes(32).toString("hex")}`

    await prisma.apiKey.create({
      data: {
        userId: user.id,
        key: apiKey,
        name: "web-generated",
      },
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "API_KEY_GENERATED",
        details: JSON.stringify({ source: "web" }),
      },
    })

    return NextResponse.json({ key: apiKey })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate API key" },
      { status: 500 },
    )
  }
}

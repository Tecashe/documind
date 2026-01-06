import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { credits: true },
    })

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 })
    }

    return new Response(JSON.stringify({ credits: user.credits }), { status: 200 })
  } catch (error) {
    console.error("[v0] Failed to fetch credits:", error)
    return new Response(JSON.stringify({ error: "Failed to fetch credits" }), { status: 500 })
  }
}

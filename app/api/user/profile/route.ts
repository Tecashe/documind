import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new Response("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        subscriptions: true,
        apiKeys: true,
      },
    })

    if (!user) {
      return new Response("User not found", { status: 404 })
    }

    return new Response(JSON.stringify(user), { status: 200 })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return new Response(JSON.stringify({ error: "Failed to fetch profile" }), { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { firstName, lastName } = await req.json()

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return new Response("User not found", { status: 404 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "UPDATE_PROFILE",
        details: `Updated profile: ${firstName} ${lastName}`,
        changes: {
          firstName,
          lastName,
        },
      },
    })

    return new Response(JSON.stringify(updatedUser), { status: 200 })
  } catch (error) {
    console.error("Profile update error:", error)
    return new Response(JSON.stringify({ error: "Update failed" }), { status: 500 })
  }
}

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
        teams: {
          include: {
            members: true,
          },
        },
      },
    })

    return new Response(JSON.stringify(user?.teams), { status: 200 })
  } catch (error) {
    console.error("Teams fetch error:", error)
    return new Response(JSON.stringify({ error: "Failed to fetch teams" }), { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { name } = await req.json()

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Team name is required" }), { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return new Response("User not found", { status: 404 })
    }

    const team = await prisma.team.create({
      data: {
        name: name.trim(),
        ownerId: user.id,
      },
    })

    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId: user.id,
        role: "OWNER",
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        teamId: team.id,
        action: "CREATE_TEAM",
        details: `Created team: ${name}`,
      },
    })

    return new Response(JSON.stringify(team), { status: 201 })
  } catch (error) {
    console.error("Create team error:", error)
    return new Response(JSON.stringify({ error: "Failed to create team" }), { status: 500 })
  }
}

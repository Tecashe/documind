import { auth } from "@clerk/nextjs/server"
import { prisma } from "./db"

export async function getUser() {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  return user
}

export async function getCurrentTeam() {
  const user = await getUser()
  if (!user) return null

  // For now, return user's first team or create a personal team
  const teams = await prisma.team.findMany({
    where: { ownerId: user.id },
    take: 1,
  })

  if (teams.length === 0) {
    const team = await prisma.team.create({
      data: {
        name: `${user.firstName || "Personal"} Workspace`,
        ownerId: user.id,
      },
    })
    return team
  }

  return teams[0]
}

export async function requireAuth() {
  const user = await getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  return user
}

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
    })

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 })
    }

    const folders = await prisma.folder.findMany({
      where: { ownerId: user.id, parentId: null },
      include: {
        _count: {
          select: { documents: true, subFolders: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    const folderData = folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      documents: folder._count.documents,
      subfolders: folder._count.subFolders,
      modified: folder.updatedAt.toISOString(),
    }))

    return new Response(JSON.stringify(folderData), { status: 200 })
  } catch (error) {
    console.error("[v0] Folders fetch error:", error)
    return new Response(JSON.stringify({ error: "Failed to fetch folders" }), { status: 500 })
  }
}

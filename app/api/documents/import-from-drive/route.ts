import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { listDriveFiles } from "@/lib/google-drive"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const apiKey = await prisma.apiKey.findFirst({
      where: { userId: user.id, name: "google-drive" },
    })

    if (!apiKey) {
      return NextResponse.json({ error: "Google Drive not connected" }, { status: 400 })
    }

    const files = await listDriveFiles(apiKey.key)

    return NextResponse.json({
      files: files.map((f) => ({
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        size: f.size,
        createdTime: f.createdTime,
      })),
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch files" },
      { status: 500 },
    )
  }
}

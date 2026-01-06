// app/api/documents/[id]/route.ts
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        owner: true,
        content: true,
        extractedText: true,
        classifications: true,
        fields: {
          orderBy: { createdAt: "asc" },
        },
        tables: {
          orderBy: { pageNum: "asc" },
        },
        shares: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Check access
    const hasAccess =
      document.owner.clerkId === userId ||
      document.shares.some((share) => share.user.clerkId === userId)

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error("[GET Document] Error:", error)
    return NextResponse.json({ error: "Failed to fetch document" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const document = await prisma.document.findUnique({
      where: { id },
    })

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    if (document.ownerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete document (cascading will handle relations)
    await prisma.document.delete({
      where: { id },
    })

    // Log deletion
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "DELETE_DOCUMENT",
        details: `Deleted document: ${document.title}`,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DELETE Document] Error:", error)
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
  }
}
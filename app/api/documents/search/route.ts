import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { ERROR_CODES, DocumentProcessingError } from "@/lib/errors"

export async function GET(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      throw new DocumentProcessingError(
        ERROR_CODES.UNAUTHORIZED.code,
        ERROR_CODES.UNAUTHORIZED.message,
        ERROR_CODES.UNAUTHORIZED.status,
      )
    }

    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q") || ""
    const type = searchParams.get("type")
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      throw new DocumentProcessingError(ERROR_CODES.NOT_FOUND.code, "User not found", ERROR_CODES.NOT_FOUND.status)
    }

    const where: any = {
      ownerId: user.id,
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { content: { rawText: { contains: query, mode: "insensitive" } } },
      ]
    }

    if (type) {
      where.documentType = type
    }

    if (status) {
      where.status = status
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        include: { content: true, classifications: true },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.document.count({ where }),
    ])

    const pages = Math.ceil(total / limit)

    return new Response(
      JSON.stringify({
        data: documents,
        pagination: {
          page,
          limit,
          total,
          pages,
          hasMore: page < pages,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  } catch (error) {
    if (error instanceof DocumentProcessingError) {
      return new Response(JSON.stringify({ error: error.message, code: error.code }), {
        status: error.statusCode,
      })
    }

    console.error("[v0] Search error:", error)
    return new Response(
      JSON.stringify({
        error: "Search failed",
        code: "SEARCH_FAILED",
      }),
      { status: 500 },
    )
  }
}

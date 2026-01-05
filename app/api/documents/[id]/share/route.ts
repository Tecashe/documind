// import { auth } from "@clerk/nextjs/server"
// import { prisma } from "@/lib/db"

// export async function POST(req: Request, { params }: { params: { id: string } }) {
//   try {
//     const { userId } = await auth()
//     if (!userId) {
//       return new Response("Unauthorized", { status: 401 })
//     }

//     const { email, role, expiresInDays } = await req.json()

//     const document = await prisma.document.findUnique({
//       where: { id: params.id },
//     })

//     if (!document) {
//       return new Response("Document not found", { status: 404 })
//     }

//     const shareUser = await prisma.user.findUnique({
//       where: { email },
//     })

//     if (!shareUser) {
//       return new Response("User not found", { status: 404 })
//     }

//     const currentUser = await prisma.user.findUnique({
//       where: { clerkId: userId },
//     })

//     const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : null

//     const share = await prisma.share.upsert({
//       where: {
//         documentId_userId: {
//           documentId: params.id,
//           userId: shareUser.id,
//         },
//       },
//       create: {
//         documentId: params.id,
//         userId: shareUser.id,
//         role: role || "VIEWER",
//         expiresAt,
//       },
//       update: {
//         role: role || "VIEWER",
//         expiresAt,
//       },
//     })

//     if (currentUser) {
//       await prisma.auditLog.create({
//         data: {
//           userId: currentUser.id,
//           documentId: params.id,
//           action: "SHARE_DOCUMENT",
//           details: `Shared with ${email} as ${role || "VIEWER"}${expiresAt ? ` (expires ${expiresAt.toLocaleDateString()})` : ""}`,
//           changes: {
//             sharedWith: email,
//             role: role || "VIEWER",
//           },
//         },
//       })
//     }

//     return new Response(JSON.stringify(share), { status: 201 })
//   } catch (error) {
//     console.error("Share error:", error)
//     return new Response(JSON.stringify({ error: "Share failed" }), { status: 500 })
//   }
// }

// export async function DELETE(req: Request, { params }: { params: { id: string } }) {
//   try {
//     const { userId } = await auth()
//     if (!userId) {
//       return new Response("Unauthorized", { status: 401 })
//     }

//     const { shareId } = await req.json()

//     const share = await prisma.share.findUnique({
//       where: { id: shareId },
//     })

//     if (!share) {
//       return new Response("Share not found", { status: 404 })
//     }

//     const sharedUser = await prisma.user.findUnique({
//       where: { id: share.userId },
//     })

//     const currentUser = await prisma.user.findUnique({
//       where: { clerkId: userId },
//     })

//     await prisma.share.delete({
//       where: { id: shareId },
//     })

//     if (currentUser) {
//       await prisma.auditLog.create({
//         data: {
//           userId: currentUser.id,
//           documentId: params.id,
//           action: "UNSHARE_DOCUMENT",
//           details: `Revoked access from ${sharedUser?.email}`,
//         },
//       })
//     }

//     return new Response(null, { status: 204 })
//   } catch (error) {
//     console.error("Unshare error:", error)
//     return new Response(JSON.stringify({ error: "Unshare failed" }), { status: 500 })
//   }
// }

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { email, role, expiresInDays } = await req.json()

    const document = await prisma.document.findUnique({
      where: { id },
    })

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    const shareUser = await prisma.user.findUnique({
      where: { email },
    })

    if (!shareUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null

    const share = await prisma.share.upsert({
      where: {
        documentId_userId: {
          documentId: id,
          userId: shareUser.id,
        },
      },
      create: {
        documentId: id,
        userId: shareUser.id,
        role: role || "VIEWER",
        expiresAt,
      },
      update: {
        role: role || "VIEWER",
        expiresAt,
      },
    })

    if (currentUser) {
      await prisma.auditLog.create({
        data: {
          userId: currentUser.id,
          documentId: id,
          action: "SHARE_DOCUMENT",
          details: `Shared with ${email} as ${role || "VIEWER"}${expiresAt ? ` (expires ${expiresAt.toLocaleDateString()})` : ""}`,
          changes: {
            sharedWith: email,
            role: role || "VIEWER",
          },
        },
      })
    }

    return NextResponse.json(share, { status: 201 })
  } catch (error) {
    console.error("Share error:", error)
    return NextResponse.json({ error: "Share failed" }, { status: 500 })
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

    const { shareId } = await req.json()

    const share = await prisma.share.findUnique({
      where: { id: shareId },
    })

    if (!share) {
      return NextResponse.json({ error: "Share not found" }, { status: 404 })
    }

    const sharedUser = await prisma.user.findUnique({
      where: { id: share.userId },
    })

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    await prisma.share.delete({
      where: { id: shareId },
    })

    if (currentUser) {
      await prisma.auditLog.create({
        data: {
          userId: currentUser.id,
          documentId: id,
          action: "UNSHARE_DOCUMENT",
          details: `Revoked access from ${sharedUser?.email}`,
        },
      })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Unshare error:", error)
    return NextResponse.json({ error: "Unshare failed" }, { status: 500 })
  }
}
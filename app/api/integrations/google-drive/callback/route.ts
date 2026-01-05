import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { exchangeCodeForTokens } from "@/lib/google-drive"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.redirect(new URL("/sign-in", req.url))

  const searchParams = req.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  if (!code || !state) {
    return NextResponse.redirect(new URL("/dashboard/settings?error=invalid_state", req.url))
  }

  try {
    const tokens = await exchangeCodeForTokens(code)
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) return NextResponse.redirect(new URL("/sign-in", req.url))

    // Store tokens securely (in a separate encrypted table in production)
    await prisma.apiKey.create({
      data: {
        userId: user.id,
        key: tokens.refresh_token || tokens.access_token || "",
        name: "google-drive",
      },
    })

    // Log the integration
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "GOOGLE_DRIVE_CONNECTED",
        details: JSON.stringify({ provider: "google-drive" }),
      },
    })

    return NextResponse.redirect(new URL("/dashboard/settings?integration=success", req.url))
  } catch (error) {
    console.error("[google-drive-callback] Error:", error)
    return NextResponse.redirect(new URL("/dashboard/settings?error=auth_failed", req.url))
  }
}

import { auth } from "@clerk/nextjs/server"
import { getGoogleAuthUrl } from "@/lib/google-drive"
import { NextResponse } from "next/server"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const authUrl = getGoogleAuthUrl(userId)
  return NextResponse.json({ authUrl })
}

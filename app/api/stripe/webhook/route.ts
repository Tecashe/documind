import Stripe from "stripe"
import { prisma } from "@/lib/db"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (error) {
    console.error("[v0] Webhook signature verification failed:", error)
    return new Response("Webhook signature verification failed", { status: 400 })
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session

      const userId = session.metadata?.userId
      const credits = Number.parseInt(session.metadata?.credits || "0")

      if (!userId || !credits) {
        console.error("[v0] Missing metadata in webhook")
        return new Response("Missing metadata", { status: 400 })
      }

      // Update user credits
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          credits: {
            increment: credits,
          },
        },
      })

      // Log transaction
      await prisma.creditTransaction.create({
        data: {
          userId: userId,
          amount: credits,
          type: "PURCHASE",
          description: `Purchased ${credits} credits - Stripe Payment (${session.id})`,
        },
      })

      console.log(`[v0] Credits added to user ${userId}: +${credits}`)
    }

    return new Response("Webhook processed", { status: 200 })
  } catch (error) {
    console.error("[v0] Webhook processing error:", error)
    return new Response("Webhook processing error", { status: 500 })
  }
}

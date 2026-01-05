import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/db"
import type Stripe from "stripe"

export async function POST(req: Request) {
  const body = await req.text()
  const headerPayload = await headers()
  const signature = headerPayload.get("stripe-signature")

  if (!signature) {
    return new Response("No signature", { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET || "")
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return new Response("Invalid signature", { status: 400 })
  }

  try {
    switch (event.type) {
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription

        const customerId = subscription.customer as string
        const customer = await stripe.customers.retrieve(customerId)

        const user = await prisma.user.findFirst({
          where: { email: (customer as any).email },
        })

        if (user) {
          await prisma.subscription.upsert({
            where: { userId_plan: { userId: user.id, plan: "PROFESSIONAL" } },
            create: {
              userId: user.id,
              plan: "PROFESSIONAL",
              stripeId: subscription.id,
              status: subscription.status,
              currentPeriodStart: new Date(subscription.items.data[0].current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000),
            },
            update: {
              status: subscription.status,
              currentPeriodStart: new Date(subscription.items.data[0].current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000),
            },
          })
        }
        break
      }
//
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        await prisma.subscription.deleteMany({
          where: { stripeId: subscription.id },
        })
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice

        const customerId = invoice.customer as string
        const customer = await stripe.customers.retrieve(customerId)

        const user = await prisma.user.findFirst({
          where: { email: (customer as any).email },
        })

        if (user) {
          // Add credits or update plan
          await prisma.user.update({
            where: { id: user.id },
            data: { credits: { increment: 100 } },
          })
        }
        break
      }
    }
  } catch (error) {
    console.error("Webhook processing error:", error)
    return new Response("Webhook processing failed", { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
}

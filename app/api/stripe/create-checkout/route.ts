import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Credit packages available for purchase
const CREDIT_PACKAGES = {
  starter: {
    credits: 100,
    price: 999, // $9.99
    description: "100 credits",
  },
  professional: {
    credits: 500,
    price: 3999, // $39.99
    description: "500 credits",
  },
  enterprise: {
    credits: 2000,
    price: 12999, // $129.99
    description: "2000 credits",
  },
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const { packageType } = await req.json()

    if (!Object.keys(CREDIT_PACKAGES).includes(packageType)) {
      return new Response(JSON.stringify({ error: "Invalid package type" }), { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 })
    }

    const pkg = CREDIT_PACKAGES[packageType as keyof typeof CREDIT_PACKAGES]

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Document Scanner Credits",
              description: pkg.description,
            },
            unit_amount: pkg.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing&canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        credits: pkg.credits,
        packageType,
      },
    })

    return new Response(JSON.stringify({ sessionId: session.id, sessionUrl: session.url }), { status: 200 })
  } catch (error) {
    console.error("[v0] Stripe checkout error:", error)
    return new Response(JSON.stringify({ error: "Failed to create checkout session" }), { status: 500 })
  }
}

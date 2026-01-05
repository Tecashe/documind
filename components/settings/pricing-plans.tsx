"use client"

import { useState } from "react"
import type { Plan } from "@prisma/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
//
const PLANS = [
  {
    id: "FREE",
    name: "Free",
    price: "$0",
    billing: "Forever",
    description: "Perfect for trying out",
    features: ["10 documents/month", "Basic OCR", "Email support", "1 team member", "Basic export (PDF only)"],
  },
  {
    id: "STARTER",
    name: "Starter",
    price: "$29",
    billing: "/month",
    description: "For small teams",
    features: [
      "500 documents/month",
      "Advanced OCR & AI",
      "Priority support",
      "Up to 5 team members",
      "Export to Word & Excel",
      "Document sharing",
      "Analytics dashboard",
    ],
    popular: true,
  },
  {
    id: "PROFESSIONAL",
    name: "Professional",
    price: "$99",
    billing: "/month",
    description: "For growing teams",
    features: [
      "Unlimited documents",
      "Advanced OCR & AI",
      "24/7 priority support",
      "Unlimited team members",
      "All export formats",
      "Custom integrations",
      "Advanced analytics",
      "API access",
      "Custom workflows",
    ],
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: "Custom",
    billing: "Contact sales",
    description: "For large organizations",
    features: [
      "Everything in Professional",
      "Dedicated support",
      "Custom integrations",
      "On-premise deployment",
      "SLA guarantee",
      "Custom training",
    ],
  },
]

interface PricingPlansProps {
  currentPlan: Plan
}

export function PricingPlans({ currentPlan }: PricingPlansProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async (planId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      })

      if (!response.ok) throw new Error("Checkout failed")

      const { url } = await response.json()
      window.location.href = url
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {PLANS.map((plan) => (
        <Card
          key={plan.id}
          className={`p-6 relative flex flex-col ${plan.popular ? "ring-2 ring-primary lg:scale-105" : ""}`}
        >
          {plan.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>}

          <div className="mb-6">
            <h3 className="font-semibold text-lg">{plan.name}</h3>
            <p className="text-sm text-muted-foreground">{plan.description}</p>
          </div>

          <div className="mb-6">
            <p className="text-3xl font-bold">{plan.price}</p>
            <p className="text-sm text-muted-foreground">{plan.billing}</p>
          </div>

          <Button
            onClick={() => handleUpgrade(plan.id)}
            disabled={isLoading || currentPlan === plan.id}
            variant={plan.popular ? "default" : "outline"}
            className="w-full mb-6"
          >
            {currentPlan === plan.id ? "Current Plan" : "Upgrade"}
          </Button>

          <div className="space-y-3 flex-1">
            {plan.features.map((feature) => (
              <div key={feature} className="flex items-start gap-2 text-sm">
                <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}

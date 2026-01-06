"use client"

import { useState } from "react"
import type { Plan } from "@prisma/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

const CREDIT_PACKAGES = [
  {
    id: "starter",
    name: "Starter",
    credits: 100,
    price: 9.99,
    description: "Perfect for getting started",
    value: "Best for occasional use",
  },
  {
    id: "professional",
    name: "Professional",
    credits: 500,
    price: 39.99,
    description: "For regular users",
    value: "Save 20%",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    credits: 2000,
    price: 129.99,
    description: "For power users",
    value: "Save 35%",
  },
]

const CREDIT_COSTS = [
  { action: "Document Processing", cost: 1 },
  { action: "PDF Export", cost: 1 },
  { action: "Standard OCR", cost: 2 },
  { action: "Premium OCR", cost: 5 },
]

interface PricingPlansProps {
  currentPlan: Plan
  currentCredits: number
}

export function PricingPlans({ currentPlan, currentCredits }: PricingPlansProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)

  const handlePurchase = async (packageId: string) => {
    setIsLoading(true)
    setSelectedPackage(packageId)

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageType: packageId }),
      })

      if (!response.ok) {
        throw new Error("Failed to create checkout")
      }

      const { sessionUrl } = await response.json()
      window.location.href = sessionUrl
    } catch (error) {
      console.error("[v0] Purchase error:", error)
      alert("Failed to start checkout. Please try again.")
    } finally {
      setIsLoading(false)
      setSelectedPackage(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Current Credits Display */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Current Credits</p>
            <p className="text-4xl font-bold">{currentCredits}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-2">Current Plan</p>
            <Badge variant="outline" className="text-base px-3 py-1">
              {currentPlan}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Credit Costs Reference */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Credit Costs</h3>
        <Card className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CREDIT_COSTS.map((item) => (
              <div key={item.action} className="flex flex-col">
                <span className="text-sm text-muted-foreground">{item.action}</span>
                <span className="text-2xl font-bold text-primary">{item.cost}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Credit Packages Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Buy Credits</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CREDIT_PACKAGES.map((pkg) => (
            <Card
              key={pkg.id}
              className={`p-6 relative flex flex-col transition-all ${
                pkg.popular ? "ring-2 ring-primary md:scale-105" : ""
              }`}
            >
              {pkg.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>}

              <div className="mb-4">
                <h4 className="font-semibold text-lg">{pkg.name}</h4>
                <p className="text-sm text-muted-foreground">{pkg.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{pkg.credits}</span>
                  <span className="text-muted-foreground">credits</span>
                </div>
                <p className="text-lg font-semibold mt-2">${pkg.price.toFixed(2)}</p>
                <p className="text-xs text-green-600 font-medium mt-1">{pkg.value}</p>
              </div>

              <Button
                onClick={() => handlePurchase(pkg.id)}
                disabled={isLoading}
                variant={pkg.popular ? "default" : "outline"}
                className="w-full"
              >
                {isLoading && selectedPackage === pkg.id ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Buy Now"
                )}
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <Card className="p-4">
            <p className="font-medium text-sm mb-2">Do credits expire?</p>
            <p className="text-sm text-muted-foreground">No, credits never expire. Use them whenever you need them.</p>
          </Card>
          <Card className="p-4">
            <p className="font-medium text-sm mb-2">Can I get a refund?</p>
            <p className="text-sm text-muted-foreground">
              Refunds are available within 30 days of purchase if credits haven't been used.
            </p>
          </Card>
          <Card className="p-4">
            <p className="font-medium text-sm mb-2">Need more credits?</p>
            <p className="text-sm text-muted-foreground">
              Contact our sales team for custom credit packages and enterprise pricing.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}

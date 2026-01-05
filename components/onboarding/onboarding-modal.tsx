"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronRight, CheckCircle2 } from "lucide-react"

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

const steps: OnboardingStep[] = [
  {
    id: "upload",
    title: "Upload Documents",
    description: "Drag and drop or select PDF, JPG, and PNG files to get started.",
    icon: "📄",
  },
  {
    id: "process",
    title: "Automatic Processing",
    description: "Our AI will extract text, classify documents, and identify key fields.",
    icon: "⚡",
  },
  {
    id: "review",
    title: "Review & Edit",
    description: "Review extracted information and make corrections if needed.",
    icon: "✏️",
  },
  {
    id: "export",
    title: "Export Results",
    description: "Export to Word, Excel, PDF, or JSON formats for further processing.",
    icon: "📥",
  },
]

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsOpen(false)
      localStorage.setItem("onboarding-completed", "true")
    }
  }

  const step = steps[currentStep]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to DocIntelligence</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center">
            <div className="text-6xl mb-4">{step.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
            <p className="text-muted-foreground">{step.description}</p>
          </div>

          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-smooth ${
                  index <= currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <Button onClick={handleNext} className="w-full">
            {currentStep === steps.length - 1 ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Get Started
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

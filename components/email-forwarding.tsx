"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Copy, Check, Mail } from "lucide-react"

export function EmailForwarding() {
  const [emailAddress, setEmailAddress] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const generateEmail = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/email/generate-address", { method: "POST" })
      const data = await res.json()
      setEmailAddress(data.email)
    } catch (error) {
      console.error("Failed to generate email:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (emailAddress) {
      navigator.clipboard.writeText(emailAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Mail className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Email Forwarding</h3>
      </div>

      {emailAddress ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Forward documents to this email address and they'll be automatically processed:
          </p>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <code className="flex-1 font-mono text-sm break-all">{emailAddress}</code>
            <Button size="sm" variant="ghost" onClick={copyToClipboard} className="shrink-0">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={generateEmail} disabled={loading} className="w-full">
          {loading ? "Generating..." : "Enable Email Forwarding"}
        </Button>
      )}
    </Card>
  )
}

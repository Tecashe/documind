"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, Eye, EyeOff, Copy, Check } from "lucide-react"

interface SecuritySettingsProps {
  userId: string
}

export function SecuritySettings({ userId }: SecuritySettingsProps) {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const generateApiKey = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch("/api/user/api-keys", { method: "POST" })
      const data = await res.json()
      setApiKey(data.key)
    } catch (error) {
      console.error("Failed to generate API key:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-5 h-5" />
          <h3 className="text-lg font-semibold">API Keys</h3>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Use API keys to authenticate requests to the DocIntelligence API. Keep them secret and never share them.
        </p>

        {apiKey ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Input type={showKey ? "text" : "password"} value={apiKey} readOnly className="border-0 bg-transparent" />
              <Button size="sm" variant="ghost" onClick={() => setShowKey(!showKey)} className="shrink-0">
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={copyToClipboard} className="shrink-0">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        ) : (
          <Button onClick={generateApiKey} disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate API Key"}
          </Button>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
        <p className="text-sm text-muted-foreground mb-4">Enable two-factor authentication to protect your account.</p>
        <Button variant="outline">Enable 2FA</Button>
      </Card>

      <Card className="p-6 border-destructive/30 bg-destructive/5">
        <h3 className="text-lg font-semibold mb-4 text-destructive">Danger Zone</h3>
        <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all associated data.</p>
        <Button variant="destructive">Delete Account</Button>
      </Card>
    </div>
  )
}

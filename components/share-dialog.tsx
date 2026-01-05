"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, X } from "lucide-react"

interface ShareDialogProps {
  documentId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareDialog({ documentId, open, onOpenChange }: ShareDialogProps) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("VIEWER")
  const [isLoading, setIsLoading] = useState(false)
  const [shares, setShares] = useState<any[]>([])

  const handleShare = async () => {
    if (!email) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/documents/${documentId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          role,
          expiresInDays: 30,
        }),
      })

      if (!response.ok) throw new Error("Failed to share")

      const share = await response.json()
      setShares([...shares, share])
      setEmail("")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email address</label>
            <div className="flex gap-2">
              <Input placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                  <SelectItem value="EDITOR">Editor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleShare} disabled={!email || isLoading} className="w-full">
            {isLoading ? "Sharing..." : "Share"}
          </Button>

          {shares.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Shared with</h4>
              {shares.map((share) => (
                <div key={share.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center gap-2 text-sm">
                    <User size={16} />
                    <span>{share.email}</span>
                    <span className="text-xs text-muted-foreground">({share.role.toLowerCase()})</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShares(shares.filter((s) => s.id !== share.id))}>
                    <X size={16} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

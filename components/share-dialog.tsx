// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { User, X } from "lucide-react"

// interface ShareDialogProps {
//   documentId: string
//   open: boolean
//   onOpenChange: (open: boolean) => void
// }

// export function ShareDialog({ documentId, open, onOpenChange }: ShareDialogProps) {
//   const [email, setEmail] = useState("")
//   const [role, setRole] = useState("VIEWER")
//   const [isLoading, setIsLoading] = useState(false)
//   const [shares, setShares] = useState<any[]>([])

//   const handleShare = async () => {
//     if (!email) return

//     setIsLoading(true)
//     try {
//       const response = await fetch(`/api/documents/${documentId}/share`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           email,
//           role,
//           expiresInDays: 30,
//         }),
//       })

//       if (!response.ok) throw new Error("Failed to share")

//       const share = await response.json()
//       setShares([...shares, share])
//       setEmail("")
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Share Document</DialogTitle>
//         </DialogHeader>

//         <div className="space-y-4">
//           <div className="space-y-2">
//             <label className="text-sm font-medium">Email address</label>
//             <div className="flex gap-2">
//               <Input placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
//               <Select value={role} onValueChange={setRole}>
//                 <SelectTrigger className="w-[120px]">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="VIEWER">Viewer</SelectItem>
//                   <SelectItem value="EDITOR">Editor</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           <Button onClick={handleShare} disabled={!email || isLoading} className="w-full">
//             {isLoading ? "Sharing..." : "Share"}
//           </Button>

//           {shares.length > 0 && (
//             <div className="space-y-2">
//               <h4 className="text-sm font-medium">Shared with</h4>
//               {shares.map((share) => (
//                 <div key={share.id} className="flex items-center justify-between p-2 bg-muted rounded">
//                   <div className="flex items-center gap-2 text-sm">
//                     <User size={16} />
//                     <span>{share.email}</span>
//                     <span className="text-xs text-muted-foreground">({share.role.toLowerCase()})</span>
//                   </div>
//                   <Button variant="ghost" size="sm" onClick={() => setShares(shares.filter((s) => s.id !== share.id))}>
//                     <X size={16} />
//                   </Button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </DialogContent>
//     </Dialog>
//   )
// }


// components/document/share-dialog.tsx
"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Share2, Mail, UserPlus, X } from "lucide-react"
import { useState } from "react"

interface ShareDialogProps {
  document: { id: string; title: string }
  shares: Array<{
    id: string
    user: {
      email: string
      firstName?: string | null
      lastName?: string | null
    }
    role: string
  }>
}

export function ShareDialog({ document, shares }: ShareDialogProps) {
  const [email, setEmail] = useState("")
  const [isSharing, setIsSharing] = useState(false)

  const handleShare = async () => {
    if (!email) return
    setIsSharing(true)
    
    try {
      const response = await fetch(`/api/documents/${document.id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: "VIEWER" }),
      })

      if (!response.ok) throw new Error("Share failed")

      setEmail("")
      window.location.reload()
    } catch (error) {
      console.error("Share error:", error)
      alert("Share failed. Please try again.")
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Card className="border border-border/40 bg-card/50 backdrop-blur-sm animate-fadeInUp" style={{ animationDelay: "0.4s" }}>
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border/40">
        <CardTitle className="text-lg flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          Share Document
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={handleShare} disabled={isSharing || !email}>
            <UserPlus className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>

        {shares.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Shared With ({shares.length})
            </label>
            <div className="space-y-2">
              {shares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {share.user.email[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{share.user.email}</p>
                      <Badge variant="secondary" className="text-xs mt-0.5">
                        {share.role}
                      </Badge>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
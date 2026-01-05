"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileText, Loader } from "lucide-react"

export function GoogleDriveIntegration() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [files, setFiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      const res = await fetch("/api/integrations/google-drive/auth")
      const data = await res.json()
      window.location.href = data.authUrl
    } catch (error) {
      console.error("Failed to connect Google Drive:", error)
      setIsConnecting(false)
    }
  }

  const handleLoadFiles = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/documents/import-from-drive")
      const data = await res.json()
      setFiles(data.files || [])
    } catch (error) {
      console.error("Failed to load files:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <FileText className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Google Drive</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Import and process documents directly from your Google Drive.
      </p>

      {files.length === 0 ? (
        <Button onClick={handleConnect} disabled={isConnecting} className="w-full">
          {isConnecting ? "Connecting..." : "Connect Google Drive"}
        </Button>
      ) : (
        <div className="space-y-4">
          <Button onClick={handleLoadFiles} disabled={isLoading} variant="outline" className="w-full bg-transparent">
            {isLoading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
            Load Files
          </Button>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {files.map((file) => (
              <div key={file.id} className="p-3 bg-muted rounded-lg flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{file.size} bytes</p>
                </div>
                <Button size="sm" variant="ghost">
                  Import
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

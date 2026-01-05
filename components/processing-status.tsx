"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

interface ProcessingStatusProps {
  files: File[]
}

export function ProcessingStatus({ files }: ProcessingStatusProps) {
  const [progress, setProgress] = useState(0)
  const [currentFile, setCurrentFile] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev
        return prev + Math.random() * 30
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="p-8 text-center">
      <Spinner className="mx-auto mb-6 h-12 w-12" />
      <h2 className="text-xl font-semibold mb-2">Processing your documents</h2>
      <p className="text-muted-foreground mb-6">Using advanced OCR to extract text from your files...</p>

      <div className="space-y-4 max-w-md mx-auto">
        {files.map((file, index) => (
          <div key={index} className="text-left">
            <p className="text-sm font-medium mb-1">{file.name}</p>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${index === currentFile ? progress : index < currentFile ? 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-6">
        This may take a few moments depending on document complexity...
      </p>
    </Card>
  )
}

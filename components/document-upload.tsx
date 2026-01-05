"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, File, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface DocumentUploadProps {
  onUpload?: (files: File[]) => void
}

export function DocumentUpload({ onUpload }: DocumentUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".jpg", ".jpeg", ".png", ".tiff", ".heic"],
    },
  })

  const handleUpload = async () => {
    if (files.length === 0) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      files.forEach((file) => formData.append("files", file))

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const data = await response.json()
      setFiles([])
      onUpload?.(data.documents)
    } catch (error) {
      console.error("Upload error:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <Card
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed p-8 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary",
        )}
      >
        <input {...getInputProps()} />
        <Upload size={32} className="mx-auto mb-2 text-muted-foreground" />
        <h3 className="font-semibold">Drag documents here or click to select</h3>
        <p className="text-sm text-muted-foreground mt-1">Supports PDF, JPG, PNG, TIFF (up to 100MB each)</p>
      </Card>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold">Selected Files ({files.length})</h4>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <File size={18} className="text-muted-foreground" />
                  <div className="text-sm">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                  <X size={18} />
                </Button>
              </div>
            ))}
          </div>

          <Button onClick={handleUpload} disabled={isUploading} className="w-full" size="lg">
            {isUploading ? "Uploading..." : "Upload Documents"}
          </Button>
        </div>
      )}
    </div>
  )
}

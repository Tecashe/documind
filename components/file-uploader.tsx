"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Upload, X, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface FileUploaderProps {
  onFilesAdded: (files: File[]) => void
}

export function FileUploader({ onFilesAdded }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = (files: File[]) => {
    const newFiles = [...selectedFiles, ...files]
    setSelectedFiles(newFiles)
  }

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length > 0) {
      setIsUploading(true)
      try {
        await onFilesAdded(selectedFiles)
        setSelectedFiles([])
      } finally {
        setIsUploading(false)
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card
        className={`border-2 border-dashed transition-smooth ${dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"} p-8 animate-fadeInUp`}
      >
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className="text-center"
        >
          <div className={`transition-transform ${dragActive ? "scale-110" : "scale-100"}`}>
            <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold mb-2">Drag and drop your documents</p>
          <p className="text-sm text-muted-foreground mb-6">
            or click below to select files (PDF, JPG, PNG, TIFF, HEIC - max 50MB total)
          </p>
          <Button onClick={() => inputRef.current?.click()} variant="outline">
            Select Files
          </Button>
          <input
            ref={inputRef}
            type="file"
            multiple
            onChange={handleChange}
            accept=".pdf,.jpg,.jpeg,.png,.tiff,.heic"
            className="hidden"
          />
        </div>
      </Card>

      {selectedFiles.length > 0 && (
        <Card className="p-6 animate-slideInRight">
          <h3 className="font-semibold mb-4">Selected Files ({selectedFiles.length})</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button onClick={() => removeFile(index)} className="p-1 hover:bg-muted rounded transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {selectedFiles.length > 0 && (
        <Button onClick={handleUpload} disabled={isUploading} size="lg" className="w-full animate-scaleIn">
          {isUploading ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Processing {selectedFiles.length} {selectedFiles.length === 1 ? "File" : "Files"}...
            </>
          ) : (
            `Process ${selectedFiles.length} ${selectedFiles.length === 1 ? "File" : "Files"}`
          )}
        </Button>
      )}
    </div>
  )
}

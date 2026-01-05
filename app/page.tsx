"use client"

import { useState } from "react"
import { FileUploader } from "@/components/file-uploader"
import { ProcessingStatus } from "@/components/processing-status"
import { ReviewDocument } from "@/components/review-document"
import { ExportDocument } from "@/components/export-document"
import { HistoryPanel } from "@/components/history-panel"
import { ThemeToggle } from "@/components/theme-toggle"
import { useDocumentHistory, type DocumentRecord } from "@/hooks/use-document-history"

export default function Home() {
  const [currentStep, setCurrentStep] = useState<"upload" | "processing" | "review" | "export">("upload")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [processingResults, setProcessingResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const { history, addRecord, removeRecord, clearHistory } = useDocumentHistory()

  const handleFilesAdded = async (files: File[]) => {
    setUploadedFiles(files)
    setError(null)

    // Validate files
    const validFiles = files.filter((file) => {
      const size = file.size / (1024 * 1024)
      const isValidType = ["application/pdf", "image/jpeg", "image/png"].includes(file.type)
      const isValidSize = size <= 10

      if (!isValidType) {
        setError(`${file.name} is not a supported format (PDF, JPG, PNG)`)
        return false
      }
      if (!isValidSize) {
        setError(`${file.name} exceeds 10MB limit`)
        return false
      }
      return true
    })

    if (validFiles.length > 0) {
      setUploadedFiles(validFiles)
      setCurrentStep("processing")
      await processFiles(validFiles)
    }
  }

  const processFiles = async (files: File[]) => {
    const formData = new FormData()
    files.forEach((file) => formData.append("files", file))

    try {
      const response = await fetch("/api/process-document", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to process document")
      }

      const data = await response.json()
      setProcessingResults(data)
      setCurrentStep("review")

      // Add to history
      if (files.length > 0) {
        addRecord({
          filename: files[0].name,
          classification: data.classification,
          extractedText: data.extractedText,
          size: files[0].size,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed")
      setCurrentStep("upload")
    }
  }

  const handleLoadRecord = (record: DocumentRecord) => {
    setProcessingResults({
      extractedText: record.extractedText,
      classification: record.classification,
      files: [{ filename: record.filename, classification: record.classification }],
    })
    setCurrentStep("review")
    setShowHistory(false)
  }

  const handleExport = (format: "docx" | "xlsx") => {
    setCurrentStep("export")
  }

  const handleReset = () => {
    setCurrentStep("upload")
    setUploadedFiles([])
    setProcessingResults(null)
    setError(null)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2 text-foreground">Document Scanner</h1>
            <p className="text-muted-foreground">Convert documents to editable text with AI-powered OCR</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mb-12">
          {["upload", "processing", "review", "export"].map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                  currentStep === step
                    ? "bg-primary text-primary-foreground"
                    : ["upload", "processing", "review"].indexOf(currentStep) > index
                      ? "bg-emerald-500 text-white"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {index + 1}
              </div>
              {index < 3 && <div className="w-8 h-0.5 bg-border ml-2 mr-2" />}
            </div>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            {error}
          </div>
        )}

        {/* Content */}
        {currentStep === "upload" && (
          <div className="space-y-6">
            <FileUploader onFilesAdded={handleFilesAdded} />
            {history.length > 0 && (
              <div>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  {showHistory ? "Hide" : "Show"} History ({history.length})
                </button>
                {showHistory && (
                  <div className="mt-4">
                    <HistoryPanel history={history} onRemove={removeRecord} onLoadRecord={handleLoadRecord} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {currentStep === "processing" && <ProcessingStatus files={uploadedFiles} />}

        {currentStep === "review" && processingResults && (
          <ReviewDocument results={processingResults} onExport={handleExport} onReset={handleReset} />
        )}

        {currentStep === "export" && processingResults && (
          <ExportDocument results={processingResults} onReset={handleReset} />
        )}
      </div>
    </main>
  )
}

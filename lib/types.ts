export interface DocumentExportData {
  id: string
  title: string
  description?: string
  fileName: string
  fileType: string
  documentType: string
  status: string
  processedAt?: Date
  content?: {
    rawText: string
    htmlText?: string
    markdown?: string
  }
  classifications?: Array<{
    type: string
    confidence: number
  }>
  fields?: Array<{
    label: string
    value: string
    confidence: number
  }>
  tables?: Array<{
    headers: string[]
    rows: Record<string, any>[]
  }>
}

export interface ClassificationResult {
  type: string
  confidence: number
  language: string
  extractedFields?: Record<string, any>
}

export interface ProcessingResult {
  success: boolean
  documentId: string
  extractedText: string
  classification: ClassificationResult
  processingTimeMs: number
}

export interface ExportOptions {
  format: "docx" | "xlsx" | "csv" | "json" | "pdf" | "markdown"
  includeMetadata?: boolean
  includeImages?: boolean
  searchableText?: boolean // For PDF
}

export enum DocumentUploadSource {
  WEB = "WEB",
  API = "API",
  EMAIL = "EMAIL",
  MOBILE = "MOBILE",
  CLOUD_DRIVE = "CLOUD_DRIVE",
}

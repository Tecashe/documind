export class DocumentProcessingError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode = 500,
  ) {
    super(message)
    this.name = "DocumentProcessingError"
  }
}

export const ERROR_CODES = {
  // Upload errors
  INVALID_FILE_TYPE: { code: "INVALID_FILE_TYPE", message: "File type not supported", status: 400 },
  FILE_TOO_LARGE: { code: "FILE_TOO_LARGE", message: "File exceeds 100MB limit", status: 400 },
  UPLOAD_FAILED: { code: "UPLOAD_FAILED", message: "File upload failed", status: 500 },

  // Processing errors
  PROCESSING_FAILED: { code: "PROCESSING_FAILED", message: "Document processing failed", status: 500 },
  NO_TEXT_EXTRACTED: { code: "NO_TEXT_EXTRACTED", message: "No text could be extracted from document", status: 422 },
  CLASSIFICATION_FAILED: { code: "CLASSIFICATION_FAILED", message: "Document classification failed", status: 500 },
  VISION_API_ERROR: { code: "VISION_API_ERROR", message: "Google Vision API error", status: 503 },
  TESSERACT_FALLBACK_FAILED: { code: "TESSERACT_FALLBACK_FAILED", message: "OCR fallback failed", status: 503 },

  // Export errors
  EXPORT_FAILED: { code: "EXPORT_FAILED", message: "Export generation failed", status: 500 },
  UNSUPPORTED_FORMAT: { code: "UNSUPPORTED_FORMAT", message: "Export format not supported", status: 400 },

  // Auth errors
  UNAUTHORIZED: { code: "UNAUTHORIZED", message: "User not authenticated", status: 401 },
  FORBIDDEN: { code: "FORBIDDEN", message: "Access denied", status: 403 },
  NOT_FOUND: { code: "NOT_FOUND", message: "Document not found", status: 404 },

  // Rate limiting
  QUOTA_EXCEEDED: { code: "QUOTA_EXCEEDED", message: "Monthly document quota exceeded", status: 429 },
  RATE_LIMITED: { code: "RATE_LIMITED", message: "Too many requests", status: 429 },
} as const

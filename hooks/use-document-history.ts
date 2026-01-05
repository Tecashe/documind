"use client"

import { useState, useEffect } from "react"

export interface DocumentRecord {
  id: string
  filename: string
  classification: string
  extractedText: string
  timestamp: number
  size: number
}

export function useDocumentHistory() {
  const [history, setHistory] = useState<DocumentRecord[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("document-history")
    if (stored) {
      try {
        setHistory(JSON.parse(stored))
      } catch (err) {
        console.error("Failed to load history:", err)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("document-history", JSON.stringify(history))
    }
  }, [history, isLoaded])

  const addRecord = (record: Omit<DocumentRecord, "id" | "timestamp">) => {
    const newRecord: DocumentRecord = {
      ...record,
      id: `doc-${Date.now()}`,
      timestamp: Date.now(),
    }
    setHistory((prev) => [newRecord, ...prev.slice(0, 9)]) // Keep last 10
  }

  const removeRecord = (id: string) => {
    setHistory((prev) => prev.filter((r) => r.id !== id))
  }

  const clearHistory = () => {
    setHistory([])
  }

  return {
    history,
    addRecord,
    removeRecord,
    clearHistory,
    isLoaded,
  }
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { HelpCircle, X, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

const helpArticles = [
  {
    id: 1,
    title: "How to upload documents",
    category: "Getting Started",
    content: "You can upload documents by dragging and dropping them or clicking the upload button.",
  },
  {
    id: 2,
    title: "Supported file formats",
    category: "Documents",
    content: "We support PDF, JPG, PNG, TIFF, HEIC, and WebP formats.",
  },
  {
    id: 3,
    title: "What is document classification",
    category: "Features",
    content: "Document classification automatically identifies the type of document (invoice, receipt, contract, etc.)",
  },
  {
    id: 4,
    title: "How to export documents",
    category: "Export",
    content: "After processing, click the export button to download in Word, Excel, PDF, or JSON format.",
  },
  {
    id: 5,
    title: "How email forwarding works",
    category: "Integrations",
    content: "Generate a unique email address and forward documents to have them automatically processed.",
  },
  {
    id: 6,
    title: "Team collaboration",
    category: "Teams",
    content: "Create teams and share documents with members. Set different permission levels for each member.",
  },
]

export function HelpDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredArticles = helpArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 rounded-full h-12 w-12 shadow-lg animate-fadeInUp"
      >
        <HelpCircle className="w-5 h-5" />
      </Button>

      {isOpen && (
        <div className="fixed bottom-20 right-6 w-96 bg-background border border-border rounded-lg shadow-lg z-50 animate-slideInRight">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Help & Support</h3>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-muted rounded">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search help..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="space-y-2">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="p-3 hover:bg-muted/50 cursor-pointer transition-colors">
                  <p className="font-medium text-sm">{article.title}</p>
                  <p className="text-xs text-muted-foreground">{article.category}</p>
                  <p className="text-xs mt-2 text-foreground/70">{article.content}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

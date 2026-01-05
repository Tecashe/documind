
// components/document/extracted-fields.tsx
"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Database, Edit2, Check, X } from "lucide-react"
import { useState } from "react"

interface ExtractedFieldsProps {
  fields: Array<{
    id: string
    label: string
    value: string
    confidence: number
  }>
  documentId: string
}

export function ExtractedFields({ fields, documentId }: ExtractedFieldsProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  const handleEdit = (field: { id: string; value: string }) => {
    setEditingId(field.id)
    setEditValue(field.value)
  }

  const handleSave = async () => {
    // TODO: Implement field update API
    console.log("Saving field:", editingId, editValue)
    setEditingId(null)
  }

  return (
    <Card className="border border-border/40 bg-card/50 backdrop-blur-sm animate-fadeInUp" style={{ animationDelay: "0.3s" }}>
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border/40">
        <CardTitle className="text-lg flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Extracted Fields
          <Badge variant="secondary" className="ml-auto">{fields.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-3">
        {fields.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No fields extracted</p>
        ) : (
          fields.map((field) => (
            <div
              key={field.id}
              className="p-4 rounded-lg bg-muted/30 border border-border/40 space-y-2 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {field.label}
                  </label>
                  {editingId === field.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="h-8 text-sm"
                      />
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSave}>
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{field.value}</p>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                        onClick={() => handleEdit(field)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {(field.confidence * 100).toFixed(1)}% confidence
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
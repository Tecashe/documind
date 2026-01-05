"use client"

import type { Document } from "@prisma/client"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface DocumentViewerProps {
  document: Document & {
    content: any
    classifications: any
    tables: any[]
    fields: any[]
  }
}
//
export function DocumentViewer({ document }: DocumentViewerProps) {
  return (
    <Card className="p-6">
      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Extracted Text</TabsTrigger>
          <TabsTrigger value="fields">Fields</TabsTrigger>
          {document.tables.length > 0 && <TabsTrigger value="tables">Tables</TabsTrigger>}
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{document.content?.rawText}</p>
          </div>
        </TabsContent>

        <TabsContent value="fields" className="space-y-4">
          {document.fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">No fields extracted</p>
          ) : (
            <div className="space-y-3">
              {document.fields.map((field, index) => (
                <div key={index} className="space-y-1">
                  <label className="text-sm font-medium">{field.label}</label>
                  <p className="text-sm p-2 bg-muted rounded text-muted-foreground">{field.value}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{(field.confidence * 100).toFixed(0)}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {document.tables.length > 0 && (
          <TabsContent value="tables" className="space-y-4">
            {document.tables.map((table, index) => (
              <div key={index} className="space-y-2 overflow-x-auto">
                <h4 className="font-semibold text-sm">Table {index + 1}</h4>
                <table className="w-full text-sm border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted">
                      {table.headers.map((header: string, i: number) => (
                        <th key={i} className="border border-border p-2 text-left">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row: any, i: number) => (
                      <tr key={i}>
                        {(Array.isArray(row) ? row : Object.values(row)).map((cell: any, j: number) => (
                          <td key={j} className="border border-border p-2">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </TabsContent>
        )}
      </Tabs>
    </Card>
  )
}

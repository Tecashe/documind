
// components/document/extracted-tables.tsx
"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Table as TableIcon } from "lucide-react"

interface ExtractedTablesProps {
  tables: Array<{
    id: string
    title?: string | null
    headers: string[]
    rows: any[]
    pageNum: number
  }>
}

export function ExtractedTables({ tables }: ExtractedTablesProps) {
  return (
    <div className="space-y-6">
      {tables.map((table, idx) => (
        <Card
          key={table.id}
          className="border border-border/40 bg-card/50 backdrop-blur-sm animate-fadeInUp overflow-hidden"
          style={{ animationDelay: `${0.2 + idx * 0.1}s` }}
        >
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <TableIcon className="h-5 w-5 text-primary" />
                {table.title || `Table ${idx + 1}`}
              </CardTitle>
              <Badge variant="outline">Page {table.pageNum}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/40">
                    {table.headers.map((header, i) => (
                      <TableHead key={i} className="font-semibold">
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {table.rows.map((row, rowIdx) => (
                    <TableRow key={rowIdx} className="hover:bg-muted/20">
                      {table.headers.map((header, cellIdx) => (
                        <TableCell key={cellIdx}>{String(row[header] || "")}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
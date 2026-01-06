// import { auth } from "@clerk/nextjs/server"
// import { prisma } from "@/lib/db"
// import { Document, Packer, Paragraph, Table as DocxTable, TableRow, TableCell } from "docx"
// import * as XLSX from "xlsx"
// import type { DocumentExportData, ExportOptions } from "@/lib/types"
// import { ERROR_CODES, DocumentProcessingError } from "@/lib/errors"

// export async function POST(req: Request, { params }: { params: { id: string } }) {
//   try {
//     const { userId } = await auth()
//     if (!userId) {
//       throw new DocumentProcessingError(
//         ERROR_CODES.UNAUTHORIZED.code,
//         ERROR_CODES.UNAUTHORIZED.message,
//         ERROR_CODES.UNAUTHORIZED.status,
//       )
//     }

//     const {
//       format,
//       includeMetadata = true,
//       searchableText = false,
//     } = (await req.json()) as ExportOptions & { format: string }

//     const document = await prisma.document.findUnique({
//       where: { id: params.id },
//       include: {
//         content: true,
//         classifications: true,
//         fields: true,
//         tables: true,
//       },
//     })

//     if (!document) {
//       throw new DocumentProcessingError(
//         ERROR_CODES.NOT_FOUND.code,
//         ERROR_CODES.NOT_FOUND.message,
//         ERROR_CODES.NOT_FOUND.status,
//       )
//     }

//     const documentData: DocumentExportData = {
//       id: document.id,
//       title: document.title,
//       description: document.description || undefined,
//       fileName: document.fileName,
//       fileType: document.fileType,
//       documentType: document.documentType,
//       status: document.status,
//       processedAt: document.processedAt || undefined,
//       content: document.content
//         ? {
//             rawText: document.content.rawText,
//             htmlText: document.content.htmlText || undefined,
//             markdown: document.content.markdown || undefined,
//           }
//         : undefined,
//       classifications: document.classifications,
//       fields: document.fields,
//       tables: document.tables as any,
//     }

//     let buffer: Buffer
//     let contentType: string
//     let filename: string

//     switch (format) {
//       case "docx":
//         buffer = await exportToDocx(documentData)
//         contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//         filename = `${document.title}.docx`
//         break

//       case "xlsx":
//         buffer = await exportToExcel(documentData)
//         contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//         filename = `${document.title}.xlsx`
//         break

//       case "csv":
//         buffer = await exportToCsv(documentData)
//         contentType = "text/csv; charset=utf-8"
//         filename = `${document.title}.csv`
//         break

//       case "json":
//         buffer = Buffer.from(JSON.stringify(documentData, null, 2))
//         contentType = "application/json"
//         filename = `${document.title}.json`
//         break

//       case "markdown":
//         buffer = await exportToMarkdown(documentData)
//         contentType = "text/markdown"
//         filename = `${document.title}.md`
//         break

//       default:
//         throw new DocumentProcessingError(
//           ERROR_CODES.UNSUPPORTED_FORMAT.code,
//           ERROR_CODES.UNSUPPORTED_FORMAT.message,
//           ERROR_CODES.UNSUPPORTED_FORMAT.status,
//         )
//     }

//     const user = await prisma.user.findUnique({
//       where: { clerkId: userId },
//     })

//     if (user) {
//       await prisma.auditLog.create({
//         data: {
//           userId: user.id,
//           documentId: params.id,
//           action: `EXPORT_${format.toUpperCase()}`,
//           details: `Exported document to ${format} (${(buffer.length / 1024).toFixed(2)}KB)`,
//         },
//       })
//     }
// //
//     return new Response(buffer, {
//       status: 200,
//       headers: {
//         "Content-Type": contentType,
//         "Content-Disposition": `attachment; filename="${filename}"`,
//         "X-Content-Type-Options": "nosniff",
//       },
//     })
//   } catch (error) {
//     if (error instanceof DocumentProcessingError) {
//       return new Response(JSON.stringify({ error: error.message, code: error.code }), {
//         status: error.statusCode,
//       })
//     }

//     console.error("[v0] Export error:", error)
//     return new Response(
//       JSON.stringify({
//         error: ERROR_CODES.EXPORT_FAILED.message,
//         code: ERROR_CODES.EXPORT_FAILED.code,
//       }),
//       {
//         status: ERROR_CODES.EXPORT_FAILED.status,
//       },
//     )
//   }
// }

// async function exportToDocx(document: DocumentExportData): Promise<Buffer> {
//   const paragraphs: any[] = []

//   // Title
//   paragraphs.push(
//     new Paragraph({
//       text: document.title,
//       heading: "Heading1",
//       spacing: { after: 400 },
//     }),
//   )

//   // Metadata section
//   if (document.processedAt) {
//     paragraphs.push(
//       new Paragraph({
//         text: `Document Type: ${document.documentType} | Processed: ${new Date(document.processedAt).toLocaleDateString()}`,
//         spacing: { after: 200 },
//       }),
//     )
//   }

//   // Main content
//   if (document.content?.rawText) {
//     paragraphs.push(
//       new Paragraph({
//         text: "Extracted Content",
//         heading: "Heading2",
//         spacing: { before: 200, after: 200 },
//       }),
//     )

//     const lines = document.content.rawText.split("\n").filter((l) => l.trim())
//     lines.forEach((line) => {
//       paragraphs.push(
//         new Paragraph({
//           text: line,
//           spacing: { after: 100 },
//         }),
//       )
//     })
//   }

//   // Tables
//   if (document.tables && document.tables.length > 0) {
//     paragraphs.push(
//       new Paragraph({
//         text: "Extracted Tables",
//         heading: "Heading2",
//         spacing: { before: 400, after: 200 },
//       }),
//     )

//     document.tables.forEach((table, idx) => {
//       const rows: any[] = []

//       // Header row
//       rows.push(
//         new TableRow({
//           cells: table.headers.map(
//             (header) =>
//               new TableCell({
//                 children: [new Paragraph(header)],
//                 shading: { fill: "D3D3D3" },
//               }),
//           ),
//         }),
//       )

//       // Data rows
//       table.rows.forEach((row) => {
//         rows.push(
//           new TableRow({
//             cells: table.headers.map(
//               (header) =>
//                 new TableCell({
//                   children: [new Paragraph(String(row[header] || ""))],
//                 }),
//             ),
//           }),
//         )
//       })

//       paragraphs.push(
//         new DocxTable({
//           rows,
//         }),
//       )

//       if (idx < document.tables.length - 1) {
//         paragraphs.push(new Paragraph({ text: "", spacing: { after: 200 } }))
//       }
//     })
//   }

//   const doc = new Document({
//     sections: [
//       {
//         children: paragraphs,
//       },
//     ],
//   })

//   return await Packer.toBuffer(doc)
// }

// async function exportToExcel(document: DocumentExportData): Promise<Buffer> {
//   const wb = XLSX.utils.book_new()

//   // Data sheet
//   const dataRows: any[] = []

//   if (document.content?.rawText) {
//     dataRows.push({
//       Field: "Extracted Text",
//       Value: document.content.rawText.substring(0, 32767),
//     })
//   }

//   dataRows.push({
//     Field: "Document Type",
//     Value: document.documentType,
//   })

//   if (document.processedAt) {
//     dataRows.push({
//       Field: "Processed Date",
//       Value: new Date(document.processedAt).toLocaleDateString(),
//     })
//   }

//   const dataWs = XLSX.utils.json_to_sheet(dataRows)
//   XLSX.utils.book_append_sheet(wb, dataWs, "Data")

//   // Fields sheet
//   if (document.fields && document.fields.length > 0) {
//     const fieldsData = document.fields.map((f) => ({
//       Label: f.label,
//       Value: f.value,
//       Confidence: (f.confidence * 100).toFixed(2) + "%",
//     }))
//     const fieldsWs = XLSX.utils.json_to_sheet(fieldsData)
//     XLSX.utils.book_append_sheet(wb, fieldsWs, "Fields")
//   }

//   // Tables sheet
//   if (document.tables && document.tables.length > 0) {
//     document.tables.forEach((table, idx) => {
//       const tableData = table.rows as any[]
//       const ws = XLSX.utils.json_to_sheet(tableData)
//       XLSX.utils.book_append_sheet(wb, ws, `Table_${idx + 1}`)
//     })
//   }

//   const buffer = await XLSX.write(wb, { bookType: "xlsx", type: "buffer" })
//   return Buffer.from(buffer as any)
// }

// async function exportToCsv(document: DocumentExportData): Promise<Buffer> {
//   const rows: string[] = ["Field,Value"]

//   if (document.content?.rawText) {
//     rows.push(`"Extracted Text","${document.content.rawText.replace(/"/g, '""').substring(0, 1000)}"`)
//   }

//   rows.push(`"Document Type","${document.documentType}"`)

//   if (document.processedAt) {
//     rows.push(`"Processed Date","${new Date(document.processedAt).toLocaleDateString()}"`)
//   }

//   if (document.fields) {
//     rows.push("") // Blank line
//     rows.push("Label,Value,Confidence")
//     document.fields.forEach((f) => {
//       rows.push(`"${f.label}","${f.value}","${(f.confidence * 100).toFixed(2)}%"`)
//     })
//   }

//   return Buffer.from(rows.join("\n"), "utf-8")
// }

// async function exportToMarkdown(document: DocumentExportData): Promise<Buffer> {
//   const lines: string[] = []

//   // Title
//   lines.push(`# ${document.title}`)
//   lines.push("")

//   // Metadata
//   lines.push("## Metadata")
//   lines.push(`- **Type**: ${document.documentType}`)
//   if (document.processedAt) {
//     lines.push(`- **Processed**: ${new Date(document.processedAt).toLocaleDateString()}`)
//   }
//   lines.push("")

//   // Content
//   if (document.content?.rawText) {
//     lines.push("## Extracted Content")
//     lines.push("")
//     lines.push(document.content.rawText)
//     lines.push("")
//   }

//   // Fields
//   if (document.fields && document.fields.length > 0) {
//     lines.push("## Extracted Fields")
//     lines.push("")
//     lines.push("| Label | Value | Confidence |")
//     lines.push("|-------|-------|------------|")
//     document.fields.forEach((f) => {
//       lines.push(`| ${f.label} | ${f.value} | ${(f.confidence * 100).toFixed(2)}% |`)
//     })
//     lines.push("")
//   }

//   // Tables
//   if (document.tables && document.tables.length > 0) {
//     lines.push("## Extracted Tables")
//     lines.push("")
//     document.tables.forEach((table, idx) => {
//       lines.push(`### Table ${idx + 1}`)
//       lines.push("")
//       lines.push(`| ${table.headers.join(" | ")} |`)
//       lines.push(`| ${table.headers.map(() => "---").join(" | ")} |`)
//       table.rows.forEach((row) => {
//         const cells = table.headers.map((h) => String(row[h] || ""))
//         lines.push(`| ${cells.join(" | ")} |`)
//       })
//       lines.push("")
//     })
//   }

//   return Buffer.from(lines.join("\n"), "utf-8")
// }

// import { auth } from "@clerk/nextjs/server"
// import { prisma } from "@/lib/db"
// import { Document, Packer, Paragraph, Table as DocxTable, TableRow, TableCell } from "docx"
// import * as XLSX from "xlsx"
// import type { DocumentExportData, ExportOptions } from "@/lib/types"
// import { ERROR_CODES, DocumentProcessingError } from "@/lib/errors"

// export async function POST(req: Request, { params }: { params: { id: string } }) {
//   try {
//     const { userId } = await auth()
//     if (!userId) {
//       throw new DocumentProcessingError(
//         ERROR_CODES.UNAUTHORIZED.code,
//         ERROR_CODES.UNAUTHORIZED.message,
//         ERROR_CODES.UNAUTHORIZED.status,
//       )
//     }

//     const {
//       format,
//       includeMetadata = true,
//       searchableText = false,
//     } = (await req.json()) as ExportOptions & { format: string }

//     const document = await prisma.document.findUnique({
//       where: { id: params.id },
//       include: {
//         content: true,
//         classifications: true,
//         fields: true,
//         tables: true,
//       },
//     })

//     if (!document) {
//       throw new DocumentProcessingError(
//         ERROR_CODES.NOT_FOUND.code,
//         ERROR_CODES.NOT_FOUND.message,
//         ERROR_CODES.NOT_FOUND.status,
//       )
//     }

//     const documentData: DocumentExportData = {
//       id: document.id,
//       title: document.title,
//       description: document.description || undefined,
//       fileName: document.fileName,
//       fileType: document.fileType,
//       documentType: document.documentType,
//       status: document.status,
//       processedAt: document.processedAt || undefined,
//       content: document.content
//         ? {
//             rawText: document.content.rawText,
//             htmlText: document.content.htmlText || undefined,
//             markdown: document.content.markdown || undefined,
//           }
//         : undefined,
//       classifications: document.classifications,
//       fields: document.fields,
//       tables: document.tables as any,
//     }

//     let buffer: Buffer
//     let contentType: string
//     let filename: string

//     switch (format) {
//       case "docx":
//         buffer = await exportToDocx(documentData)
//         contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//         filename = `${document.title}.docx`
//         break

//       case "xlsx":
//         buffer = await exportToExcel(documentData)
//         contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//         filename = `${document.title}.xlsx`
//         break

//       case "csv":
//         buffer = await exportToCsv(documentData)
//         contentType = "text/csv; charset=utf-8"
//         filename = `${document.title}.csv`
//         break

//       case "json":
//         buffer = Buffer.from(JSON.stringify(documentData, null, 2))
//         contentType = "application/json"
//         filename = `${document.title}.json`
//         break

//       case "markdown":
//         buffer = await exportToMarkdown(documentData)
//         contentType = "text/markdown"
//         filename = `${document.title}.md`
//         break

//       default:
//         throw new DocumentProcessingError(
//           ERROR_CODES.UNSUPPORTED_FORMAT.code,
//           ERROR_CODES.UNSUPPORTED_FORMAT.message,
//           ERROR_CODES.UNSUPPORTED_FORMAT.status,
//         )
//     }

//     const user = await prisma.user.findUnique({
//       where: { clerkId: userId },
//     })

//     if (user) {
//       await prisma.auditLog.create({
//         data: {
//           userId: user.id,
//           documentId: params.id,
//           action: `EXPORT_${format.toUpperCase()}`,
//           details: `Exported document to ${format} (${(buffer.length / 1024).toFixed(2)}KB)`,
//         },
//       })
//     }
// //
//     return new Response(buffer as unknown as BodyInit, {
//       status: 200,
//       headers: {
//         "Content-Type": contentType,
//         "Content-Disposition": `attachment; filename="${filename}"`,
//         "X-Content-Type-Options": "nosniff",
//       },
//     })
//   } catch (error) {
//     if (error instanceof DocumentProcessingError) {
//       return new Response(JSON.stringify({ error: error.message, code: error.code }), {
//         status: error.statusCode,
//       })
//     }

//     console.error("[v0] Export error:", error)
//     return new Response(
//       JSON.stringify({
//         error: ERROR_CODES.EXPORT_FAILED.message,
//         code: ERROR_CODES.EXPORT_FAILED.code,
//       }),
//       {
//         status: ERROR_CODES.EXPORT_FAILED.status,
//       },
//     )
//   }
// }

// async function exportToDocx(document: DocumentExportData): Promise<Buffer> {
//   const paragraphs: (Paragraph | DocxTable)[] = []

//   // Title
//   paragraphs.push(
//     new Paragraph({
//       text: document.title,
//       heading: "Heading1",
//       spacing: { after: 400 },
//     }),
//   )

//   // Metadata section
//   if (document.processedAt) {
//     paragraphs.push(
//       new Paragraph({
//         text: `Document Type: ${document.documentType} | Processed: ${new Date(document.processedAt).toLocaleDateString()}`,
//         spacing: { after: 200 },
//       }),
//     )
//   }

//   // Main content
//   if (document.content?.rawText) {
//     paragraphs.push(
//       new Paragraph({
//         text: "Extracted Content",
//         heading: "Heading2",
//         spacing: { before: 200, after: 200 },
//       }),
//     )

//     const lines = document.content.rawText.split("\n").filter((l: string) => l.trim())
//     lines.forEach((line: string) => {
//       paragraphs.push(
//         new Paragraph({
//           text: line,
//           spacing: { after: 100 },
//         }),
//       )
//     })
//   }

//   // Tables
//   if (document.tables && document.tables.length > 0) {
//     paragraphs.push(
//       new Paragraph({
//         text: "Extracted Tables",
//         heading: "Heading2",
//         spacing: { before: 400, after: 200 },
//       }),
//     )

//     document.tables.forEach((table: any, idx: number) => {
//       const rows: TableRow[] = []

//       // Header row
//       const headerCells = table.headers.map(
//         (header: string) =>
//           new TableCell({
//             children: [new Paragraph(header)],
//             shading: { fill: "D3D3D3" },
//           }),
//       )
//       rows.push(new TableRow({ children: headerCells }))

//       // Data rows
//       table.rows.forEach((row: any) => {
//         const dataCells = table.headers.map(
//           (header: string) =>
//             new TableCell({
//               children: [new Paragraph(String(row[header] || ""))],
//             }),
//         )
//         rows.push(new TableRow({ children: dataCells }))
//       })

//       paragraphs.push(
//         new DocxTable({
//           rows,
//         }),
//       )

//       if (document.tables && idx < document.tables.length - 1) {
//         paragraphs.push(new Paragraph({ text: "", spacing: { after: 200 } }))
//       }
//     })
//   }

//   const doc = new Document({
//     sections: [
//       {
//         children: paragraphs,
//       },
//     ],
//   })

//   return await Packer.toBuffer(doc)
// }

// async function exportToExcel(document: DocumentExportData): Promise<Buffer> {
//   const wb = XLSX.utils.book_new()

//   // Data sheet
//   const dataRows: Record<string, any>[] = []

//   if (document.content?.rawText) {
//     dataRows.push({
//       Field: "Extracted Text",
//       Value: document.content.rawText.substring(0, 32767),
//     })
//   }

//   dataRows.push({
//     Field: "Document Type",
//     Value: document.documentType,
//   })

//   if (document.processedAt) {
//     dataRows.push({
//       Field: "Processed Date",
//       Value: new Date(document.processedAt).toLocaleDateString(),
//     })
//   }

//   const dataWs = XLSX.utils.json_to_sheet(dataRows)
//   XLSX.utils.book_append_sheet(wb, dataWs, "Data")

//   // Fields sheet
//   if (document.fields && document.fields.length > 0) {
//     const fieldsData = document.fields.map((f: any) => ({
//       Label: f.label,
//       Value: f.value,
//       Confidence: (f.confidence * 100).toFixed(2) + "%",
//     }))
//     const fieldsWs = XLSX.utils.json_to_sheet(fieldsData)
//     XLSX.utils.book_append_sheet(wb, fieldsWs, "Fields")
//   }

//   // Tables sheet
//   if (document.tables && document.tables.length > 0) {
//     document.tables.forEach((table: any, idx: number) => {
//       const tableData = table.rows as any[]
//       const ws = XLSX.utils.json_to_sheet(tableData)
//       XLSX.utils.book_append_sheet(wb, ws, `Table_${idx + 1}`)
//     })
//   }

//   const buffer = await XLSX.write(wb, { bookType: "xlsx", type: "buffer" })
//   return Buffer.from(buffer as any)
// }

// async function exportToCsv(document: DocumentExportData): Promise<Buffer> {
//   const rows: string[] = ["Field,Value"]

//   if (document.content?.rawText) {
//     rows.push(`"Extracted Text","${document.content.rawText.replace(/"/g, '""').substring(0, 1000)}"`)
//   }

//   rows.push(`"Document Type","${document.documentType}"`)

//   if (document.processedAt) {
//     rows.push(`"Processed Date","${new Date(document.processedAt).toLocaleDateString()}"`)
//   }

//   if (document.fields) {
//     rows.push("") // Blank line
//     rows.push("Label,Value,Confidence")
//     document.fields.forEach((f: any) => {
//       rows.push(`"${f.label}","${f.value}","${(f.confidence * 100).toFixed(2)}%"`)
//     })
//   }

//   return Buffer.from(rows.join("\n"), "utf-8")
// }

// async function exportToMarkdown(document: DocumentExportData): Promise<Buffer> {
//   const lines: string[] = []

//   // Title
//   lines.push(`# ${document.title}`)
//   lines.push("")

//   // Metadata
//   lines.push("## Metadata")
//   lines.push(`- **Type**: ${document.documentType}`)
//   if (document.processedAt) {
//     lines.push(`- **Processed**: ${new Date(document.processedAt).toLocaleDateString()}`)
//   }
//   lines.push("")

//   // Content
//   if (document.content?.rawText) {
//     lines.push("## Extracted Content")
//     lines.push("")
//     lines.push(document.content.rawText)
//     lines.push("")
//   }

//   // Fields
//   if (document.fields && document.fields.length > 0) {
//     lines.push("## Extracted Fields")
//     lines.push("")
//     lines.push("| Label | Value | Confidence |")
//     lines.push("|-------|-------|------------|")
//     document.fields.forEach((f: any) => {
//       lines.push(`| ${f.label} | ${f.value} | ${(f.confidence * 100).toFixed(2)}% |`)
//     })
//     lines.push("")
//   }

//   // Tables
//   if (document.tables && document.tables.length > 0) {
//     lines.push("## Extracted Tables")
//     lines.push("")
//     document.tables.forEach((table: any, idx: number) => {
//       lines.push(`### Table ${idx + 1}`)
//       lines.push("")
//       lines.push(`| ${table.headers.join(" | ")} |`)
//       lines.push(`| ${table.headers.map(() => "---").join(" | ")} |`)
//       table.rows.forEach((row: any) => {
//         const cells = table.headers.map((h: string) => String(row[h] || ""))
//         lines.push(`| ${cells.join(" | ")} |`)
//       })
//       lines.push("")
//     })
//   }

//   return Buffer.from(lines.join("\n"), "utf-8")
// }



// import { auth } from "@clerk/nextjs/server"
// import { prisma } from "@/lib/db"
// import { Document, Packer, Paragraph, Table as DocxTable, TableRow, TableCell } from "docx"
// import * as XLSX from "xlsx"
// import type { DocumentExportData, ExportOptions } from "@/lib/types"
// import { ERROR_CODES, DocumentProcessingError } from "@/lib/errors"

// export async function POST(req: Request, { params }: { params: { id: string } }) {
//   try {
//     const { userId } = await auth()
//     if (!userId) {
//       throw new DocumentProcessingError(
//         ERROR_CODES.UNAUTHORIZED.code,
//         ERROR_CODES.UNAUTHORIZED.message,
//         ERROR_CODES.UNAUTHORIZED.status,
//       )
//     }

//     const {
//       format,
//       includeMetadata = true,
//       searchableText = false,
//     } = (await req.json()) as ExportOptions & { format: string }

//     const document = await prisma.document.findUnique({
//       where: { id: params.id },
//       include: {
//         content: true,
//         classifications: true,
//         fields: true,
//         tables: true,
//       },
//     })

//     if (!document) {
//       throw new DocumentProcessingError(
//         ERROR_CODES.NOT_FOUND.code,
//         ERROR_CODES.NOT_FOUND.message,
//         ERROR_CODES.NOT_FOUND.status,
//       )
//     }

//     const documentData: DocumentExportData = {
//       id: document.id,
//       title: document.title,
//       description: document.description || undefined,
//       fileName: document.fileName,
//       fileType: document.fileType,
//       documentType: document.documentType,
//       status: document.status,
//       processedAt: document.processedAt || undefined,
//       content: document.content
//         ? {
//             rawText: document.content.rawText,
//             htmlText: document.content.htmlText || undefined,
//             markdown: document.content.markdown || undefined,
//           }
//         : undefined,
//       classifications: document.classifications ? [{
//         type: document.classifications.type,
//         confidence: document.classifications.confidence,
//       }] : undefined,
//       fields: document.fields,
//       tables: document.tables as any,
//     }

//     let buffer: Buffer
//     let contentType: string
//     let filename: string

//     switch (format) {
//       case "docx":
//         buffer = await exportToDocx(documentData)
//         contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//         filename = `${document.title}.docx`
//         break

//       case "xlsx":
//         buffer = await exportToExcel(documentData)
//         contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//         filename = `${document.title}.xlsx`
//         break

//       case "csv":
//         buffer = await exportToCsv(documentData)
//         contentType = "text/csv; charset=utf-8"
//         filename = `${document.title}.csv`
//         break

//       case "json":
//         buffer = Buffer.from(JSON.stringify(documentData, null, 2))
//         contentType = "application/json"
//         filename = `${document.title}.json`
//         break

//       case "markdown":
//         buffer = await exportToMarkdown(documentData)
//         contentType = "text/markdown"
//         filename = `${document.title}.md`
//         break

//       default:
//         throw new DocumentProcessingError(
//           ERROR_CODES.UNSUPPORTED_FORMAT.code,
//           ERROR_CODES.UNSUPPORTED_FORMAT.message,
//           ERROR_CODES.UNSUPPORTED_FORMAT.status,
//         )
//     }

//     const user = await prisma.user.findUnique({
//       where: { clerkId: userId },
//     })

//     if (user) {
//       await prisma.auditLog.create({
//         data: {
//           userId: user.id,
//           documentId: params.id,
//           action: `EXPORT_${format.toUpperCase()}`,
//           details: `Exported document to ${format} (${(buffer.length / 1024).toFixed(2)}KB)`,
//         },
//       })
//     }
// //
//     return new Response(buffer as unknown as BodyInit, {
//       status: 200,
//       headers: {
//         "Content-Type": contentType,
//         "Content-Disposition": `attachment; filename="${filename}"`,
//         "X-Content-Type-Options": "nosniff",
//       },
//     })
//   } catch (error) {
//     if (error instanceof DocumentProcessingError) {
//       return new Response(JSON.stringify({ error: error.message, code: error.code }), {
//         status: error.statusCode,
//       })
//     }

//     console.error("[v0] Export error:", error)
//     return new Response(
//       JSON.stringify({
//         error: ERROR_CODES.EXPORT_FAILED.message,
//         code: ERROR_CODES.EXPORT_FAILED.code,
//       }),
//       {
//         status: ERROR_CODES.EXPORT_FAILED.status,
//       },
//     )
//   }
// }

// async function exportToDocx(document: DocumentExportData): Promise<Buffer> {
//   const paragraphs: (Paragraph | DocxTable)[] = []

//   // Title
//   paragraphs.push(
//     new Paragraph({
//       text: document.title,
//       heading: "Heading1",
//       spacing: { after: 400 },
//     }),
//   )

//   // Metadata section
//   if (document.processedAt) {
//     paragraphs.push(
//       new Paragraph({
//         text: `Document Type: ${document.documentType} | Processed: ${new Date(document.processedAt).toLocaleDateString()}`,
//         spacing: { after: 200 },
//       }),
//     )
//   }

//   // Main content
//   if (document.content?.rawText) {
//     paragraphs.push(
//       new Paragraph({
//         text: "Extracted Content",
//         heading: "Heading2",
//         spacing: { before: 200, after: 200 },
//       }),
//     )

//     const lines = document.content.rawText.split("\n").filter((l: string) => l.trim())
//     lines.forEach((line: string) => {
//       paragraphs.push(
//         new Paragraph({
//           text: line,
//           spacing: { after: 100 },
//         }),
//       )
//     })
//   }

//   // Tables
//   if (document.tables && document.tables.length > 0) {
//     paragraphs.push(
//       new Paragraph({
//         text: "Extracted Tables",
//         heading: "Heading2",
//         spacing: { before: 400, after: 200 },
//       }),
//     )

//     document.tables.forEach((table: any, idx: number) => {
//       const rows: TableRow[] = []

//       // Header row
//       const headerCells = table.headers.map(
//         (header: string) =>
//           new TableCell({
//             children: [new Paragraph(header)],
//             shading: { fill: "D3D3D3" },
//           }),
//       )
//       rows.push(new TableRow({ children: headerCells }))

//       // Data rows
//       table.rows.forEach((row: any) => {
//         const dataCells = table.headers.map(
//           (header: string) =>
//             new TableCell({
//               children: [new Paragraph(String(row[header] || ""))],
//             }),
//         )
//         rows.push(new TableRow({ children: dataCells }))
//       })

//       paragraphs.push(
//         new DocxTable({
//           rows,
//         }),
//       )

//       if (document.tables && idx < document.tables.length - 1) {
//         paragraphs.push(new Paragraph({ text: "", spacing: { after: 200 } }))
//       }
//     })
//   }

//   const doc = new Document({
//     sections: [
//       {
//         children: paragraphs,
//       },
//     ],
//   })

//   return await Packer.toBuffer(doc)
// }

// async function exportToExcel(document: DocumentExportData): Promise<Buffer> {
//   const wb = XLSX.utils.book_new()

//   // Data sheet
//   const dataRows: Record<string, any>[] = []

//   if (document.content?.rawText) {
//     dataRows.push({
//       Field: "Extracted Text",
//       Value: document.content.rawText.substring(0, 32767),
//     })
//   }

//   dataRows.push({
//     Field: "Document Type",
//     Value: document.documentType,
//   })

//   if (document.processedAt) {
//     dataRows.push({
//       Field: "Processed Date",
//       Value: new Date(document.processedAt).toLocaleDateString(),
//     })
//   }

//   const dataWs = XLSX.utils.json_to_sheet(dataRows)
//   XLSX.utils.book_append_sheet(wb, dataWs, "Data")

//   // Fields sheet
//   if (document.fields && document.fields.length > 0) {
//     const fieldsData = document.fields.map((f: any) => ({
//       Label: f.label,
//       Value: f.value,
//       Confidence: (f.confidence * 100).toFixed(2) + "%",
//     }))
//     const fieldsWs = XLSX.utils.json_to_sheet(fieldsData)
//     XLSX.utils.book_append_sheet(wb, fieldsWs, "Fields")
//   }

//   // Tables sheet
//   if (document.tables && document.tables.length > 0) {
//     document.tables.forEach((table: any, idx: number) => {
//       const tableData = table.rows as any[]
//       const ws = XLSX.utils.json_to_sheet(tableData)
//       XLSX.utils.book_append_sheet(wb, ws, `Table_${idx + 1}`)
//     })
//   }

//   const buffer = await XLSX.write(wb, { bookType: "xlsx", type: "buffer" })
//   return Buffer.from(buffer as any)
// }

// async function exportToCsv(document: DocumentExportData): Promise<Buffer> {
//   const rows: string[] = ["Field,Value"]

//   if (document.content?.rawText) {
//     rows.push(`"Extracted Text","${document.content.rawText.replace(/"/g, '""').substring(0, 1000)}"`)
//   }

//   rows.push(`"Document Type","${document.documentType}"`)

//   if (document.processedAt) {
//     rows.push(`"Processed Date","${new Date(document.processedAt).toLocaleDateString()}"`)
//   }

//   if (document.fields) {
//     rows.push("") // Blank line
//     rows.push("Label,Value,Confidence")
//     document.fields.forEach((f: any) => {
//       rows.push(`"${f.label}","${f.value}","${(f.confidence * 100).toFixed(2)}%"`)
//     })
//   }

//   return Buffer.from(rows.join("\n"), "utf-8")
// }

// async function exportToMarkdown(document: DocumentExportData): Promise<Buffer> {
//   const lines: string[] = []

//   // Title
//   lines.push(`# ${document.title}`)
//   lines.push("")

//   // Metadata
//   lines.push("## Metadata")
//   lines.push(`- **Type**: ${document.documentType}`)
//   if (document.processedAt) {
//     lines.push(`- **Processed**: ${new Date(document.processedAt).toLocaleDateString()}`)
//   }
//   lines.push("")

//   // Content
//   if (document.content?.rawText) {
//     lines.push("## Extracted Content")
//     lines.push("")
//     lines.push(document.content.rawText)
//     lines.push("")
//   }

//   // Fields
//   if (document.fields && document.fields.length > 0) {
//     lines.push("## Extracted Fields")
//     lines.push("")
//     lines.push("| Label | Value | Confidence |")
//     lines.push("|-------|-------|------------|")
//     document.fields.forEach((f: any) => {
//       lines.push(`| ${f.label} | ${f.value} | ${(f.confidence * 100).toFixed(2)}% |`)
//     })
//     lines.push("")
//   }

//   // Tables
//   if (document.tables && document.tables.length > 0) {
//     lines.push("## Extracted Tables")
//     lines.push("")
//     document.tables.forEach((table: any, idx: number) => {
//       lines.push(`### Table ${idx + 1}`)
//       lines.push("")
//       lines.push(`| ${table.headers.join(" | ")} |`)
//       lines.push(`| ${table.headers.map(() => "---").join(" | ")} |`)
//       table.rows.forEach((row: any) => {
//         const cells = table.headers.map((h: string) => String(row[h] || ""))
//         lines.push(`| ${cells.join(" | ")} |`)
//       })
//       lines.push("")
//     })
//   }

//   return Buffer.from(lines.join("\n"), "utf-8")
// }



// app/api/documents/[id]/export/route.ts
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { Document, Packer, Paragraph, Table as DocxTable, TableRow, TableCell } from "docx"
import * as XLSX from "xlsx"
import { NextResponse } from "next/server"

type DocumentExportData = {
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
  fields: any[]
  tables: any[]
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { format } = (await req.json()) as { format: string }

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        content: true,
        classifications: true,
        fields: true,
        tables: true,
      },
    })

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    const documentData: DocumentExportData = {
      id: document.id,
      title: document.title,
      description: document.description || undefined,
      fileName: document.fileName,
      fileType: document.fileType,
      documentType: document.documentType,
      status: document.status,
      processedAt: document.processedAt || undefined,
      content: document.content
        ? {
            rawText: document.content.rawText,
            htmlText: document.content.htmlText || undefined,
            markdown: document.content.markdown || undefined,
          }
        : undefined,
      classifications: document.classifications
        ? [
            {
              type: document.classifications.type,
              confidence: document.classifications.confidence,
            },
          ]
        : undefined,
      fields: document.fields,
      tables: document.tables as any,
    }

    let buffer: Buffer
    let contentType: string
    let filename: string

    switch (format) {
      case "docx":
        buffer = await exportToDocx(documentData)
        contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        filename = `${document.title}.docx`
        break

      case "xlsx":
        buffer = await exportToExcel(documentData)
        contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        filename = `${document.title}.xlsx`
        break

      case "csv":
        buffer = await exportToCsv(documentData)
        contentType = "text/csv; charset=utf-8"
        filename = `${document.title}.csv`
        break

      case "json":
        buffer = Buffer.from(JSON.stringify(documentData, null, 2))
        contentType = "application/json"
        filename = `${document.title}.json`
        break

      case "markdown":
        buffer = await exportToMarkdown(documentData)
        contentType = "text/markdown"
        filename = `${document.title}.md`
        break

      default:
        return NextResponse.json({ error: "Unsupported format" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (user) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          documentId: id,
          action: `EXPORT_${format.toUpperCase()}`,
          details: `Exported document to ${format} (${(buffer.length / 1024).toFixed(2)}KB)`,
        },
      })
    }

    return new Response(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error) {
    console.error("[Export] Error:", error)
    return NextResponse.json(
      {
        error: "Export failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

async function exportToDocx(document: DocumentExportData): Promise<Buffer> {
  const paragraphs: (Paragraph | DocxTable)[] = []

  paragraphs.push(
    new Paragraph({
      text: document.title,
      heading: "Heading1",
      spacing: { after: 400 },
    })
  )

  if (document.processedAt) {
    paragraphs.push(
      new Paragraph({
        text: `Document Type: ${document.documentType} | Processed: ${new Date(document.processedAt).toLocaleDateString()}`,
        spacing: { after: 200 },
      })
    )
  }

  if (document.content?.rawText) {
    paragraphs.push(
      new Paragraph({
        text: "Extracted Content",
        heading: "Heading2",
        spacing: { before: 200, after: 200 },
      })
    )

    const lines = document.content.rawText.split("\n").filter((l: string) => l.trim())
    lines.forEach((line: string) => {
      paragraphs.push(
        new Paragraph({
          text: line,
          spacing: { after: 100 },
        })
      )
    })
  }

  if (document.tables && document.tables.length > 0) {
    paragraphs.push(
      new Paragraph({
        text: "Extracted Tables",
        heading: "Heading2",
        spacing: { before: 400, after: 200 },
      })
    )

    document.tables.forEach((table: any, idx: number) => {
      const rows: TableRow[] = []

      const headerCells = table.headers.map(
        (header: string) =>
          new TableCell({
            children: [new Paragraph(header)],
            shading: { fill: "D3D3D3" },
          })
      )
      rows.push(new TableRow({ children: headerCells }))

      table.rows.forEach((row: any) => {
        const dataCells = table.headers.map(
          (header: string) =>
            new TableCell({
              children: [new Paragraph(String(row[header] || ""))],
            })
        )
        rows.push(new TableRow({ children: dataCells }))
      })

      paragraphs.push(new DocxTable({ rows }))

      if (document.tables && idx < document.tables.length - 1) {
        paragraphs.push(new Paragraph({ text: "", spacing: { after: 200 } }))
      }
    })
  }

  const doc = new Document({
    sections: [
      {
        children: paragraphs,
      },
    ],
  })

  return await Packer.toBuffer(doc)
}

async function exportToExcel(document: DocumentExportData): Promise<Buffer> {
  const wb = XLSX.utils.book_new()

  const dataRows: Record<string, any>[] = []

  if (document.content?.rawText) {
    dataRows.push({
      Field: "Extracted Text",
      Value: document.content.rawText.substring(0, 32767),
    })
  }

  dataRows.push({
    Field: "Document Type",
    Value: document.documentType,
  })

  if (document.processedAt) {
    dataRows.push({
      Field: "Processed Date",
      Value: new Date(document.processedAt).toLocaleDateString(),
    })
  }

  const dataWs = XLSX.utils.json_to_sheet(dataRows)
  XLSX.utils.book_append_sheet(wb, dataWs, "Data")

  if (document.fields && document.fields.length > 0) {
    const fieldsData = document.fields.map((f: any) => ({
      Label: f.label,
      Value: f.value,
      Confidence: (f.confidence * 100).toFixed(2) + "%",
    }))
    const fieldsWs = XLSX.utils.json_to_sheet(fieldsData)
    XLSX.utils.book_append_sheet(wb, fieldsWs, "Fields")
  }

  if (document.tables && document.tables.length > 0) {
    document.tables.forEach((table: any, idx: number) => {
      const tableData = table.rows as any[]
      const ws = XLSX.utils.json_to_sheet(tableData)
      XLSX.utils.book_append_sheet(wb, ws, `Table_${idx + 1}`)
    })
  }

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" })
  return Buffer.from(buffer as any)
}

async function exportToCsv(document: DocumentExportData): Promise<Buffer> {
  const rows: string[] = ["Field,Value"]

  if (document.content?.rawText) {
    rows.push(`"Extracted Text","${document.content.rawText.replace(/"/g, '""').substring(0, 1000)}"`)
  }

  rows.push(`"Document Type","${document.documentType}"`)

  if (document.processedAt) {
    rows.push(`"Processed Date","${new Date(document.processedAt).toLocaleDateString()}"`)
  }

  if (document.fields) {
    rows.push("")
    rows.push("Label,Value,Confidence")
    document.fields.forEach((f: any) => {
      rows.push(`"${f.label}","${f.value}","${(f.confidence * 100).toFixed(2)}%"`)
    })
  }

  return Buffer.from(rows.join("\n"), "utf-8")
}

async function exportToMarkdown(document: DocumentExportData): Promise<Buffer> {
  const lines: string[] = []

  lines.push(`# ${document.title}`)
  lines.push("")

  lines.push("## Metadata")
  lines.push(`- **Type**: ${document.documentType}`)
  if (document.processedAt) {
    lines.push(`- **Processed**: ${new Date(document.processedAt).toLocaleDateString()}`)
  }
  lines.push("")

  if (document.content?.rawText) {
    lines.push("## Extracted Content")
    lines.push("")
    lines.push(document.content.rawText)
    lines.push("")
  }

  if (document.fields && document.fields.length > 0) {
    lines.push("## Extracted Fields")
    lines.push("")
    lines.push("| Label | Value | Confidence |")
    lines.push("|-------|-------|------------|")
    document.fields.forEach((f: any) => {
      lines.push(`| ${f.label} | ${f.value} | ${(f.confidence * 100).toFixed(2)}% |`)
    })
    lines.push("")
  }

  if (document.tables && document.tables.length > 0) {
    lines.push("## Extracted Tables")
    lines.push("")
    document.tables.forEach((table: any, idx: number) => {
      lines.push(`### Table ${idx + 1}`)
      lines.push("")
      lines.push(`| ${table.headers.join(" | ")} |`)
      lines.push(`| ${table.headers.map(() => "---").join(" | ")} |`)
      table.rows.forEach((row: any) => {
        const cells = table.headers.map((h: string) => String(row[h] || ""))
        lines.push(`| ${cells.join(" | ")} |`)
      })
      lines.push("")
    })
  }

  return Buffer.from(lines.join("\n"), "utf-8")
}
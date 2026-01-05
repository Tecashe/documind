// import { type NextRequest, NextResponse } from "next/server"

// // Helper function to create a simple DOCX file (XML-based)
// async function createDocx(text: string): Promise<Buffer> {
//   // Create a minimal valid DOCX structure
//   // DOCX files are ZIP archives containing XML files

//   // Note: For production, install and use the 'docx' library:
//   // npm install docx
//   // Then use: const { Document, Packer, Paragraph } = require('docx')

//   const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
// <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
//   <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
//   <Default Extension="xml" ContentType="application/xml"/>
//   <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
// </Types>`

//   const documentRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
// <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>
// `

//   const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
// <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
//   <w:body>
//     ${text
//       .split("\n")
//       .map((paragraph) => `<w:p><w:r><w:t>${escapeXml(paragraph)}</w:t></w:r></w:p>`)
//       .join("")}
//   </w:body>
// </w:document>`

//   const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
// <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
//   <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
// </Relationships>`

//   // Since we can't use JSZip in this simple example, return a basic structure
//   // For production: use 'archiver' or 'jszip' to create proper ZIP
//   // This is a placeholder that should be replaced with proper DOCX generation

//   // Create a simple text representation as fallback
//   const docxContent = `Word Document Export\n\n${text}`
//   return Buffer.from(docxContent, "utf-8")
// }

// // Helper function to create a simple XLSX file
// async function createXlsx(text: string): Promise<Buffer> {
//   // For production, install and use the 'xlsx' library:
//   // npm install xlsx
//   // Then use:
//   // const XLSX = require('xlsx')
//   // const ws = XLSX.utils.aoa_to_sheet(data)
//   // const wb = XLSX.utils.book_new()
//   // XLSX.utils.book_append_sheet(wb, ws, "Sheet1")
//   // return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' })

//   // Parse content into rows
//   const rows = text.split("\n").filter((l) => l.trim())
//   const csvContent = rows.map((row) => `"${row.replace(/"/g, '""')}"`).join("\n")

//   // Return as CSV-compatible format (can be opened in Excel)
//   return Buffer.from(csvContent, "utf-8")
// }

// function escapeXml(str: string): string {
//   return str
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;")
//     .replace(/'/g, "&apos;")
// }

// export async function POST(request: NextRequest) {
//   try {
//     const { text, format } = await request.json()

//     if (!text || !format) {
//       return NextResponse.json({ error: "Missing text or format" }, { status: 400 })
//     }

//     let buffer: Buffer
//     let contentType: string
//     let filename: string

//     if (format === "docx") {
//       buffer = await createDocx(text)
//       contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//       filename = "document.docx"
//     } else if (format === "xlsx") {
//       buffer = await createXlsx(text)
//       contentType = "text/csv" //Fallback to CSV which Excel can read
//       filename = "document.csv"
//     } else {
//       return NextResponse.json({ error: "Unsupported format" }, { status: 400 })
//     }

//     return new NextResponse(buffer, {
//       headers: {
//         "Content-Type": contentType,
//         "Content-Disposition": `attachment; filename="${filename}"`,
//       },
//     })
//   } catch (error) {
//     console.error("Export error:", error)
//     return NextResponse.json({ error: "Failed to export document" }, { status: 500 })
//   }
// }
// import { type NextRequest, NextResponse } from "next/server"
// import { Document, Packer, Paragraph, TextRun } from "docx"
// import * as XLSX from "xlsx"

// // Helper function to create a DOCX file
// async function createDocx(text: string): Promise<Buffer> {
//   try {
//     // Split text into paragraphs
//     const paragraphs = text.split("\n").map(
//       (line) =>
//         new Paragraph({
//           children: [
//             new TextRun({
//               text: line || " ", // Empty line if no text
//               size: 24, // 12pt font (size is in half-points)
//             }),
//           ],
//           spacing: {
//             after: 200, // Add spacing after each paragraph
//           },
//         })
//     )

//     // Create document
//     const doc = new Document({
//       sections: [
//         {
//           properties: {},
//           children: paragraphs,
//         },
//       ],
//     })

//     // Generate buffer
//     const buffer = await Packer.toBuffer(doc)
//     return Buffer.from(buffer)
//   } catch (error) {
//     console.error("Error creating DOCX:", error)
//     throw new Error("Failed to create DOCX file")
//   }
// }

// // Helper function to create an XLSX file
// async function createXlsx(text: string): Promise<Buffer> {
//   try {
//     // Split text into rows
//     const rows = text.split("\n").map((line) => [line])

//     // Create worksheet from array of arrays
//     const worksheet = XLSX.utils.aoa_to_sheet(rows)

//     // Set column width
//     worksheet["!cols"] = [{ wch: 100 }]

//     // Create workbook
//     const workbook = XLSX.utils.book_new()
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")

//     // Generate buffer
//     const buffer = XLSX.write(workbook, {
//       bookType: "xlsx",
//       type: "buffer",
//     })

//     return Buffer.from(buffer)
//   } catch (error) {
//     console.error("Error creating XLSX:", error)
//     throw new Error("Failed to create XLSX file")
//   }
// }

// // Helper function to parse structured data from text
// function parseTextToStructuredData(text: string): string[][] {
//   const lines = text.split("\n").filter((line) => line.trim())

//   // Try to detect if it's table-like data (has consistent delimiters)
//   const hasConsistentDelimiters = lines.every(
//     (line) => line.includes("|") || line.includes("\t") || line.includes(",")
//   )

//   if (hasConsistentDelimiters) {
//     // Parse as table
//     return lines.map((line) => {
//       // Try pipe delimiter first, then tab, then comma
//       if (line.includes("|")) {
//         return line
//           .split("|")
//           .map((cell) => cell.trim())
//           .filter((cell) => cell)
//       } else if (line.includes("\t")) {
//         return line.split("\t").map((cell) => cell.trim())
//       } else if (line.includes(",")) {
//         return line.split(",").map((cell) => cell.trim())
//       }
//       return [line]
//     })
//   }

//   // Otherwise, treat each line as a single cell
//   return lines.map((line) => [line])
// }

// // Enhanced XLSX creation with table support
// async function createXlsxEnhanced(text: string): Promise<Buffer> {
//   try {
//     const data = parseTextToStructuredData(text)

//     // Create worksheet from array of arrays
//     const worksheet = XLSX.utils.aoa_to_sheet(data)

//     // Auto-size columns
//     const maxWidths = data.reduce((acc, row) => {
//       row.forEach((cell, idx) => {
//         const width = cell.toString().length
//         acc[idx] = Math.max(acc[idx] || 10, width + 2)
//       })
//       return acc
//     }, [] as number[])

//     worksheet["!cols"] = maxWidths.map((w) => ({ wch: Math.min(w, 50) }))

//     // Create workbook
//     const workbook = XLSX.utils.book_new()
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")

//     // Generate buffer
//     const buffer = XLSX.write(workbook, {
//       bookType: "xlsx",
//       type: "buffer",
//     })

//     return Buffer.from(buffer)
//   } catch (error) {
//     console.error("Error creating enhanced XLSX:", error)
//     throw new Error("Failed to create XLSX file")
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json()
//     const { text, format, filename } = body

//     // Validation
//     if (!text || typeof text !== "string") {
//       return NextResponse.json({ error: "Missing or invalid text content" }, { status: 400 })
//     }

//     if (!format || !["docx", "xlsx"].includes(format)) {
//       return NextResponse.json({ error: "Invalid format. Use 'docx' or 'xlsx'" }, { status: 400 })
//     }

//     let buffer: Buffer
//     let contentType: string
//     let defaultFilename: string

//     // Generate document based on format
//     if (format === "docx") {
//       buffer = await createDocx(text)
//       contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//       defaultFilename = "document.docx"
//     } else if (format === "xlsx") {
//       buffer = await createXlsxEnhanced(text)
//       contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//       defaultFilename = "document.xlsx"
//     } else {
//       return NextResponse.json({ error: "Unsupported format" }, { status: 400 })
//     }

//     // Use custom filename if provided, otherwise use default
//     const finalFilename = filename || defaultFilename

//     // Return the file with proper headers
//     return new NextResponse(buffer, {
//       status: 200,
//       headers: {
//         "Content-Type": contentType,
//         "Content-Disposition": `attachment; filename="${finalFilename}"`,
//         "Content-Length": buffer.length.toString(),
//       },
//     })
//   } catch (error) {
//     console.error("Export error:", error)

//     const errorMessage = error instanceof Error ? error.message : "Failed to export document"

//     return NextResponse.json(
//       {
//         error: "Export failed",
//         details: errorMessage,
//       },
//       { status: 500 }
//     )
//   }
// }







import { type NextRequest, NextResponse } from "next/server"
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
} from "docx"
import * as XLSX from "xlsx"
import { z } from "zod"

// Validation schema
const ExportSchema = z.object({
  text: z.string().min(1),
  format: z.enum(["docx", "xlsx", "csv", "json", "txt"]),
  filename: z.string().optional(),
  classification: z.any().optional(),
  options: z
    .object({
      title: z.string().optional(),
      author: z.string().optional(),
      subject: z.string().optional(),
      includeMetadata: z.boolean().optional(),
      includeTimestamp: z.boolean().optional(),
      styling: z
        .object({
          fontSize: z.number().min(8).max(72).optional(),
          fontFamily: z.string().optional(),
          lineSpacing: z.number().optional(),
          margins: z
            .object({
              top: z.number().optional(),
              bottom: z.number().optional(),
              left: z.number().optional(),
              right: z.number().optional(),
            })
            .optional(),
          headerFooter: z.boolean().optional(),
          pageNumbers: z.boolean().optional(),
          theme: z.enum(["light", "dark", "blue", "green"]).optional(),
        })
        .optional(),
      tableOptions: z
        .object({
          headerStyle: z.enum(["bold", "colored", "minimal"]).optional(),
          borders: z.boolean().optional(),
          alternatingRows: z.boolean().optional(),
        })
        .optional(),
      compression: z.boolean().optional(),
    })
    .optional(),
})

type ExportOptions = z.infer<typeof ExportSchema>

// Color themes
const THEMES = {
  light: { primary: "2563EB", secondary: "E7E6E6", text: "000000" },
  dark: { primary: "1E293B", secondary: "334155", text: "FFFFFF" },
  blue: { primary: "0EA5E9", secondary: "BAE6FD", text: "0C4A6E" },
  green: { primary: "10B981", secondary: "D1FAE5", text: "065F46" },
}

// Enhanced DOCX creation with full features
async function createAdvancedDocx(options: ExportOptions): Promise<Buffer> {
  const { text, classification, options: opts } = options
  const styling = opts?.styling || {}
  const theme = THEMES[styling.theme || "light"]

  const children: (Paragraph | Table)[] = []

  // Add title section
  if (opts?.title) {
    children.push(
      new Paragraph({
        text: opts.title,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        border: {
          bottom: {
            color: theme.primary,
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    )
  }

  // Add metadata section
  if (opts?.includeMetadata) {
    const metadata: string[] = []
    if (opts.author) metadata.push(`Author: ${opts.author}`)
    if (opts.subject) metadata.push(`Subject: ${opts.subject}`)
    if (opts.includeTimestamp) {
      metadata.push(
        `Generated: ${new Date().toLocaleString("en-US", {
          dateStyle: "full",
          timeStyle: "short",
        })}`
      )
    }
    if (classification) {
      metadata.push(`Document Type: ${classification.type || "Unknown"}`)
      if (classification.confidence) {
        metadata.push(`Confidence: ${(classification.confidence * 100).toFixed(1)}%`)
      }
    }

    metadata.forEach((line) => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: line, italics: true, size: 20 })],
          spacing: { after: 50 },
        })
      )
    })

    children.push(new Paragraph({ text: "", spacing: { after: 300 } }))
  }

  // Parse and add content
  const lines = text.split("\n")
  let currentTable: string[][] = []
  let inTable = false
  let inCodeBlock = false
  let codeLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()

    // Handle code blocks
    if (trimmedLine.startsWith("```")) {
      if (!inCodeBlock) {
        inCodeBlock = true
        codeLines = []
      } else {
        // End code block
        children.push(createCodeBlock(codeLines, theme))
        inCodeBlock = false
        codeLines = []
      }
      continue
    }

    if (inCodeBlock) {
      codeLines.push(line)
      continue
    }

    // Detect table rows
    if (trimmedLine.includes("|") && trimmedLine.split("|").length > 2) {
      const cells = trimmedLine
        .split("|")
        .map((cell) => cell.trim())
        .filter((cell) => cell)

      if (!cells.every((cell) => /^-+$/.test(cell))) {
        currentTable.push(cells)
        inTable = true
        continue
      }
    } else if (inTable && currentTable.length > 0) {
      children.push(createStyledTable(currentTable, opts?.tableOptions, theme))
      currentTable = []
      inTable = false
    }

    // Parse markdown-style content
    if (trimmedLine.startsWith("# ")) {
      children.push(
        new Paragraph({
          text: trimmedLine.substring(2),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        })
      )
    } else if (trimmedLine.startsWith("## ")) {
      children.push(
        new Paragraph({
          text: trimmedLine.substring(3),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      )
    } else if (trimmedLine.startsWith("### ")) {
      children.push(
        new Paragraph({
          text: trimmedLine.substring(4),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 160, after: 80 },
        })
      )
    } else if (trimmedLine.match(/^[•\-\*]\s/)) {
      const bulletText = trimmedLine.replace(/^[•\-\*]\s+/, "")
      children.push(
        new Paragraph({
          text: bulletText,
          bullet: { level: 0 },
          spacing: { after: 100 },
        })
      )
    } else if (trimmedLine.match(/^\d+\.\s/)) {
      const numberText = trimmedLine.replace(/^\d+\.\s+/, "")
      children.push(
        new Paragraph({
          text: numberText,
          numbering: { reference: "default-numbering", level: 0 },
          spacing: { after: 100 },
        })
      )
    } else if (trimmedLine.startsWith(">")) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmedLine.substring(1).trim(),
              italics: true,
            }),
          ],
          indent: { left: 720 },
          border: {
            left: {
              color: theme.primary,
              space: 1,
              style: BorderStyle.SINGLE,
              size: 12,
            },
          },
          spacing: { after: 120 },
        })
      )
    } else {
      children.push(createRichTextParagraph(line, styling))
    }
  }

  // Add remaining table
  if (currentTable.length > 0) {
    children.push(createStyledTable(currentTable, opts?.tableOptions, theme))
  }

  // Create document with headers and footers
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: (styling.margins?.top || 1) * 1440,
              bottom: (styling.margins?.bottom || 1) * 1440,
              left: (styling.margins?.left || 1) * 1440,
              right: (styling.margins?.right || 1) * 1440,
            },
          },
        },
        headers:
          styling.headerFooter && opts?.title
            ? {
                default: new Header({
                  children: [
                    new Paragraph({
                      text: opts.title,
                      alignment: AlignmentType.CENTER,
                      border: {
                        bottom: {
                          color: theme.secondary,
                          space: 1,
                          style: BorderStyle.SINGLE,
                          size: 6,
                        },
                      },
                    }),
                  ],
                }),
              }
            : undefined,
        footers:
          styling.pageNumbers
            ? {
                default: new Footer({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun("Page "),
                        new TextRun({
                          children: [PageNumber.CURRENT],
                        }),
                        new TextRun(" of "),
                        new TextRun({
                          children: [PageNumber.TOTAL_PAGES],
                        }),
                      ],
                    }),
                  ],
                }),
              }
            : undefined,
        children,
      },
    ],
  })

  const buffer = await Packer.toBuffer(doc)
  return Buffer.from(buffer)
}

// Create rich text paragraph with inline formatting
function createRichTextParagraph(text: string, styling: any): Paragraph {
  const runs: TextRun[] = []
  let currentText = ""
  let isBold = false
  let isItalic = false
  let isCode = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const next = text[i + 1]

    // Bold (**text**)
    if (char === "*" && next === "*") {
      if (currentText) {
        runs.push(new TextRun({ text: currentText, bold: isBold, italics: isItalic }))
        currentText = ""
      }
      isBold = !isBold
      i++ // Skip next *
    }
    // Italic (*text*)
    else if (char === "*") {
      if (currentText) {
        runs.push(new TextRun({ text: currentText, bold: isBold, italics: isItalic }))
        currentText = ""
      }
      isItalic = !isItalic
    }
    // Inline code (`code`)
    else if (char === "`") {
      if (currentText) {
        runs.push(
          new TextRun({
            text: currentText,
            bold: isBold,
            italics: isItalic,
            font: isCode ? "Courier New" : undefined,
          })
        )
        currentText = ""
      }
      isCode = !isCode
    } else {
      currentText += char
    }
  }

  if (currentText) {
    runs.push(
      new TextRun({
        text: currentText,
        bold: isBold,
        italics: isItalic,
        size: (styling.fontSize || 12) * 2,
        font: styling.fontFamily || "Calibri",
      })
    )
  }

  return new Paragraph({
    children: runs.length > 0 ? runs : [new TextRun(text)],
    spacing: { after: 120 },
  })
}

// Create code block
function createCodeBlock(lines: string[], theme: any): Table {
  return new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: lines.map(
              (line) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: line || " ",
                      font: "Courier New",
                      size: 20,
                    }),
                  ],
                })
            ),
            shading: { fill: theme.secondary },
          }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
    margins: {
      top: 100,
      bottom: 100,
      left: 100,
      right: 100,
    },
  })
}

// Create styled table
function createStyledTable(data: string[][], options: any, theme: any): Table {
  const headerStyle = options?.headerStyle || "colored"
  const hasBorders = options?.borders !== false
  const alternatingRows = options?.alternatingRows !== false

  const rows = data.map((rowData, rowIndex) => {
    const isHeader = rowIndex === 0
    const isAlternate = alternatingRows && rowIndex % 2 === 1

    return new TableRow({
      children: rowData.map(
        (cellData) =>
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: cellData,
                    bold: isHeader && headerStyle !== "minimal",
                    color: isHeader && headerStyle === "colored" ? "FFFFFF" : undefined,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            shading: {
              fill: isHeader && headerStyle === "colored" ? theme.primary : isAlternate ? theme.secondary : "FFFFFF",
            },
          })
      ),
    })
  })

  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: hasBorders
      ? {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
          insideVertical: { style: BorderStyle.SINGLE, size: 1 },
        }
      : undefined,
  })
}

// Advanced XLSX creation
async function createAdvancedXlsx(options: ExportOptions): Promise<Buffer> {
  const { text, classification, options: opts } = options
  const data: any[][] = []

  // Add metadata section
  if (opts?.includeMetadata) {
    if (opts.title) data.push([opts.title], [])
    if (opts.author) data.push([`Author: ${opts.author}`])
    if (opts.includeTimestamp) {
      data.push([`Generated: ${new Date().toLocaleString()}`])
    }
    if (classification) {
      data.push([`Type: ${classification.type || "Unknown"}`])
    }
    data.push([]) // Empty row separator
  }

  // Parse content
  const lines = text.split("\n").filter((line) => line.trim())

  for (const line of lines) {
    if (line.includes("|")) {
      const cells = line
        .split("|")
        .map((cell) => cell.trim())
        .filter((cell) => cell && !cell.match(/^-+$/))
      if (cells.length > 0) data.push(cells)
    } else if (line.includes("\t")) {
      data.push(line.split("\t").map((cell) => cell.trim()))
    } else {
      data.push([line])
    }
  }

  const worksheet = XLSX.utils.aoa_to_sheet(data)

  // Auto-size columns
  const maxWidths = data.reduce(
    (acc, row) => {
      row.forEach((cell, idx) => {
        const width = cell?.toString().length || 0
        acc[idx] = Math.max(acc[idx] || 10, width + 2)
      })
      return acc
    },
    [] as number[]
  )

  worksheet["!cols"] = maxWidths.map((w) => ({ wch: Math.min(w, 50) }))

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")

  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" })
  return Buffer.from(buffer)
}

// Create CSV
function createCsv(options: ExportOptions): Buffer {
  const lines = options.text.split("\n")
  const csvContent = lines
    .map((line) => {
      if (line.includes("|")) {
        return line
          .split("|")
          .map((cell) => cell.trim())
          .filter((cell) => cell)
          .map((cell) => `"${cell.replace(/"/g, '""')}"`)
          .join(",")
      }
      return `"${line.replace(/"/g, '""')}"`
    })
    .join("\n")

  return Buffer.from(csvContent, "utf-8")
}

// Create JSON
function createJson(options: ExportOptions): Buffer {
  const output = {
    metadata: {
      title: options.options?.title,
      author: options.options?.author,
      subject: options.options?.subject,
      generated: new Date().toISOString(),
      classification: options.classification,
    },
    content: {
      raw: options.text,
      lines: options.text.split("\n"),
    },
  }

  return Buffer.from(JSON.stringify(output, null, 2), "utf-8")
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = ExportSchema.parse(body)

    let buffer: Buffer
    let contentType: string
    let extension: string

    switch (validated.format) {
      case "docx":
        buffer = await createAdvancedDocx(validated)
        contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        extension = "docx"
        break

      case "xlsx":
        buffer = await createAdvancedXlsx(validated)
        contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        extension = "xlsx"
        break

      case "csv":
        buffer = createCsv(validated)
        contentType = "text/csv"
        extension = "csv"
        break

      case "json":
        buffer = createJson(validated)
        contentType = "application/json"
        extension = "json"
        break

      case "txt":
        buffer = Buffer.from(validated.text, "utf-8")
        contentType = "text/plain"
        extension = "txt"
        break

      default:
        return NextResponse.json({ error: "Unsupported format" }, { status: 400 })
    }

    const filename = validated.filename || `document-${Date.now()}.${extension}`

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
        "X-Export-Format": validated.format,
        "X-Export-Size": buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Export error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: "Export failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
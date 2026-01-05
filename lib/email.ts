// import { prisma } from "./db"
// import crypto from "crypto"

// export async function generateUniqueEmailAddress(userId: string): Promise<string> {
//   const domain = process.env.EMAIL_DOMAIN || "documents.example.com"
//   const maxAttempts = 10

//   for (let i = 0; i < maxAttempts; i++) {
//     const uniqueId = crypto.randomBytes(8).toString("hex")
//     const email = `doc-${uniqueId}@${domain}`

//     // Checkif email already exists
//     const exists = await prisma.user.findFirst({
//       where: { emailForwardingAddress: email },
//     })

//     if (!exists) return email
//   }

//   throw new Error("Failed to generate unique email address")
// }

// export async function processIncomingEmail(to: string, from: string, subject: string, attachments: Buffer[]) {
//   // Find user by email forwarding address
//   const user = await prisma.user.findFirst({
//     where: { emailForwardingAddress: to },
//   })

//   if (!user) {
//     throw new Error("Email address not found")
//   }

//   const documents = []

//   //Process each attachment
//   for (const attachment of attachments) {
//     const document = await prisma.document.create({
//       data: {
//         userId: user.id,
//         title: subject || "Forwarded Document",
//         fileName: `forwarded-${Date.now()}.pdf`,
//         fileSize: attachment.length,
//         status: "pending",
//         source: "email",
//         sourceMetadata: {
//           from,
//           date: new Date().toISOString(),
//         },
//       },
//     })

//     documents.push(document)
//   }

//   // Log the incoming email
//   await prisma.auditLog.create({
//     data: {
//       userId: user.id,
//       action: "DOCUMENT_RECEIVED_VIA_EMAIL",
//       details: {
//         from,
//         subject,
//         documentCount: documents.length,
//       },
//     },
//   })

//   return documents
// }

import { prisma } from "./db"
import crypto from "crypto"

export async function generateUniqueEmailAddress(userId: string): Promise<string> {
  const domain = process.env.EMAIL_DOMAIN || "documents.example.com"
  const maxAttempts = 10

  for (let i = 0; i < maxAttempts; i++) {
    const uniqueId = crypto.randomBytes(8).toString("hex")
    const email = `doc-${uniqueId}@${domain}`

    // Check if email already exists
    const exists = await prisma.user.findFirst({
      where: { emailForwardingAddress: email },
    })

    if (!exists) return email
  }

  throw new Error("Failed to generate unique email address")
}

export async function processIncomingEmail(to: string, from: string, subject: string, attachments: Buffer[]) {
  // Find user by email forwarding address
  const user = await prisma.user.findFirst({
    where: { emailForwardingAddress: to },
  })

  if (!user) {
    throw new Error("Email address not found")
  }

  const documents = []

  // Process each attachment
  for (const attachment of attachments) {
    const document = await prisma.document.create({
      data: {
        ownerId: user.id, // ✅ Fixed: Use ownerId instead of userId
        title: subject || "Forwarded Document",
        fileName: `forwarded-${Date.now()}.pdf`,
        fileSize: attachment.length,
        fileUrl: "", // Required field - will be populated after upload
        fileType: "application/pdf", // Required field
        status: "PENDING",
        documentType: "GENERAL",
        // Optional: Add source metadata if your schema supports it
        // sourceMetadata: {
        //   from,
        //   date: new Date().toISOString(),
        // },
      },
    })

    documents.push(document)
  }

  // Log the incoming email
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "DOCUMENT_RECEIVED_VIA_EMAIL",
      details: {
        from,
        subject,
        documentCount: documents.length,
      },
    },
  })

  return documents
}
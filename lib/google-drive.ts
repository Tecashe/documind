import { google } from "googleapis"

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
)

export function getGoogleAuthUrl(userId: string) {
  const scopes = ["https://www.googleapis.com/auth/drive.readonly", "https://www.googleapis.com/auth/drive.file"]

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    state: Buffer.from(JSON.stringify({ userId })).toString("base64"),
  })
}

export async function exchangeCodeForTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}

export async function uploadToDrive(accessToken: string, fileName: string, fileBuffer: Buffer, mimeType: string) {
  oauth2Client.setCredentials({ access_token: accessToken })
  const drive = google.drive({ version: "v3", auth: oauth2Client })

  const file = await drive.files.create({
    requestBody: {
      name: fileName,
      mimeType,
    },
    media: {
      mimeType,
      body: fileBuffer as any,
    },
    fields: "id,webViewLink,name,size",
  })

  return {
    id: file.data.id,
    name: file.data.name,
    url: file.data.webViewLink,
    size: file.data.size,
  }
}

export async function listDriveFiles(accessToken: string) {
  oauth2Client.setCredentials({ access_token: accessToken })
  const drive = google.drive({ version: "v3", auth: oauth2Client })

  const result = await drive.files.list({
    pageSize: 10,
    fields: "files(id,name,mimeType,createdTime,modifiedTime,size)",
    q: "mimeType='application/pdf' or mimeType='image/jpeg' or mimeType='image/png'",
  })

  return result.data.files || []
}

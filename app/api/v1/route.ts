export async function GET() {
  return new Response(
    JSON.stringify({
      version: "v1",
      baseUrl: "https://yourdomain.com/api/v1",
      endpoints: {
        documents: "/documents",
        upload: "POST /documents/upload",
        process: "POST /documents/{id}/process",
        export: "POST /documents/{id}/export",
        search: "GET /documents/search",
      },
      docs: "/api/v1/docs",
    }),
    { headers: { "Content-Type": "application/json" } },
  )
}

export async function GET() {
  const openApiSchema = {
    openapi: "3.0.0",
    info: {
      title: "Document Intelligence Platform API",
      version: "1.0.0",
      description: "Enterprise-grade document processing and OCR API",
    },
    servers: [
      {
        url: "https://yourdomain.com/api/v1",
        description: "Production API",
      },
    ],
    paths: {
      "/documents": {
        get: {
          summary: "List documents",
          tags: ["Documents"],
          parameters: [
            {
              name: "page",
              in: "query",
              schema: { type: "integer", default: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", default: 20 },
            },
            {
              name: "type",
              in: "query",
              schema: { type: "string" },
              description: "Filter by document type",
            },
            {
              name: "status",
              in: "query",
              schema: { type: "string", enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"] },
            },
          ],
          responses: {
            "200": {
              description: "List of documents",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: { type: "array" },
                      pagination: {
                        type: "object",
                        properties: {
                          page: { type: "integer" },
                          limit: { type: "integer" },
                          total: { type: "integer" },
                          pages: { type: "integer" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: "Upload documents",
          tags: ["Documents"],
          requestBody: {
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    files: {
                      type: "array",
                      items: { type: "string", format: "binary" },
                    },
                  },
                  required: ["files"],
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Documents uploaded successfully",
            },
          },
        },
      },
      "/documents/{id}/process": {
        post: {
          summary: "Process document",
          tags: ["Documents"],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Document processed",
            },
          },
        },
      },
      "/documents/{id}/export": {
        post: {
          summary: "Export document",
          tags: ["Documents"],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    format: {
                      type: "string",
                      enum: ["docx", "xlsx", "csv", "json", "pdf", "markdown"],
                    },
                  },
                  required: ["format"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Document exported",
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
        },
      },
    },
  }

  return new Response(JSON.stringify(openApiSchema), {
    headers: { "Content-Type": "application/json" },
  })
}

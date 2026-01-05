"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Check, FileText, Code, Eye } from "lucide-react"
import { useState } from "react"
import ReactMarkdown from "react-markdown"

interface ExtractedContentProps {
  document: {
    content?: {
      rawText: string
      htmlText?: string | null
      markdown?: string | null
    } | null
    confidence?: number | null
    language?: string | null
  }
}

export function ExtractedContent({ document }: ExtractedContentProps) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("formatted")

  if (!document.content?.rawText) {
    return (
      <Card className="border border-border/40 bg-card/50 backdrop-blur-sm animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No extracted text available yet</p>
        </CardContent>
      </Card>
    )
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(document.content?.rawText || "")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const wordCount = document.content.rawText.split(/\s+/).length
  const charCount = document.content.rawText.length

  return (
    <Card className="border border-border/40 bg-card/50 backdrop-blur-sm animate-fadeInUp overflow-hidden" style={{ animationDelay: "0.1s" }}>
      <CardHeader className="bg-gradient-to-r from-muted/30 to-muted/10 border-b border-border/40">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Extracted Content
            </CardTitle>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{wordCount.toLocaleString()} words</span>
              <span>•</span>
              <span>{charCount.toLocaleString()} characters</span>
              {document.confidence && (
                <>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs">
                    {(document.confidence * 100).toFixed(1)}% confidence
                  </Badge>
                </>
              )}
              {document.language && (
                <>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs">
                    {document.language.toUpperCase()}
                  </Badge>
                </>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="shadow-sm"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Text
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-border/40 bg-muted/20 px-6">
            <TabsList className="bg-transparent h-auto p-0 border-none">
              <TabsTrigger
                value="formatted"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3"
              >
                <Eye className="h-4 w-4 mr-2" />
                Formatted
              </TabsTrigger>
              <TabsTrigger
                value="raw"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3"
              >
                <Code className="h-4 w-4 mr-2" />
                Raw Text
              </TabsTrigger>
              {document.content.markdown && (
                <TabsTrigger
                  value="markdown"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Markdown
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="formatted" className="p-6 m-0">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed bg-muted/30 rounded-lg p-6 border border-border/40">
                {document.content.rawText}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="raw" className="p-6 m-0">
            <pre className="bg-muted/30 rounded-lg p-6 border border-border/40 overflow-auto max-h-[600px]">
              <code className="text-xs font-mono">{document.content.rawText}</code>
            </pre>
          </TabsContent>

          {document.content.markdown && (
            <TabsContent value="markdown" className="p-6 m-0">
              <div className="prose prose-sm max-w-none dark:prose-invert bg-muted/30 rounded-lg p-6 border border-border/40">
                <ReactMarkdown>{document.content.markdown}</ReactMarkdown>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}
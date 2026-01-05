// "use client"

// import { useState } from "react"
// import { FileUploader } from "@/components/file-uploader"
// import { ProcessingStatus } from "@/components/processing-status"
// import { ReviewDocument } from "@/components/review-document"
// import { ExportDocument } from "@/components/export-document"
// import { HistoryPanel } from "@/components/history-panel"
// import { ThemeToggle } from "@/components/theme-toggle"
// import { useDocumentHistory, type DocumentRecord } from "@/hooks/use-document-history"

// export default function Home() {
//   const [currentStep, setCurrentStep] = useState<"upload" | "processing" | "review" | "export">("upload")
//   const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
//   const [processingResults, setProcessingResults] = useState<any>(null)
//   const [error, setError] = useState<string | null>(null)
//   const [showHistory, setShowHistory] = useState(false)
//   const { history, addRecord, removeRecord, clearHistory } = useDocumentHistory()

//   const handleFilesAdded = async (files: File[]) => {
//     setUploadedFiles(files)
//     setError(null)

//     // Validate files
//     const validFiles = files.filter((file) => {
//       const size = file.size / (1024 * 1024)
//       const isValidType = ["application/pdf", "image/jpeg", "image/png"].includes(file.type)
//       const isValidSize = size <= 10

//       if (!isValidType) {
//         setError(`${file.name} is not a supported format (PDF, JPG, PNG)`)
//         return false
//       }
//       if (!isValidSize) {
//         setError(`${file.name} exceeds 10MB limit`)
//         return false
//       }
//       return true
//     })

//     if (validFiles.length > 0) {
//       setUploadedFiles(validFiles)
//       setCurrentStep("processing")
//       await processFiles(validFiles)
//     }
//   }

//   const processFiles = async (files: File[]) => {
//     const formData = new FormData()
//     files.forEach((file) => formData.append("files", file))

//     try {
//       const response = await fetch("/api/process-document", {
//         method: "POST",
//         body: formData,
//       })

//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.error || "Failed to process document")
//       }

//       const data = await response.json()
//       setProcessingResults(data)
//       setCurrentStep("review")

//       // Add to history
//       if (files.length > 0) {
//         addRecord({
//           filename: files[0].name,
//           classification: data.classification,
//           extractedText: data.extractedText,
//           size: files[0].size,
//         })
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Processing failed")
//       setCurrentStep("upload")
//     }
//   }

//   const handleLoadRecord = (record: DocumentRecord) => {
//     setProcessingResults({
//       extractedText: record.extractedText,
//       classification: record.classification,
//       files: [{ filename: record.filename, classification: record.classification }],
//     })
//     setCurrentStep("review")
//     setShowHistory(false)
//   }

//   const handleExport = (format: "docx" | "xlsx") => {
//     setCurrentStep("export")
//   }

//   const handleReset = () => {
//     setCurrentStep("upload")
//     setUploadedFiles([])
//     setProcessingResults(null)
//     setError(null)
//   }

//   return (
//     <main className="min-h-screen bg-gradient-to-br from-background to-muted">
//       <div className="container mx-auto px-4 py-12 max-w-4xl">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-12">
//           <div className="flex-1">
//             <h1 className="text-4xl font-bold mb-2 text-foreground">Document Scanner</h1>
//             <p className="text-muted-foreground">Convert documents to editable text with AI-powered OCR</p>
//           </div>
//           <ThemeToggle />
//         </div>

//         {/* Progress indicator */}
//         <div className="flex justify-center gap-2 mb-12">
//           {["upload", "processing", "review", "export"].map((step, index) => (
//             <div key={step} className="flex items-center">
//               <div
//                 className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
//                   currentStep === step
//                     ? "bg-primary text-primary-foreground"
//                     : ["upload", "processing", "review"].indexOf(currentStep) > index
//                       ? "bg-emerald-500 text-white"
//                       : "bg-muted text-muted-foreground"
//                 }`}
//               >
//                 {index + 1}
//               </div>
//               {index < 3 && <div className="w-8 h-0.5 bg-border ml-2 mr-2" />}
//             </div>
//           ))}
//         </div>

//         {/* Error message */}
//         {error && (
//           <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
//             {error}
//           </div>
//         )}

//         {/* Content */}
//         {currentStep === "upload" && (
//           <div className="space-y-6">
//             <FileUploader onFilesAdded={handleFilesAdded} />
//             {history.length > 0 && (
//               <div>
//                 <button
//                   onClick={() => setShowHistory(!showHistory)}
//                   className="text-sm text-primary hover:underline font-medium"
//                 >
//                   {showHistory ? "Hide" : "Show"} History ({history.length})
//                 </button>
//                 {showHistory && (
//                   <div className="mt-4">
//                     <HistoryPanel history={history} onRemove={removeRecord} onLoadRecord={handleLoadRecord} />
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         )}

//         {currentStep === "processing" && <ProcessingStatus files={uploadedFiles} />}

//         {currentStep === "review" && processingResults && (
//           <ReviewDocument results={processingResults} onExport={handleExport} onReset={handleReset} />
//         )}

//         {currentStep === "export" && processingResults && (
//           <ExportDocument results={processingResults} onReset={handleReset} />
//         )}
//       </div>
//     </main>
//   )
// }

// "use client"

// import { useEffect, useState } from "react"
// import { useAuth } from "@clerk/nextjs"
// import { useRouter } from "next/navigation"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { FileUp, Zap, Eye, Download, Lock, BarChart3 } from "lucide-react"

// export default function Home() {
//   const { isLoaded, isSignedIn } = useAuth()
//   const router = useRouter()
//   const [scrollY, setScrollY] = useState(0)

//   useEffect(() => {
//     const handleScroll = () => setScrollY(window.scrollY)
//     window.addEventListener("scroll", handleScroll)
//     return () => window.removeEventListener("scroll", handleScroll)
//   }, [])

//   if (isLoaded && isSignedIn) {
//     router.push("/dashboard")
//     return null
//   }

//   return (
//     <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted overflow-hidden">
//       {/* Navigation */}
//       <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-border/50">
//         <div className="container mx-auto px-4 h-16 flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
//               <FileUp className="w-5 h-5 text-primary-foreground" />
//             </div>
//             <span className="font-bold text-lg">DocScan AI</span>
//           </div>
//           <div className="flex items-center gap-4">
//             <Link href="/sign-in">
//               <Button variant="ghost">Sign In</Button>
//             </Link>
//             <Link href="/sign-up">
//               <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">Get Started</Button>
//             </Link>
//           </div>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <section className="relative pt-20 pb-32 px-4 overflow-hidden">
//         <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
//         <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10 animate-pulse" />

//         <div className="container mx-auto max-w-4xl text-center">
//           <div className="inline-block mb-6 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
//             <span className="text-sm font-medium text-primary">Powered by AI-Driven Document Intelligence</span>
//           </div>

//           <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent leading-tight">
//             Extract insights from documents instantly
//           </h1>

//           <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
//             Upload any document, invoice, receipt, or form. Our AI-powered OCR engine extracts data instantly with
//             precision and accuracy. Process thousands of documents daily.
//           </p>

//           <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
//             <Link href="/sign-up">
//               <Button
//                 size="lg"
//                 className="h-12 px-8 text-base bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/20"
//               >
//                 <FileUp className="w-5 h-5 mr-2" />
//                 Start Processing Free
//               </Button>
//             </Link>
//             <Link href="#features">
//               <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-transparent">
//                 Learn More
//               </Button>
//             </Link>
//           </div>

//           {/* Stats */}
//           <div className="grid grid-cols-3 gap-8 mb-16 py-12 border-t border-b border-border">
//             <div className="space-y-2">
//               <div className="text-3xl font-bold text-primary">99.9%</div>
//               <p className="text-sm text-muted-foreground">Accuracy Rate</p>
//             </div>
//             <div className="space-y-2">
//               <div className="text-3xl font-bold text-primary">2 seconds</div>
//               <p className="text-sm text-muted-foreground">Avg Processing Time</p>
//             </div>
//             <div className="space-y-2">
//               <div className="text-3xl font-bold text-primary">50K+</div>
//               <p className="text-sm text-muted-foreground">Documents Processed</p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section id="features" className="py-20 px-4 bg-card/30 border-y border-border">
//         <div className="container mx-auto max-w-5xl">
//           <div className="text-center mb-16">
//             <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
//             <p className="text-muted-foreground text-lg">Everything you need to process documents at scale</p>
//           </div>

//           <div className="grid md:grid-cols-2 gap-8">
//             {/* Feature 1 */}
//             <div className="glass rounded-2xl p-8 border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/10">
//               <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
//                 <Zap className="w-6 h-6 text-primary" />
//               </div>
//               <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
//               <p className="text-muted-foreground">
//                 Process documents in seconds with our optimized AI pipeline. Handle bulk uploads with ease.
//               </p>
//             </div>

//             {/* Feature 2 */}
//             <div className="glass rounded-2xl p-8 border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/10">
//               <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
//                 <Eye className="w-6 h-6 text-primary" />
//               </div>
//               <h3 className="text-xl font-semibold mb-2">AI Classification</h3>
//               <p className="text-muted-foreground">
//                 Automatic document type detection: invoices, receipts, contracts, forms, and more.
//               </p>
//             </div>

//             {/* Feature 3 */}
//             <div className="glass rounded-2xl p-8 border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/10">
//               <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
//                 <Download className="w-6 h-6 text-primary" />
//               </div>
//               <h3 className="text-xl font-semibold mb-2">Multi-Format Export</h3>
//               <p className="text-muted-foreground">
//                 Export to Word, Excel, CSV, JSON, or Markdown. Searchable PDFs with OCR layer.
//               </p>
//             </div>

//             {/* Feature 4 */}
//             <div className="glass rounded-2xl p-8 border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/10">
//               <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
//                 <Lock className="w-6 h-6 text-primary" />
//               </div>
//               <h3 className="text-xl font-semibold mb-2">Enterprise Security</h3>
//               <p className="text-muted-foreground">
//                 End-to-end encryption, GDPR compliant, SOC 2 certified. Your data is safe.
//               </p>
//             </div>

//             {/* Feature 5 */}
//             <div className="glass rounded-2xl p-8 border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/10">
//               <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
//                 <BarChart3 className="w-6 h-6 text-primary" />
//               </div>
//               <h3 className="text-xl font-semibold mb-2">Analytics & Insights</h3>
//               <p className="text-muted-foreground">
//                 Track processing metrics, extraction accuracy, and document history in real-time.
//               </p>
//             </div>

//             {/* Feature 6 */}
//             <div className="glass rounded-2xl p-8 border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/10">
//               <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
//                 <FileUp className="w-6 h-6 text-primary" />
//               </div>
//               <h3 className="text-xl font-semibold mb-2">API & Integrations</h3>
//               <p className="text-muted-foreground">
//                 REST API, Google Drive sync, email forwarding, Zapier integration for automation.
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Pricing Preview */}
//       <section className="py-20 px-4">
//         <div className="container mx-auto max-w-5xl">
//           <div className="text-center mb-16">
//             <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
//             <p className="text-muted-foreground text-lg">Choose the plan that fits your needs</p>
//           </div>

//           <div className="grid md:grid-cols-3 gap-8">
//             {/* Free Plan */}
//             <div className="rounded-2xl border border-border p-8 bg-card/50">
//               <h3 className="text-2xl font-bold mb-2">Free</h3>
//               <div className="text-4xl font-bold mb-1 text-primary">$0</div>
//               <p className="text-muted-foreground mb-6">Forever free for small teams</p>
//               <ul className="space-y-3 mb-8">
//                 <li className="flex items-center gap-2">
//                   <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">
//                     ✓
//                   </span>
//                   <span>10 documents/month</span>
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">
//                     ✓
//                   </span>
//                   <span>Basic OCR</span>
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">
//                     ✓
//                   </span>
//                   <span>Email support</span>
//                 </li>
//               </ul>
//               <Button variant="outline" className="w-full bg-transparent">
//                 Get Started
//               </Button>
//             </div>

//             {/* Pro Plan */}
//             <div className="rounded-2xl border border-primary p-8 bg-gradient-to-b from-primary/10 to-background shadow-xl relative">
//               <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 rounded-bl-lg text-sm font-semibold">
//                 Popular
//               </div>
//               <h3 className="text-2xl font-bold mb-2">Pro</h3>
//               <div className="text-4xl font-bold mb-1 text-primary">$49</div>
//               <p className="text-muted-foreground mb-6">/month, billed annually</p>
//               <ul className="space-y-3 mb-8">
//                 <li className="flex items-center gap-2">
//                   <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">
//                     ✓
//                   </span>
//                   <span>1,000 documents/month</span>
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">
//                     ✓
//                   </span>
//                   <span>Advanced OCR</span>
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">
//                     ✓
//                   </span>
//                   <span>Team collaboration</span>
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">
//                     ✓
//                   </span>
//                   <span>Priority support</span>
//                 </li>
//               </ul>
//               <Button className="w-full bg-primary hover:bg-primary/90">Start Free Trial</Button>
//             </div>

//             {/* Enterprise */}
//             <div className="rounded-2xl border border-border p-8 bg-card/50">
//               <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
//               <div className="text-4xl font-bold mb-1 text-primary">Custom</div>
//               <p className="text-muted-foreground mb-6">For large organizations</p>
//               <ul className="space-y-3 mb-8">
//                 <li className="flex items-center gap-2">
//                   <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">
//                     ✓
//                   </span>
//                   <span>Unlimited documents</span>
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">
//                     ✓
//                   </span>
//                   <span>Custom workflows</span>
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">
//                     ✓
//                   </span>
//                   <span>Dedicated support</span>
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">
//                     ✓
//                   </span>
//                   <span>SLA guarantee</span>
//                 </li>
//               </ul>
//               <Button variant="outline" className="w-full bg-transparent">
//                 Contact Sales
//               </Button>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="py-20 px-4 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-t border-b border-border">
//         <div className="container mx-auto max-w-2xl text-center">
//           <h2 className="text-4xl font-bold mb-6">Ready to transform your documents?</h2>
//           <p className="text-lg text-muted-foreground mb-8">
//             Join thousands of businesses processing documents faster, smarter, and cheaper with AI.
//           </p>
//           <Link href="/sign-up">
//             <Button
//               size="lg"
//               className="h-12 px-8 text-base bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/20"
//             >
//               Get Started Free
//             </Button>
//           </Link>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="border-t border-border py-12 px-4">
//         <div className="container mx-auto max-w-5xl">
//           <div className="grid md:grid-cols-4 gap-8 mb-8">
//             <div>
//               <h4 className="font-semibold mb-4">Product</h4>
//               <ul className="space-y-2 text-sm text-muted-foreground">
//                 <li>
//                   <Link href="#features" className="hover:text-foreground transition-colors">
//                     Features
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="#" className="hover:text-foreground transition-colors">
//                     Pricing
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="#" className="hover:text-foreground transition-colors">
//                     API Docs
//                   </Link>
//                 </li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="font-semibold mb-4">Company</h4>
//               <ul className="space-y-2 text-sm text-muted-foreground">
//                 <li>
//                   <Link href="#" className="hover:text-foreground transition-colors">
//                     About
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="#" className="hover:text-foreground transition-colors">
//                     Blog
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="#" className="hover:text-foreground transition-colors">
//                     Contact
//                   </Link>
//                 </li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="font-semibold mb-4">Legal</h4>
//               <ul className="space-y-2 text-sm text-muted-foreground">
//                 <li>
//                   <Link href="#" className="hover:text-foreground transition-colors">
//                     Privacy
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="#" className="hover:text-foreground transition-colors">
//                     Terms
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="#" className="hover:text-foreground transition-colors">
//                     Security
//                   </Link>
//                 </li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="font-semibold mb-4">Social</h4>
//               <ul className="space-y-2 text-sm text-muted-foreground">
//                 <li>
//                   <Link href="#" className="hover:text-foreground transition-colors">
//                     Twitter
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="#" className="hover:text-foreground transition-colors">
//                     GitHub
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="#" className="hover:text-foreground transition-colors">
//                     LinkedIn
//                   </Link>
//                 </li>
//               </ul>
//             </div>
//           </div>
//           <div className="border-t border-border pt-8 flex justify-between items-center text-sm text-muted-foreground">
//             <p>&copy; 2026 DocScan AI. All rights reserved.</p>
//             <p>Built with excellence for document intelligence.</p>
//           </div>
//         </div>
//       </footer>
//     </main>
//   )
// }


"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, FileText, Zap, Lock, BarChart3, Share2, Globe } from "lucide-react"

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (isLoaded && isSignedIn) {
    router.push("/dashboard")
    return null
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-navbar">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-foreground rounded-md flex items-center justify-center">
              <FileText className="w-5 h-5 text-background" />
            </div>
            <span className="font-semibold text-base tracking-tight">DocumentAI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" className="nav-link">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="btn-3d-primary h-10 px-6 text-sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 right-1/3 w-80 h-80 bg-foreground/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-foreground/3 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto max-w-5xl">
          <div className="space-y-8">
            {/* Headline */}
            <div className="space-y-6">
              <h1 className="text-7xl md:text-8xl font-bold leading-tight tracking-tight">
                Extract intelligence from any document.
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed font-light">
                Powered by advanced OCR and AI classification. Process invoices, receipts, contracts, and forms in
                seconds. Deploy at enterprise scale.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link href="/sign-up">
                <Button className="btn-3d-primary h-12 px-8 text-base gap-2 group">
                  Start Processing Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" className="h-12 px-8 text-base btn-glass bg-transparent">
                View Documentation
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-8 pt-8 border-t border-border/40">
              <div className="space-y-1">
                <div className="text-2xl font-bold">99.9%</div>
                <p className="text-xs text-muted-foreground">Accuracy Rate</p>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">2 sec</div>
                <p className="text-xs text-muted-foreground">Processing Time</p>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">100K+</div>
                <p className="text-xs text-muted-foreground">Documents</p>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">SOC 2</div>
                <p className="text-xs text-muted-foreground">Certified</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-24 px-4 border-t border-border/40">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-20">
            <h2 className="text-5xl font-bold mb-4">Designed for teams that move fast.</h2>
            <p className="text-lg text-muted-foreground max-w-2xl font-light">
              Built on proven infrastructure with enterprise-grade security and reliability.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="group border border-border/40 rounded-xl p-8 hover:border-foreground/20 transition-all duration-300">
              <div className="w-12 h-12 bg-foreground/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-foreground/15 transition-colors">
                <Zap className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Lightning Fast</h3>
              <p className="text-muted-foreground leading-relaxed">
                Process documents in under 2 seconds with our optimized pipeline. Handle thousands of uploads
                simultaneously with auto-scaling infrastructure.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group border border-border/40 rounded-xl p-8 hover:border-foreground/20 transition-all duration-300">
              <div className="w-12 h-12 bg-foreground/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-foreground/15 transition-colors">
                <FileText className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Smart Classification</h3>
              <p className="text-muted-foreground leading-relaxed">
                AI-powered detection of 20+ document types. Automatic field extraction with confidence scoring.
                Structured data ready for your systems.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group border border-border/40 rounded-xl p-8 hover:border-foreground/20 transition-all duration-300">
              <div className="w-12 h-12 bg-foreground/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-foreground/15 transition-colors">
                <Lock className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Enterprise Security</h3>
              <p className="text-muted-foreground leading-relaxed">
                End-to-end encryption at rest and in transit. GDPR, HIPAA compliant. SOC 2 Type II certified with
                automatic audit logging.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group border border-border/40 rounded-xl p-8 hover:border-foreground/20 transition-all duration-300">
              <div className="w-12 h-12 bg-foreground/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-foreground/15 transition-colors">
                <BarChart3 className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Real-Time Analytics</h3>
              <p className="text-muted-foreground leading-relaxed">
                Monitor processing metrics, accuracy rates, and extraction performance. Detailed audit logs for
                compliance and debugging.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group border border-border/40 rounded-xl p-8 hover:border-foreground/20 transition-all duration-300">
              <div className="w-12 h-12 bg-foreground/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-foreground/15 transition-colors">
                <Share2 className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Team Collaboration</h3>
              <p className="text-muted-foreground leading-relaxed">
                Share documents with fine-grained permissions. Review and approve extractions. Comment and iterate with
                your team in real-time.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group border border-border/40 rounded-xl p-8 hover:border-foreground/20 transition-all duration-300">
              <div className="w-12 h-12 bg-foreground/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-foreground/15 transition-colors">
                <Globe className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-3">API & Integrations</h3>
              <p className="text-muted-foreground leading-relaxed">
                REST API with comprehensive docs. Email forwarding. Google Drive sync. Zapier automation. Webhooks for
                custom workflows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 px-4 border-t border-border/40 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-20">
            <h2 className="text-5xl font-bold mb-4">Built for every industry.</h2>
            <p className="text-lg text-muted-foreground max-w-2xl font-light">
              From finance to healthcare, logistics to retail. DocumentAI powers document processing at scale.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Finance */}
            <div className="border border-border/40 rounded-xl p-8">
              <div className="font-mono text-sm text-muted-foreground mb-4">01</div>
              <h3 className="text-lg font-semibold mb-3">Financial Services</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Process invoices, receipts, tax forms, and bank statements. Extract line items, totals, and payment
                terms automatically.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Invoice extraction</li>
                <li>• Receipt processing</li>
                <li>• Tax document analysis</li>
                <li>• Reconciliation automation</li>
              </ul>
            </div>

            {/* Healthcare */}
            <div className="border border-border/40 rounded-xl p-8">
              <div className="font-mono text-sm text-muted-foreground mb-4">02</div>
              <h3 className="text-lg font-semibold mb-3">Healthcare</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Extract patient data from forms and medical records. HIPAA-compliant processing with automatic PII
                detection.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Patient intake forms</li>
                <li>• Medical record extraction</li>
                <li>• Insurance claim processing</li>
                <li>• PII redaction</li>
              </ul>
            </div>

            {/* Logistics */}
            <div className="border border-border/40 rounded-xl p-8">
              <div className="font-mono text-sm text-muted-foreground mb-4">03</div>
              <h3 className="text-lg font-semibold mb-3">Logistics & Supply Chain</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Process shipping documents, bills of lading, and customs forms. Real-time tracking and compliance
                verification.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Shipping label parsing</li>
                <li>• BOL extraction</li>
                <li>• Customs documentation</li>
                <li>• Compliance tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-4 border-t border-border/40">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-20">
            <h2 className="text-5xl font-bold mb-4">Transparent pricing that scales.</h2>
            <p className="text-lg text-muted-foreground max-w-2xl font-light">
              Start free. Pay as you grow. No surprises.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free */}
            <div className="border border-border/40 rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-2">Free</h3>
              <div className="mb-8">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <p className="text-muted-foreground text-sm mb-8">Perfect to get started</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm">
                  <span className="w-4 h-4 bg-foreground/20 rounded-full" />
                  10 documents/month
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="w-4 h-4 bg-foreground/20 rounded-full" />
                  Basic OCR
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="w-4 h-4 bg-foreground/20 rounded-full" />
                  Email support
                </li>
              </ul>
              <Button variant="outline" className="w-full btn-glass bg-transparent">
                Get Started
              </Button>
            </div>

            {/* Pro */}
            <div className="border border-foreground/20 rounded-xl p-8 ring-1 ring-foreground/10">
              <div className="inline-block mb-4 px-2 py-1 bg-foreground/10 text-xs font-medium rounded">Popular</div>
              <h3 className="text-xl font-semibold mb-2">Pro</h3>
              <div className="mb-8">
                <span className="text-4xl font-bold">$49</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <p className="text-muted-foreground text-sm mb-8">For growing teams</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm">
                  <span className="w-4 h-4 bg-foreground/20 rounded-full" />
                  5,000 documents/month
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="w-4 h-4 bg-foreground/20 rounded-full" />
                  Advanced OCR & AI
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="w-4 h-4 bg-foreground/20 rounded-full" />
                  Team collaboration
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="w-4 h-4 bg-foreground/20 rounded-full" />
                  API access
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="w-4 h-4 bg-foreground/20 rounded-full" />
                  Priority support
                </li>
              </ul>
              <Button className="btn-3d-primary w-full">Start Free Trial</Button>
            </div>

            {/* Enterprise */}
            <div className="border border-border/40 rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
              <div className="mb-8">
                <span className="text-4xl font-bold">Custom</span>
              </div>
              <p className="text-muted-foreground text-sm mb-8">For large organizations</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm">
                  <span className="w-4 h-4 bg-foreground/20 rounded-full" />
                  Unlimited documents
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="w-4 h-4 bg-foreground/20 rounded-full" />
                  Dedicated infrastructure
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="w-4 h-4 bg-foreground/20 rounded-full" />
                  Custom integrations
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="w-4 h-4 bg-foreground/20 rounded-full" />
                  SLA guarantee
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="w-4 h-4 bg-foreground/20 rounded-full" />
                  Dedicated support
                </li>
              </ul>
              <Button variant="outline" className="w-full btn-glass bg-transparent">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 border-t border-border/40">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-5xl font-bold mb-6">Start extracting intelligence today.</h2>
          <p className="text-lg text-muted-foreground mb-10 font-light">
            Join thousands of teams processing documents faster with AI.
          </p>
          <Link href="/sign-up">
            <Button className="btn-3d-primary h-12 px-8 text-base gap-2 group">
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            <div>
              <h4 className="font-semibold text-sm mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-foreground transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    API Docs
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Docs
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Guides
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    API Reference
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Follow</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    GitHub
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    LinkedIn
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 pt-8 flex justify-between items-center text-xs text-muted-foreground">
            <p>&copy; 2026 DocumentAI. All rights reserved.</p>
            <p>Built with care for document intelligence.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

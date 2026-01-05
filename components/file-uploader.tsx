// "use client"

// import type React from "react"

// import { useRef, useState } from "react"
// import { Upload, X, Loader } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Card } from "@/components/ui/card"

// interface FileUploaderProps {
//   onFilesAdded: (files: File[]) => void
// }

// export function FileUploader({ onFilesAdded }: FileUploaderProps) {
//   const [dragActive, setDragActive] = useState(false)
//   const [selectedFiles, setSelectedFiles] = useState<File[]>([])
//   const [isUploading, setIsUploading] = useState(false)
//   const inputRef = useRef<HTMLInputElement>(null)

//   const handleDrag = (e: React.DragEvent) => {
//     e.preventDefault()
//     e.stopPropagation()
//     if (e.type === "dragenter" || e.type === "dragover") {
//       setDragActive(true)
//     } else if (e.type === "dragleave") {
//       setDragActive(false)
//     }
//   }

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault()
//     e.stopPropagation()
//     setDragActive(false)

//     const files = Array.from(e.dataTransfer.files)
//     handleFiles(files)
//   }

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(e.target.files || [])
//     handleFiles(files)
//   }

//   const handleFiles = (files: File[]) => {
//     const newFiles = [...selectedFiles, ...files]
//     setSelectedFiles(newFiles)
//   }

//   const removeFile = (index: number) => {
//     setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
//   }

//   const handleUpload = async () => {
//     if (selectedFiles.length > 0) {
//       setIsUploading(true)
//       try {
//         await onFilesAdded(selectedFiles)
//         setSelectedFiles([])
//       } finally {
//         setIsUploading(false)
//       }
//     }
//   }

//   return (
//     <div className="space-y-6">
//       <Card
//         className={`border-2 border-dashed transition-smooth ${dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"} p-8 animate-fadeInUp`}
//       >
//         <div
//           onDragEnter={handleDrag}
//           onDragLeave={handleDrag}
//           onDragOver={handleDrag}
//           onDrop={handleDrop}
//           className="text-center"
//         >
//           <div className={`transition-transform ${dragActive ? "scale-110" : "scale-100"}`}>
//             <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
//           </div>
//           <p className="text-lg font-semibold mb-2">Drag and drop your documents</p>
//           <p className="text-sm text-muted-foreground mb-6">
//             or click below to select files (PDF, JPG, PNG, TIFF, HEIC - max 50MB total)
//           </p>
//           <Button onClick={() => inputRef.current?.click()} variant="outline">
//             Select Files
//           </Button>
//           <input
//             ref={inputRef}
//             type="file"
//             multiple
//             onChange={handleChange}
//             accept=".pdf,.jpg,.jpeg,.png,.tiff,.heic"
//             className="hidden"
//           />
//         </div>
//       </Card>

//       {selectedFiles.length > 0 && (
//         <Card className="p-6 animate-slideInRight">
//           <h3 className="font-semibold mb-4">Selected Files ({selectedFiles.length})</h3>
//           <div className="space-y-2 max-h-48 overflow-y-auto">
//             {selectedFiles.map((file, index) => (
//               <div
//                 key={index}
//                 className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
//               >
//                 <div className="flex-1">
//                   <p className="font-medium text-sm truncate">{file.name}</p>
//                   <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
//                 </div>
//                 <button onClick={() => removeFile(index)} className="p-1 hover:bg-muted rounded transition-colors">
//                   <X className="h-4 w-4" />
//                 </button>
//               </div>
//             ))}
//           </div>
//         </Card>
//       )}

//       {selectedFiles.length > 0 && (
//         <Button onClick={handleUpload} disabled={isUploading} size="lg" className="w-full animate-scaleIn">
//           {isUploading ? (
//             <>
//               <Loader className="w-4 h-4 mr-2 animate-spin" />
//               Processing {selectedFiles.length} {selectedFiles.length === 1 ? "File" : "Files"}...
//             </>
//           ) : (
//             `Process ${selectedFiles.length} ${selectedFiles.length === 1 ? "File" : "Files"}`
//           )}
//         </Button>
//       )}
//     </div>
//   )
// }

"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, File, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface FileUploaderProps {
  onFilesAdded?: (files: File[]) => void
}

export function FileUploader({ onFilesAdded }: FileUploaderProps) {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".jpg", ".jpeg", ".png", ".tiff", ".heic"],
    },
  })

  const handleUpload = async () => {
    if (files.length === 0) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      files.forEach((file) => formData.append("files", file))

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      setFiles([])
      router.refresh() // Refresh to show new documents
    } catch (error) {
      console.error("Upload error:", error)
      alert("Upload failed. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <Card
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed p-8 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary"
        )}
      >
        <input {...getInputProps()} />
        <Upload size={32} className="mx-auto mb-2 text-muted-foreground" />
        <h3 className="font-semibold">Drag documents here or click to select</h3>
        <p className="text-sm text-muted-foreground mt-1">Supports PDF, JPG, PNG, TIFF (up to 100MB each)</p>
      </Card>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold">Selected Files ({files.length})</h4>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <File size={18} className="text-muted-foreground" />
                  <div className="text-sm">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                  <X size={18} />
                </Button>
              </div>
            ))}
          </div>

          <Button onClick={handleUpload} disabled={isUploading} className="w-full" size="lg">
            {isUploading ? "Uploading & Processing..." : `Upload ${files.length} File${files.length > 1 ? "s" : ""}`}
          </Button>
        </div>
      )}
    </div>
  )
}
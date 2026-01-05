// "use client"

// import { useRef, useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Card } from "@/components/ui/card"
// import { Camera, X, Upload } from "lucide-react"

// export function CameraCapture() {
//   const videoRef = useRef<HTMLVideoElement>(null)
//   const canvasRef = useRef<HTMLCanvasElement>(null)
//   const [isCameraActive, setIsCameraActive] = useState(false)
//   const [capturedImage, setCapturedImage] = useState<string | null>(null)

//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
//         audio: false,
//       })

//       if (videoRef.current) {
//         videoRef.current.srcObject = stream
//         setIsCameraActive(true)
//       }
//     } catch (error) {
//       console.error("Camera access denied:", error)
//       alert("Please allow camera access to use this feature")
//     }
//   }

//   const stopCamera = () => {
//     if (videoRef.current?.srcObject) {
//       const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
//       tracks.forEach((track) => track.stop())
//       setIsCameraActive(false)
//     }
//   }

//   const capturePhoto = () => {
//     if (videoRef.current && canvasRef.current) {
//       const context = canvasRef.current.getContext("2d")
//       if (context) {
//         context.drawImage(videoRef.current, 0, 0)
//         const imageUrl = canvasRef.current.toDataURL("image/jpeg")
//         setCapturedImage(imageUrl)
//         stopCamera()
//       }
//     }
//   }

 
//   const uploadCapture = async () => {
//   if (capturedImage) {
//     try {
//       const blob = await fetch(capturedImage).then((res) => res.blob())
//       const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" })
      
//       const formData = new FormData()
//       formData.append("files", file)

//       const response = await fetch("/api/documents/upload", {
//         method: "POST",
//         body: formData,
//       })

//       if (!response.ok) throw new Error("Upload failed")

//       setCapturedImage(null)
//       window.location.reload() // Refresh to show new document
//     } catch (error) {
//       console.error("Upload error:", error)
//       alert("Upload failed. Please try again.")
//     }
//   }
// }

//   const retake = () => {
//     setCapturedImage(null)
//     startCamera()
//   }

//   return (
//     <Card className="p-6">
//       <div className="space-y-4">
//         {!isCameraActive && !capturedImage && (
//           <Button onClick={startCamera} className="w-full" size="lg">
//             <Camera className="w-4 h-4 mr-2" />
//             Open Camera
//           </Button>
//         )}

//         {isCameraActive && (
//           <div className="space-y-4">
//             <div className="relative bg-black rounded-lg overflow-hidden">
//               <video ref={videoRef} autoPlay playsInline className="w-full aspect-video object-cover" />
//               <div className="absolute inset-0 border-4 border-yellow-400/50 rounded-lg pointer-events-none" />
//             </div>

//             <div className="flex gap-2">
//               <Button onClick={capturePhoto} variant="default" className="flex-1">
//                 Capture
//               </Button>
//               <Button onClick={stopCamera} variant="outline" size="icon">
//                 <X className="w-4 h-4" />
//               </Button>
//             </div>
//           </div>
//         )}

//         {capturedImage && (
//           <div className="space-y-4">
//             <div className="relative bg-muted rounded-lg overflow-hidden">
//               <img
//                 src={capturedImage || "/placeholder.svg"}
//                 alt="Captured"
//                 className="w-full aspect-video object-cover"
//               />
//             </div>

//             <div className="flex gap-2">
//               <Button onClick={uploadCapture} className="flex-1">
//                 <Upload className="w-4 h-4 mr-2" />
//                 Process
//               </Button>
//               <Button onClick={retake} variant="outline" className="flex-1 bg-transparent">
//                 Retake
//               </Button>
//             </div>
//           </div>
//         )}
//       </div>

//       <canvas ref={canvasRef} className="hidden" width={1280} height={720} />
//     </Card>
//   )
// }

"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Camera, X, Upload } from "lucide-react"
import { toast } from "sonner"

export function CameraCapture() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraActive(true)
      }
    } catch (error) {
      console.error("Camera access denied:", error)
      toast.error("Camera access denied. Please allow camera permissions.")
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      setIsCameraActive(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d")
      if (context) {
        context.drawImage(videoRef.current, 0, 0)
        const imageUrl = canvasRef.current.toDataURL("image/jpeg")
        setCapturedImage(imageUrl)
        stopCamera()
      }
    }
  }

  const uploadCapture = async () => {
    if (!capturedImage) return

    setIsUploading(true)
    const toastId = toast.loading("Uploading captured image...")

    try {
      const blob = await fetch(capturedImage).then((res) => res.blob())
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" })

      const formData = new FormData()
      formData.append("files", file)

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Upload failed")
      }

      setCapturedImage(null)
      toast.success("Image uploaded successfully! Processing started.", { id: toastId })
      window.location.reload()
    } catch (error) {
      console.error("Upload error:", error)
      toast.error(error instanceof Error ? error.message : "Upload failed", { id: toastId })
    } finally {
      setIsUploading(false)
    }
  }

  const retake = () => {
    setCapturedImage(null)
    startCamera()
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {!isCameraActive && !capturedImage && (
          <Button onClick={startCamera} className="w-full" size="lg">
            <Camera className="w-4 h-4 mr-2" />
            Open Camera
          </Button>
        )}

        {isCameraActive && (
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video ref={videoRef} autoPlay playsInline className="w-full aspect-video object-cover" />
              <div className="absolute inset-0 border-4 border-yellow-400/50 rounded-lg pointer-events-none" />
            </div>

            <div className="flex gap-2">
              <Button onClick={capturePhoto} variant="default" className="flex-1">
                Capture
              </Button>
              <Button onClick={stopCamera} variant="outline" size="icon">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {capturedImage && (
          <div className="space-y-4">
            <div className="relative bg-muted rounded-lg overflow-hidden">
              <img
                src={capturedImage || "/placeholder.svg"}
                alt="Captured"
                className="w-full aspect-video object-cover"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={uploadCapture} className="flex-1" disabled={isUploading}>
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? "Uploading..." : "Process"}
              </Button>
              <Button onClick={retake} variant="outline" className="flex-1 bg-transparent" disabled={isUploading}>
                Retake
              </Button>
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" width={1280} height={720} />
    </Card>
  )
}

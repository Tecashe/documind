"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Folder, FileText, MoreVertical, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface FolderData {
  id: string
  name: string
  documents: number
  subfolders: number
  modified: string
}

export default function FoldersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [folders, setFolders] = useState<FolderData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFolders()
  }, [])

  const fetchFolders = async () => {
    try {
      const res = await fetch("/api/folders")
      const data = await res.json()
      setFolders(data || [])
    } catch (error) {
      console.error("[v0] Failed to fetch folders:", error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = folders.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" size={32} />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Folders</h1>
          <p className="text-muted-foreground mt-1">Organize your documents with folders</p>
        </div>
        <Button className="gap-2">
          <Plus size={18} />
          New Folder
        </Button>
      </div>

      <div className="max-w-md">
        <Input placeholder="Search folders..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Folder size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">No folders yet. Create one to organize your documents.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((folder) => (
            <Card key={folder.id} className="hover:border-primary transition-colors">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex items-start gap-3 flex-1">
                  <Folder size={24} className="text-primary mt-1 flex-shrink-0" />
                  <div>
                    <CardTitle>{folder.name}</CardTitle>
                    <CardDescription>Modified {new Date(folder.modified).toLocaleDateString()}</CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical size={18} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Rename</DropdownMenuItem>
                    <DropdownMenuItem>Share</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Documents</p>
                    <p className="font-semibold flex items-center gap-1">
                      <FileText size={16} />
                      {folder.documents}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Subfolders</p>
                    <p className="font-semibold flex items-center gap-1">
                      <Folder size={16} />
                      {folder.subfolders}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

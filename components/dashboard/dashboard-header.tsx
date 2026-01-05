import type { User } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

interface DashboardHeaderProps {
  user: User
}
//
export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {user.firstName}</h1>
        <p className="text-muted-foreground mt-1">Manage and process your documents</p>
      </div>
      <Button size="lg">
        <Upload size={18} />
        Upload Document
      </Button>
    </div>
  )
}

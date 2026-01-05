import { Card } from "@/components/ui/card"
import { FileText, CheckCircle, Clock, Zap } from "lucide-react"

interface StatsCardProps {
  stats: {
    totalDocuments: number
    processed: number
    pending: number
    credits: number
  }
}

export function StatsCards({ stats }: StatsCardProps) {
  const items = [
    {
      icon: FileText,
      label: "Total Documents",
      value: stats.totalDocuments,
      color: "text-blue-500",
    },
    {
      icon: CheckCircle,
      label: "Processed",
      value: stats.processed,
      color: "text-green-500",
    },
    {
      icon: Clock,
      label: "Pending",
      value: stats.pending,
      color: "text-yellow-500",
    },
    {
      icon: Zap,
      label: "Credits Available",
      value: stats.credits,
      color: "text-purple-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, index) => {
        const Icon = item.icon
        return (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-bold mt-1">{item.value}</p>
              </div>
              <Icon className={`${item.color} w-8 h-8`} />
            </div>
          </Card>
        )
      })}
    </div>
  )
}

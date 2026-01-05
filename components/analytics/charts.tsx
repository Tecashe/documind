"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface AnalyticsChartsProps {
  stats: {
    totalDocuments: number
    byStatus: Record<string, number>
    byType: Record<string, number>
    averageProcessingTime: number
    creditsUsed: number
  }
}

export function AnalyticsCharts({ stats }: AnalyticsChartsProps) {
  const statusData = Object.entries(stats.byStatus).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }))

  const typeData = Object.entries(stats.byType).map(([name, value]) => ({
    name,
    value,
  }))

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Documents by Status</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {statusData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Documents by Type</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={typeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Stats Overview</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Documents</p>
            <p className="text-2xl font-bold">{stats.totalDocuments}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Avg Processing Time</p>
            <p className="text-2xl font-bold">{stats.averageProcessingTime.toFixed(1)}s</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Credits Used</p>
            <p className="text-2xl font-bold">{stats.creditsUsed}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

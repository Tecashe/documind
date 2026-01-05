"use client"

import { Card } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"

interface AuditLogsProps {
  logs: any[]
}

export function AuditLogs({ logs }: AuditLogsProps) {
  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Recent Activity</h3>

      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-center justify-between p-3 bg-muted rounded-lg text-sm">
              <div className="flex-1">
                <p className="font-medium">{log.action}</p>
                {log.document && <p className="text-xs text-muted-foreground">{log.document.title}</p>}
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}

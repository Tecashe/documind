"use client"

import { Card } from "@/components/ui/card"
import { EmailForwarding } from "@/components/email-forwarding"
import { GoogleDriveIntegration } from "@/components/integrations/google-drive-integration"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface IntegrationSettingsProps {
  userId: string
}

export function IntegrationSettings({ userId }: IntegrationSettingsProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Connected Integrations</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Connect third-party services to enhance your document processing workflow.
        </p>

        <Tabs defaultValue="email" className="space-y-4">
          <TabsList>
            <TabsTrigger value="email">Email Forwarding</TabsTrigger>
            <TabsTrigger value="drive">Google Drive</TabsTrigger>
          </TabsList>

          <TabsContent value="email">
            <EmailForwarding />
          </TabsContent>

          <TabsContent value="drive">
            <GoogleDriveIntegration />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

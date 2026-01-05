import { getUser } from "@/lib/auth"
import { PricingPlans } from "@/components/settings/pricing-plans"
import { AccountSettings } from "@/components/settings/account-settings"
import { IntegrationSettings } from "@/components/settings/integration-settings"
import { SecuritySettings } from "@/components/settings/security-settings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function SettingsPage() {
  const user = await getUser()
  if (!user) {
    return null
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl animate-fadeInUp">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account, billing, and integrations</p>
      </div>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <AccountSettings user={user} />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationSettings userId={user.id} />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettings userId={user.id} />
        </TabsContent>

        <TabsContent value="billing">
          <PricingPlans currentPlan={user.plan} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

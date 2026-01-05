"use client"

import type { User } from "@prisma/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface AccountSettingsProps {
  user: User
}
//
export function AccountSettings({ user }: AccountSettingsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email,
  })

  const handleSave = async () => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Update failed")

      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="font-semibold mb-4">Profile Information</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">First Name</label>
              <Input
                disabled={!isEditing}
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Last Name</label>
              <Input
                disabled={!isEditing}
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <Input disabled value={formData.email} />
            <p className="text-xs text-muted-foreground mt-1">Contact support to change your email</p>
          </div>

          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            ) : (
              <>
                <Button onClick={handleSave}>Save Changes</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-semibold mb-4">Credits & Usage</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Available Credits</span>
            <span className="font-bold text-lg">{user.credits}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full"
              style={{ width: `${Math.min((user.credits / 1000) * 100, 100)}%` }}
            />
          </div>
          <Button variant="outline" className="w-full bg-transparent">
            Buy More Credits
          </Button>
        </div>
      </div>
    </Card>
  )
}

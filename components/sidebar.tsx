"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SignOutButton, useUser } from "@clerk/nextjs"
import { BarChart3, FileText, Folder, Settings, LogOut, Menu, X, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useUser()

  const menuItems = [
    {
      icon: FileText,
      label: "Documents",
      href: "/dashboard",
    },
    {
      icon: BarChart3,
      label: "Analytics",
      href: "/dashboard/analytics",
    },
    {
      icon: Folder,
      label: "Folders",
      href: "/dashboard/folders",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/dashboard/settings",
    },
  ]

  return (
    <>
      {/* Mobile Toggle */}
      <button onClick={() => setIsOpen(!isOpen)} className="fixed top-4 left-4 z-50 lg:hidden">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "w-64 bg-card border-r border-border transition-all duration-300 flex flex-col",
          isOpen ? "block" : "hidden lg:block",
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">D</div>
            <span>DocIntelligence</span>
          </Link>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
                )}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Upload Button */}
        <div className="p-4 border-t border-border space-y-4">
          <Button className="w-full" size="lg">
            <Upload size={18} />
            Upload Document
          </Button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={user?.imageUrl || "/placeholder.svg"}
              alt={user?.fullName || "User"}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate text-sm">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>

          <SignOutButton>
            <Button variant="ghost" className="w-full justify-start text-destructive">
              <LogOut size={18} />
              Sign Out
            </Button>
          </SignOutButton>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}

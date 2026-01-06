// "use client"

// import { useUser } from "@clerk/nextjs"
// import { Bell, Search } from "lucide-react"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"

// export function TopNav() {
//   const { user } = useUser()

//   return (
//     <div className="border-b border-border bg-card">
//       <div className="flex items-center justify-between p-4 gap-4">
//         <div className="flex-1 max-w-md">
//           <div className="relative">
//             <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
//             <Input placeholder="Search documents..." className="pl-10" />
//           </div>
//         </div>

//         <div className="flex items-center gap-4">
//           <Button variant="ghost" size="icon">
//             <Bell size={20} />
//           </Button>
//         </div>
//       </div>
//     </div>
//   )
// }

// "use client"

// import { useUser } from "@clerk/nextjs"
// import { Bell, Search, ChevronRight, MoreVertical } from "lucide-react"
// import { usePathname } from "next/navigation"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"

// export function TopNav() {
//   const { user } = useUser()
//   const pathname = usePathname()

//   const getBreadcrumbs = () => {
//     const segments = pathname.split("/").filter(Boolean)
//     const breadcrumbs = [{ label: "Dashboard", href: "/dashboard" }]

//     let path = "/dashboard"
//     for (const segment of segments.slice(1)) {
//       path += `/${segment}`
//       const label = segment.charAt(0).toUpperCase() + segment.slice(1)
//       breadcrumbs.push({ label, href: path })
//     }

//     return breadcrumbs
//   }

//   const breadcrumbs = getBreadcrumbs()

//   return (
//     <div className="border-b border-border bg-card">
//       <div className="flex items-center justify-between p-4 gap-4">
//         {/* Left: Breadcrumbs and Search */}
//         <div className="flex-1 flex flex-col gap-3">
//           {/* Breadcrumb Navigation */}
//           <div className="flex items-center gap-1 text-sm text-muted-foreground">
//             {breadcrumbs.map((crumb, idx) => (
//               <div key={crumb.href} className="flex items-center gap-1">
//                 <a href={crumb.href} className="hover:text-foreground transition-colors">
//                   {crumb.label}
//                 </a>
//                 {idx < breadcrumbs.length - 1 && <ChevronRight size={16} />}
//               </div>
//             ))}
//           </div>

//           {/* Search Bar */}
//           <div className="max-w-md">
//             <div className="relative">
//               <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
//               <Input placeholder="Search documents, folders..." className="pl-10 h-10 text-sm" />
//             </div>
//           </div>
//         </div>

//         {/* Right: Actions */}
//         <div className="flex items-center gap-2">
//           {/* Quick Actions Dropdown */}
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="outline" size="sm">
//                 <span className="text-sm">+ New</span>
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="w-48">
//               <DropdownMenuItem>
//                 <span>New Document</span>
//               </DropdownMenuItem>
//               <DropdownMenuItem>
//                 <span>New Folder</span>
//               </DropdownMenuItem>
//               <DropdownMenuItem>
//                 <span>New Template</span>
//               </DropdownMenuItem>
//               <DropdownMenuItem>
//                 <span>New Workspace</span>
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>

//           {/* Notifications */}
//           <Button variant="ghost" size="icon" className="relative">
//             <Bell size={20} />
//             <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
//           </Button>

//           {/* User Menu */}
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" size="icon">
//                 <MoreVertical size={20} />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="w-48">
//               <div className="px-2 py-1.5 text-sm">
//                 <p className="font-medium">{user?.fullName}</p>
//                 <p className="text-xs text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
//               </div>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem>
//                 <span>Profile Settings</span>
//               </DropdownMenuItem>
//               <DropdownMenuItem>
//                 <span>Preferences</span>
//               </DropdownMenuItem>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem className="text-destructive">
//                 <span>Sign Out</span>
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </div>
//     </div>
//   )
// }


"use client"

import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { Bell, Search, ChevronRight, MoreVertical, Zap } from "lucide-react"
import { usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function TopNav() {
  const { user } = useUser()
  const pathname = usePathname()
  const [credits, setCredits] = useState<number | null>(null)

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const res = await fetch("/api/user/credits")
        const data = await res.json()
        setCredits(data.credits)
      } catch (error) {
        console.error("[v0] Failed to fetch credits:", error)
      }
    }
    fetchCredits()
  }, [])

  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean)
    const breadcrumbs = [{ label: "Dashboard", href: "/dashboard" }]

    let path = "/dashboard"
    for (const segment of segments.slice(1)) {
      path += `/${segment}`
      const label = segment.charAt(0).toUpperCase() + segment.slice(1)
      breadcrumbs.push({ label, href: path })
    }

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <div className="border-b border-border bg-card">
      <div className="flex items-center justify-between p-4 gap-4">
        {/* Left: Breadcrumbs and Search */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, idx) => (
              <div key={crumb.href} className="flex items-center gap-1">
                <a href={crumb.href} className="hover:text-foreground transition-colors">
                  {crumb.label}
                </a>
                {idx < breadcrumbs.length - 1 && <ChevronRight size={16} />}
              </div>
            ))}
          </div>

          {/* Search Bar */}
          <div className="max-w-md">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search documents, folders..." className="pl-10 h-10 text-sm" />
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {credits !== null && (
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <a href="/dashboard/settings?tab=billing">
                <Zap size={16} className="text-yellow-500" />
                <span className="text-sm font-medium">{credits} credits</span>
              </a>
            </Button>
          )}

          {/* Quick Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <span className="text-sm">+ New</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <span>New Document</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>New Folder</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>New Template</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>New Workspace</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5 text-sm">
                <p className="font-medium">{user?.fullName}</p>
                <p className="text-xs text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Preferences</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

// "use client"

// import { useState } from "react"
// import Link from "next/link"
// import { usePathname } from "next/navigation"
// import { SignOutButton, useUser } from "@clerk/nextjs"
// import { BarChart3, FileText, Folder, Settings, LogOut, Menu, X, Upload } from "lucide-react"
// import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button"

// export function Sidebar() {
//   const [isOpen, setIsOpen] = useState(false)
//   const pathname = usePathname()
//   const { user } = useUser()

//   const menuItems = [
//     {
//       icon: FileText,
//       label: "Documents",
//       href: "/dashboard",
//     },
//     {
//       icon: BarChart3,
//       label: "Analytics",
//       href: "/dashboard/analytics",
//     },
//     {
//       icon: Folder,
//       label: "Folders",
//       href: "/dashboard/folders",
//     },
//     {
//       icon: Settings,
//       label: "Settings",
//       href: "/dashboard/settings",
//     },
//   ]

//   return (
//     <>
//       {/* Mobile Toggle */}
//       <button onClick={() => setIsOpen(!isOpen)} className="fixed top-4 left-4 z-50 lg:hidden">
//         {isOpen ? <X size={24} /> : <Menu size={24} />}
//       </button>

//       {/* Sidebar */}
//       <aside
//         className={cn(
//           "w-64 bg-card border-r border-border transition-all duration-300 flex flex-col",
//           isOpen ? "block" : "hidden lg:block",
//         )}
//       >
//         {/* Logo */}
//         <div className="p-6 border-b border-border">
//           <Link href="/" className="flex items-center gap-2 font-bold text-xl">
//             <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">D</div>
//             <span>DocIntelligence</span>
//           </Link>
//         </div>

//         {/* Menu Items */}
//         <nav className="flex-1 p-4 space-y-2">
//           {menuItems.map((item) => {
//             const Icon = item.icon
//             const isActive = pathname === item.href

//             return (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 className={cn(
//                   "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors",
//                   isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
//                 )}
//               >
//                 <Icon size={20} />
//                 <span>{item.label}</span>
//               </Link>
//             )
//           })}
//         </nav>

//         {/* Upload Button */}
//         <div className="p-4 border-t border-border space-y-4">
//           <Button className="w-full" size="lg">
//             <Upload size={18} />
//             Upload Document
//           </Button>
//         </div>

//         {/* User Profile */}
//         <div className="p-4 border-t border-border">
//           <div className="flex items-center gap-3 mb-4">
//             <img
//               src={user?.imageUrl || "/placeholder.svg"}
//               alt={user?.fullName || "User"}
//               className="w-10 h-10 rounded-full"
//             />
//             <div className="flex-1 min-w-0">
//               <p className="font-medium truncate text-sm">{user?.fullName}</p>
//               <p className="text-xs text-muted-foreground truncate">{user?.primaryEmailAddress?.emailAddress}</p>
//             </div>
//           </div>

//           <SignOutButton>
//             <Button variant="ghost" className="w-full justify-start text-destructive">
//               <LogOut size={18} />
//               Sign Out
//             </Button>
//           </SignOutButton>
//         </div>
//       </aside>

//       {/* Mobile Overlay */}
//       {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />}
//     </>
//   )
// }


// "use client"

// import { useState } from "react"
// import Link from "next/link"
// import { usePathname } from "next/navigation"
// import { SignOutButton, useUser } from "@clerk/nextjs"
// import { BarChart3, FileText, Folder, Settings, LogOut, Menu, X, Upload, Briefcase, Layout } from "lucide-react"
// import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button"

// export function Sidebar() {
//   const [isOpen, setIsOpen] = useState(false)
//   const [isCollapsed, setIsCollapsed] = useState(false)
//   const pathname = usePathname()
//   const { user } = useUser()

//   const menuItems = [
//     {
//       icon: FileText,
//       label: "Documents",
//       href: "/dashboard",
//     },
//     {
//       icon: Folder,
//       label: "Folders",
//       href: "/dashboard/folders",
//     },
//     {
//       icon: Layout,
//       label: "Templates",
//       href: "/dashboard/templates",
//     },
//     {
//       icon: Briefcase,
//       label: "Workspaces",
//       href: "/dashboard/workspaces",
//     },
//     {
//       icon: BarChart3,
//       label: "Analytics",
//       href: "/dashboard/analytics",
//     },
//     {
//       icon: Settings,
//       label: "Settings",
//       href: "/dashboard/settings",
//     },
//   ]

//   const handleNavClick = () => {
//     if (isOpen) {
//       setIsOpen(false)
//     }
//   }

//   return (
//     <>
//       {/* Mobile Toggle Button */}
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="fixed top-4 left-4 z-50 lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
//       >
//         {isOpen ? <X size={24} /> : <Menu size={24} />}
//       </button>

//       {/* Sidebar */}
//       <aside
//         className={cn(
//           "bg-card border-r border-border transition-all duration-300 flex flex-col h-screen sticky top-0",
//           isCollapsed ? "w-20" : "w-64",
//           isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
//         )}
//       >
//         {/* Logo Section */}
//         <div className="p-6 border-b border-border flex items-center justify-between">
//           {!isCollapsed && (
//             <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity">
//               <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-sm font-bold">
//                 D
//               </div>
//               <span>DocIntel</span>
//             </Link>
//           )}
//           <button
//             onClick={() => setIsCollapsed(!isCollapsed)}
//             className="hidden lg:block p-1 hover:bg-muted rounded transition-colors"
//             aria-label="Toggle sidebar"
//           >
//             <X size={18} />
//           </button>
//         </div>

//         {/* Menu Items */}
//         <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
//           {menuItems.map((item) => {
//             const Icon = item.icon
//             const isActive = pathname === item.href

//             return (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 onClick={handleNavClick}
//                 className={cn(
//                   "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
//                   isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground hover:bg-muted",
//                   isCollapsed && "justify-center px-0",
//                 )}
//                 title={isCollapsed ? item.label : ""}
//               >
//                 <Icon size={20} className="flex-shrink-0" />
//                 {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
//               </Link>
//             )
//           })}
//         </nav>

//         {/* Upload Button */}
//         <div className="p-4 border-t border-border space-y-4">
//           <Button className={cn("w-full", isCollapsed && "p-2")} size={isCollapsed ? "icon" : "lg"}>
//             <Upload size={18} />
//             {!isCollapsed && <span>Upload</span>}
//           </Button>
//         </div>

//         {/* User Profile Section */}
//         <div className="p-4 border-t border-border">
//           <div className={cn("flex items-center gap-3 mb-4", isCollapsed && "justify-center")}>
//             <img
//               src={user?.imageUrl || "/placeholder.svg"}
//               alt={user?.fullName || "User"}
//               className="w-10 h-10 rounded-full flex-shrink-0"
//             />
//             {!isCollapsed && (
//               <div className="flex-1 min-w-0">
//                 <p className="font-medium truncate text-sm">{user?.fullName}</p>
//                 <p className="text-xs text-muted-foreground truncate">{user?.primaryEmailAddress?.emailAddress}</p>
//               </div>
//             )}
//           </div>

//           {!isCollapsed && (
//             <SignOutButton>
//               <Button variant="ghost" className="w-full justify-start text-destructive text-sm" size="sm">
//                 <LogOut size={16} />
//                 Sign Out
//               </Button>
//             </SignOutButton>
//           )}
//         </div>
//       </aside>

//       {/* Mobile Overlay */}
//       {isOpen && (
//         <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsOpen(false)} aria-hidden="true" />
//       )}
//     </>
//   )
// }

"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SignOutButton, useUser } from "@clerk/nextjs"
import { BarChart3, FileText, Folder, Settings, LogOut, Menu, X, Upload, Briefcase, Layout } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const { user } = useUser()

  const menuItems = [
    {
      icon: FileText,
      label: "Documents",
      href: "/dashboard",
    },
    {
      icon: Folder,
      label: "Folders",
      href: "/dashboard/folders",
    },
    {
      icon: Layout,
      label: "Templates",
      href: "/dashboard/templates",
    },
    {
      icon: Briefcase,
      label: "Workspaces",
      href: "/dashboard/workspaces",
    },
    {
      icon: BarChart3,
      label: "Analytics",
      href: "/dashboard/analytics",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/dashboard/settings",
    },
  ]

  const handleNavClick = () => {
    if (isOpen) {
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-card border-r border-border transition-all duration-300 flex flex-col h-screen sticky top-0",
          isCollapsed ? "w-20" : "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-sm font-bold">
                D
              </div>
              <span>DocIntel</span>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:block p-1 hover:bg-muted rounded transition-colors"
            aria-label="Toggle sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground hover:bg-muted",
                  isCollapsed && "justify-center px-0",
                )}
                title={isCollapsed ? item.label : ""}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Upload Button */}
        <div className="p-4 border-t border-border space-y-4">
          <Button className={cn("w-full", isCollapsed && "p-2")} size={isCollapsed ? "icon" : "lg"}>
            <Upload size={18} />
            {!isCollapsed && <span>Upload</span>}
          </Button>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-t border-border">
          <div className={cn("flex items-center gap-3 mb-4", isCollapsed && "justify-center")}>
            <img
              src={user?.imageUrl || "/placeholder.svg"}
              alt={user?.fullName || "User"}
              className="w-10 h-10 rounded-full flex-shrink-0"
            />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-sm">{user?.fullName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <SignOutButton>
              <Button variant="ghost" className="w-full justify-start text-destructive text-sm" size="sm">
                <LogOut size={16} />
                Sign Out
              </Button>
            </SignOutButton>
          )}
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsOpen(false)} aria-hidden="true" />
      )}
    </>
  )
}

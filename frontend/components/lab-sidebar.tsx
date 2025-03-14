"use client"

import { useLanguage } from "@/components/language-provider"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  ActivitySquare,
  Database,
  FileDigit,
  Folder,
  Globe,
  LayoutDashboard,
  Settings,
  Shield,
  Upload,
  Languages,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function LabSidebar() {
  const { t, language, setLanguage } = useLanguage()
  const pathname = usePathname()

  const navItems = [
    { name: t("dashboard"), icon: LayoutDashboard, path: "/dashboard" }, // Changed from "/" to "/dashboard"
    { name: t("network"), icon: Globe, path: "/network" },
    { name: t("memory"), icon: Database, path: "/memory" },
    { name: t("filesystem"), icon: Folder, path: "/filesystem" },
    { name: t("reports"), icon: FileDigit, path: "/reports" },
    { name: t("upload"), icon: Upload, path: "/upload" },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-muted">
        <div className="flex items-center gap-2 px-4 py-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold tracking-tight">Forensics Lab</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <ActivitySquare className="mr-2 h-4 w-4" />
            {t("navigation")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.path || (item.path === "/dashboard" && pathname === "/")} 
                    tooltip={item.name}
                  >
                    <Link href={item.path} className="flex items-center gap-2 w-full">
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-muted p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/settings">
              <Settings className="h-5 w-5" />
              <span className="sr-only">{t("settings")}</span>
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Languages className="h-5 w-5" />
                <span className="sr-only">{t("language")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage("en")}>
                {t("english")}
                {language === "en" && <span className="ml-2 text-primary">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("fr")}>
                {t("french")}
                {language === "fr" && <span className="ml-2 text-primary">✓</span>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

"use client";

import { useLanguage } from "@/components/language-provider";
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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
// import { ThemeToggle } from "@/components/theme-toggle";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function LabSidebar() {
  const { t, language, setLanguage } = useLanguage();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsCollapsed(window.innerWidth < 768);
    };

    // Initial check
    checkScreenSize();

    // Add event listener
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const navItems = [
    { name: t("dashboard"), icon: LayoutDashboard, path: "/dashboard" },
    { name: t("network"), icon: Globe, path: "/network" },
    { name: t("memory"), icon: Database, path: "/memory" },
    { name: t("filesystem"), icon: Folder, path: "/filesystem" },
    { name: t("reports"), icon: FileDigit, path: "/reports" },
    { name: t("upload"), icon: Upload, path: "/upload" },
  ];

  return (
    <Sidebar
      className={cn(
        "transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[60px]" : "w-[240px]",
        isMobile && isCollapsed && "w-0"
      )}
    >
      <SidebarHeader className="border-b border-muted relative">
        <div
          className={cn(
            "flex items-center gap-2 px-4 py-2",
            isCollapsed && "justify-center"
          )}
        >
          <Shield className="h-6 w-6 text-primary" />
          {!isCollapsed && (
            <span className="text-lg font-bold tracking-tight">
              Forensics Lab
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 lg:hidden"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <Menu className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel
            className={cn(
              "flex items-center",
              isCollapsed && "justify-center px-0"
            )}
          >
            <ActivitySquare className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">{t("navigation")}</span>}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      pathname === item.path ||
                      (item.path === "/dashboard" && pathname === "/")
                    }
                    tooltip={isCollapsed ? item.name : undefined}
                  >
                    <Link
                      href={item.path}
                      className={cn(
                        "flex items-center gap-2 w-full",
                        isCollapsed && "justify-center px-0"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span>{item.name}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-muted p-4">
        <div
          className={cn(
            "flex items-center",
            isCollapsed ? "flex-col gap-4" : "justify-between"
          )}
        >
          {/* <ThemeToggle /> */}
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
                {language === "en" && (
                  <span className="ml-2 text-primary">✓</span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("fr")}>
                {t("french")}
                {language === "fr" && (
                  <span className="ml-2 text-primary">✓</span>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

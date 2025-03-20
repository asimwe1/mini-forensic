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
  LogOut,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
// import { ThemeToggle } from "@/components/theme-toggle";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { apiService } from "@/services/api";

export function LabSidebar() {
  const { t, language, setLanguage } = useLanguage();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto collapse on mobile
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    // Initial check
    checkScreenSize();

    // Add event listener with debounce
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkScreenSize, 100);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const navItems = [
    { name: t("dashboard"), icon: LayoutDashboard, path: "/dashboard" },
    { name: t("network"), icon: Globe, path: "/network" },
    { name: t("memory"), icon: Database, path: "/memory" },
    { name: t("filesystem"), icon: Folder, path: "/filesystem" },
    { name: t("reports"), icon: FileDigit, path: "/reports" },
    { name: t("upload"), icon: Upload, path: "/upload" },
  ];

  const handleLogout = async () => {
    try {
      await apiService.logout();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button - Only visible on mobile */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <Menu className="h-5 w-5" />
          ) : (
            <X className="h-5 w-5" />
          )}
        </Button>
      )}

      {/* Mobile Overlay - Only shown when sidebar is open on mobile */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      <Sidebar
        className={cn(
          "transition-all duration-300 ease-in-out",
          isCollapsed ? "w-0 md:w-[60px]" : "w-[240px]",
          isMobile ? "fixed left-0 top-0 bottom-0 z-50" : "relative",
          isMobile && isCollapsed && "-translate-x-full md:translate-x-0"
        )}
      >
        <SidebarHeader className="border-b border-muted h-14">
          <div
            className={cn(
              "flex items-center gap-2 px-4 h-full",
              isCollapsed && !isMobile && "justify-center"
            )}
          >
            <Shield className="h-6 w-6 text-primary shrink-0" />
            {(!isCollapsed || isMobile) && (
              <span className="text-lg font-bold tracking-tight truncate">
                Forensics Lab
              </span>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2">
          <SidebarGroup>
            <SidebarGroupLabel
              className={cn(
                "flex items-center px-2 py-2",
                isCollapsed && !isMobile && "justify-center"
              )}
            >
              <ActivitySquare className="h-4 w-4 shrink-0" />
              {(!isCollapsed || isMobile) && (
                <span className="ml-2 truncate">{t("navigation")}</span>
              )}
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
                      tooltip={isCollapsed && !isMobile ? item.name : undefined}
                    >
                      <Link
                        href={item.path}
                        className={cn(
                          "flex items-center gap-2 w-full px-2 py-2 rounded-md",
                          isCollapsed && !isMobile && "justify-center"
                        )}
                        onClick={() => isMobile && setIsCollapsed(true)}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {(!isCollapsed || isMobile) && (
                          <span className="truncate">{item.name}</span>
                        )}
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
              "flex items-center gap-2",
              isCollapsed && !isMobile ? "flex-col" : "justify-between"
            )}
          >
            <Button variant="ghost" size="icon" asChild className="shrink-0">
              <Link href="/settings">
                <Settings className="h-5 w-5" />
                <span className="sr-only">{t("settings")}</span>
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Languages className="h-5 w-5" />
                  <span className="sr-only">{t("language")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className={cn("w-[160px]", isCollapsed && !isMobile && "ml-2")}
              >
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

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span className={!isCollapsed || isMobile ? "block" : "hidden"}>
                Logout
              </span>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}

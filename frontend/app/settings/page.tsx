"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Moon,
  Sun,
  Bell,
  Globe,
  Shield,
  User,
  ArrowLeft,
  Languages,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/language-provider";

type Language = "en" | "fr";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const [notifications, setNotifications] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast({
      title: "Theme updated",
      description: `Switched to ${newTheme} mode`,
    });
  };

  const handleNotificationToggle = (checked: boolean) => {
    setNotifications(checked);
    toast({
      title: "Notifications updated",
      description: checked ? "Notifications enabled" : "Notifications disabled",
    });
  };

  const handlePrivacyToggle = (checked: boolean) => {
    setPrivacyMode(checked);
    toast({
      title: "Privacy mode updated",
      description: checked ? "Privacy mode enabled" : "Privacy mode disabled",
    });
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    toast({
      title: newLanguage === "en" ? "Language Updated" : "Langue Mise à Jour",
      description:
        newLanguage === "en" ? "Switched to English" : "Changé en Français",
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8 max-w-4xl">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 mb-4 hover:bg-accent"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{t("common.back")}</span>
      </Button>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h1 className="text-2xl md:text-3xl font-bold">
          {t("settings.title")}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          {t("settings.description")}
        </p>
      </div>

      <div className="grid gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Sun className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize how Forensics Lab looks on your device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred theme
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleThemeChange("light")}
                  className="flex-1 sm:flex-none"
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleThemeChange("dark")}
                  className="flex-1 sm:flex-none"
                >
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleThemeChange("system")}
                  className="flex-1 sm:flex-none"
                >
                  System
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Manage your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about your analyses
                </p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={handleNotificationToggle}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Languages className="h-5 w-5" />
              {t("settings.language")}
            </CardTitle>
            <CardDescription>
              {t("settings.languageDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <Label>{t("settings.languageLabel")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("settings.languageHelp")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant={language === "en" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleLanguageChange("en")}
                  className="flex-1 sm:flex-none min-w-[120px]"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  English
                </Button>
                <Button
                  variant={language === "fr" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleLanguageChange("fr")}
                  className="flex-1 sm:flex-none min-w-[120px]"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Français
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Shield className="h-5 w-5" />
              Privacy
            </CardTitle>
            <CardDescription>Manage your privacy settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <Label>Privacy Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Hide sensitive information from screenshots
                </p>
              </div>
              <Switch
                checked={privacyMode}
                onCheckedChange={handlePrivacyToggle}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <User className="h-5 w-5" />
              Account
            </CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" className="w-full sm:w-auto">
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

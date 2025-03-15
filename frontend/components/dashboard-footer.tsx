"use client";

import { useLanguage } from "@/components/language-provider";
import { Github, Heart } from "lucide-react";

export function DashboardFooter() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t py-6 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>© {currentYear} Forensics Lab.</span>
          <span className="hidden sm:inline">|</span>
          <span>{t("footer.allRightsReserved")}</span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/yourusername/your-repo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </a>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            {t("footer.madeWith")}{" "}
            <Heart className="h-4 w-4 text-red-500" fill="currentColor" />
          </span>
        </div>
      </div>
    </footer>
  );
}

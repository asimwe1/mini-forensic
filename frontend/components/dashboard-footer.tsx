"use client";

import { useLanguage } from "@/components/language-provider";
import { Github, Heart } from "lucide-react";

export function DashboardFooter() {
  const { t } = useLanguage();

  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Mini Forensic. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/yourusername/mini-forensic"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Heart className="h-4 w-4 text-red-500" />
              <span>Made with love</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

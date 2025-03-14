"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type Language = "en" | "fr"
type Translations = Record<string, Record<Language, string>>

const translations: Translations = {
  dashboard: {
    en: "Dashboard",
    fr: "Tableau de bord",
  },
  network: {
    en: "Network Analysis",
    fr: "Analyse réseau",
  },
  memory: {
    en: "Memory Analysis",
    fr: "Analyse mémoire",
  },
  filesystem: {
    en: "File System",
    fr: "Système de fichiers",
  },
  reports: {
    en: "Reports",
    fr: "Rapports",
  },
  upload: {
    en: "Upload",
    fr: "Télécharger",
  },
  settings: {
    en: "Settings",
    fr: "Paramètres",
  },
  alerts: {
    en: "Alerts",
    fr: "Alertes",
  },
  metrics: {
    en: "Metrics",
    fr: "Métriques",
  },
  recentActivity: {
    en: "Recent Activity",
    fr: "Activité récente",
  },
  threatLevel: {
    en: "Threat Level",
    fr: "Niveau de menace",
  },
  high: {
    en: "High",
    fr: "Élevé",
  },
  medium: {
    en: "Medium",
    fr: "Moyen",
  },
  low: {
    en: "Low",
    fr: "Faible",
  },
  uploadFiles: {
    en: "Upload Files",
    fr: "Télécharger des fichiers",
  },
  dragAndDrop: {
    en: "Drag and drop files here or click to browse",
    fr: "Glissez et déposez des fichiers ici ou cliquez pour parcourir",
  },
  generateReport: {
    en: "Generate Report",
    fr: "Générer un rapport",
  },
  language: {
    en: "Language",
    fr: "Langue",
  },
  english: {
    en: "English",
    fr: "Anglais",
  },
  french: {
    en: "French",
    fr: "Français",
  },
}

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  const t = (key: string): string => {
    return translations[key]?.[language] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}


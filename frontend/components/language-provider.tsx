"use client";

import * as React from "react";
import { createContext, useContext, useState } from "react";

type Language = "en" | "fr";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const translations = {
  en: {
    "dashboard.title": "Dashboard",
    "dashboard.welcome":
      "Welcome back! Here's an overview of your forensic analysis.",
    "dashboard.stats.network.title": "Network Activity",
    "dashboard.stats.network.description": "Active connections",
    "dashboard.stats.memory.title": "Memory Usage",
    "dashboard.stats.memory.description": "Current memory footprint",
    "dashboard.stats.files.title": "Files Analyzed",
    "dashboard.stats.files.description": "Total files processed",
    "dashboard.stats.threats.title": "Threat Level",
    "dashboard.stats.threats.description": "Critical threats detected",
    "dashboard.visualization.title": "Visualization",
    "dashboard.alerts.title": "Alerts",
    "dashboard.activity.title": "Recent Activity",
  },
  fr: {
    "dashboard.title": "Tableau de bord",
    "dashboard.welcome":
      "Bon retour ! Voici un aperçu de votre analyse médico-légale.",
    "dashboard.stats.network.title": "Activité réseau",
    "dashboard.stats.network.description": "Connexions actives",
    "dashboard.stats.memory.title": "Utilisation mémoire",
    "dashboard.stats.memory.description": "Empreinte mémoire actuelle",
    "dashboard.stats.files.title": "Fichiers analysés",
    "dashboard.stats.files.description": "Total des fichiers traités",
    "dashboard.stats.threats.title": "Niveau de menace",
    "dashboard.stats.threats.description": "Menaces critiques détectées",
    "dashboard.visualization.title": "Visualisation",
    "dashboard.alerts.title": "Alertes",
    "dashboard.activity.title": "Activité récente",
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    return (
      translations[language][
        key as keyof (typeof translations)[typeof language]
      ] || key
    );
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

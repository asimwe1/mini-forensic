"use client";

import { createContext, useContext, useState } from "react";

type Language = "en" | "es" | "fr" | "de" | "ja";

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    "dashboard.title": "Dashboard",
    "dashboard.welcome": "Welcome to your forensic analysis dashboard",
    "dashboard.no_data": "No data available",
    "dashboard.no_alerts": "No alerts",
    "dashboard.no_activity": "No recent activity",
    "dashboard.stats.network.title": "Network Traffic",
    "dashboard.stats.network.description": "Current network traffic",
    "dashboard.stats.memory.title": "Memory Usage",
    "dashboard.stats.memory.description": "System memory utilization",
    "dashboard.stats.files.title": "Total Files",
    "dashboard.stats.files.description": "Files in analysis",
    "dashboard.stats.threats.title": "Active Threats",
    "dashboard.stats.threats.description": "Detected security threats",
    "dashboard.visualization.title": "System Visualizations",
    "dashboard.alerts.title": "Security Alerts",
    "dashboard.activity.title": "Recent Activity",
  },
  es: {
    "dashboard.title": "Panel de Control",
    "dashboard.welcome": "Bienvenido a su panel de análisis forense",
    "dashboard.no_data": "Sin datos disponibles",
    "dashboard.no_alerts": "Sin alertas",
    "dashboard.no_activity": "Sin actividad reciente",
    "dashboard.stats.network.title": "Tráfico de Red",
    "dashboard.stats.network.description": "Tráfico de red actual",
    "dashboard.stats.memory.title": "Uso de Memoria",
    "dashboard.stats.memory.description": "Utilización de memoria del sistema",
    "dashboard.stats.files.title": "Archivos Totales",
    "dashboard.stats.files.description": "Archivos en análisis",
    "dashboard.stats.threats.title": "Amenazas Activas",
    "dashboard.stats.threats.description": "Amenazas de seguridad detectadas",
    "dashboard.visualization.title": "Visualizaciones del Sistema",
    "dashboard.alerts.title": "Alertas de Seguridad",
    "dashboard.activity.title": "Actividad Reciente",
  },
  fr: {
    "dashboard.title": "Tableau de Bord",
    "dashboard.welcome":
      "Bienvenue sur votre tableau de bord d'analyse forensique",
    "dashboard.no_data": "Aucune donnée disponible",
    "dashboard.no_alerts": "Aucune alerte",
    "dashboard.no_activity": "Aucune activité récente",
    "dashboard.stats.network.title": "Trafic Réseau",
    "dashboard.stats.network.description": "Trafic réseau actuel",
    "dashboard.stats.memory.title": "Utilisation Mémoire",
    "dashboard.stats.memory.description": "Utilisation de la mémoire système",
    "dashboard.stats.files.title": "Fichiers Totaux",
    "dashboard.stats.files.description": "Fichiers en analyse",
    "dashboard.stats.threats.title": "Menaces Actives",
    "dashboard.stats.threats.description": "Menaces de sécurité détectées",
    "dashboard.visualization.title": "Visualisations Système",
    "dashboard.alerts.title": "Alertes de Sécurité",
    "dashboard.activity.title": "Activité Récente",
  },
  de: {
    "dashboard.title": "Dashboard",
    "dashboard.welcome": "Willkommen auf Ihrem Forensik-Analyse-Dashboard",
    "dashboard.no_data": "Keine Daten verfügbar",
    "dashboard.no_alerts": "Keine Warnungen",
    "dashboard.no_activity": "Keine kürzliche Aktivität",
    "dashboard.stats.network.title": "Netzwerkverkehr",
    "dashboard.stats.network.description": "Aktueller Netzwerkverkehr",
    "dashboard.stats.memory.title": "Speichernutzung",
    "dashboard.stats.memory.description": "Systemspeichernutzung",
    "dashboard.stats.files.title": "Gesamtdateien",
    "dashboard.stats.files.description": "Dateien in Analyse",
    "dashboard.stats.threats.title": "Aktive Bedrohungen",
    "dashboard.stats.threats.description": "Erkannte Sicherheitsbedrohungen",
    "dashboard.visualization.title": "Systemvisualisierungen",
    "dashboard.alerts.title": "Sicherheitswarnungen",
    "dashboard.activity.title": "Kürzliche Aktivität",
  },
  ja: {
    "dashboard.title": "ダッシュボード",
    "dashboard.welcome": "フォレンジック分析ダッシュボードへようこそ",
    "dashboard.no_data": "データなし",
    "dashboard.no_alerts": "アラートなし",
    "dashboard.no_activity": "最近のアクティビティなし",
    "dashboard.stats.network.title": "ネットワークトラフィック",
    "dashboard.stats.network.description": "現在のネットワークトラフィック",
    "dashboard.stats.memory.title": "メモリ使用量",
    "dashboard.stats.memory.description": "システムメモリ使用率",
    "dashboard.stats.files.title": "総ファイル数",
    "dashboard.stats.files.description": "分析中のファイル",
    "dashboard.stats.threats.title": "アクティブな脅威",
    "dashboard.stats.threats.description": "検出されたセキュリティ脅威",
    "dashboard.visualization.title": "システム可視化",
    "dashboard.alerts.title": "セキュリティアラート",
    "dashboard.activity.title": "最近のアクティビティ",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    return translations[language]?.[key] || translations["en"][key] || key;
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

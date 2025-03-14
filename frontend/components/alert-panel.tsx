"use client"

import { useLanguage } from "@/components/language-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, ShieldAlert, ShieldCheck } from "lucide-react"
import { motion } from "framer-motion"

type Alert = {
  id: number
  level: "high" | "medium" | "low"
  message: string
  timestamp: string
}

const alerts: Alert[] = [
  {
    id: 1,
    level: "high",
    message: "Suspicious memory access at 0x7FFF1234",
    timestamp: "2 min ago",
  },
  {
    id: 2,
    level: "medium",
    message: "Unusual network traffic to 192.168.1.45",
    timestamp: "15 min ago",
  },
  {
    id: 3,
    level: "low",
    message: "Multiple failed login attempts",
    timestamp: "1 hour ago",
  },
]

export function AlertPanel() {
  const { t } = useLanguage()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <Bell className="w-4 h-4 inline mr-2" />
          {t("alerts")}
        </CardTitle>
        <Badge variant="outline" className="bg-destructive/20">
          {alerts.length} new
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start space-x-3"
            >
              <div className="mt-0.5">
                {alert.level === "high" ? (
                  <ShieldAlert className="h-5 w-5 text-destructive pulse" />
                ) : alert.level === "medium" ? (
                  <ShieldAlert className="h-5 w-5 text-orange-400" />
                ) : (
                  <ShieldCheck className="h-5 w-5 text-accent" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{alert.message}</p>
                <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
              </div>
              <Badge
                className={
                  alert.level === "high"
                    ? "bg-destructive/20 text-destructive ml-auto"
                    : alert.level === "medium"
                      ? "bg-orange-400/20 text-orange-400 ml-auto"
                      : "bg-accent/20 text-accent ml-auto"
                }
              >
                {t(alert.level)}
              </Badge>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


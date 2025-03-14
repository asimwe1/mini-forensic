"use client"

import { useLanguage } from "@/components/language-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { motion } from "framer-motion"

type Activity = {
  id: number
  action: string
  timestamp: string
}

const activities: Activity[] = [
  {
    id: 1,
    action: "Memory dump analysis started",
    timestamp: "2 min ago",
  },
  {
    id: 2,
    action: "Network capture imported",
    timestamp: "15 min ago",
  },
  {
    id: 3,
    action: "File system scan completed",
    timestamp: "1 hour ago",
  },
  {
    id: 4,
    action: "Report generated",
    timestamp: "3 hours ago",
  },
]

export function RecentActivityPanel() {
  const { t } = useLanguage()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <Clock className="w-4 h-4 inline mr-2" />
          {t("recentActivity")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center space-x-3"
            >
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{activity.action}</p>
                <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


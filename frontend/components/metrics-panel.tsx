"use client"

import { useLanguage } from "@/components/language-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from "lucide-react"
import {
  Chart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartArea,
  ChartLine,
  ChartXAxis,
  ChartYAxis,
} from "@/components/ui/chart"

const data = [
  { time: "00:00", value: 10 },
  { time: "04:00", value: 15 },
  { time: "08:00", value: 25 },
  { time: "12:00", value: 35 },
  { time: "16:00", value: 45 },
  { time: "20:00", value: 30 },
  { time: "24:00", value: 20 },
]

export function MetricsPanel() {
  const { t } = useLanguage()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <Activity className="w-4 h-4 inline mr-2" />
          {t("metrics")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[150px]">
          <Chart data={data}>
            <ChartContainer>
              <ChartTooltip>
                <ChartTooltipContent />
              </ChartTooltip>
              <ChartYAxis />
              <ChartXAxis dataKey="time" />
              <ChartArea dataKey="value" fill="url(#colorGradient)" opacity={0.2} />
              <ChartLine
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
            </ChartContainer>
          </Chart>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground">CPU</span>
            <span className="text-lg font-bold text-primary">45%</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground">Memory</span>
            <span className="text-lg font-bold text-secondary">68%</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground">Disk</span>
            <span className="text-lg font-bold text-accent">32%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


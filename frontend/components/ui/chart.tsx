"use client"

import type * as React from "react"
import { Area, Bar, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface ChartProps {
  data: any[]
  children: React.ReactNode
}

const Chart = ({ data, children }: ChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        {children}
      </ComposedChart>
    </ResponsiveContainer>
  )
}

interface ChartContainerProps {
  children: React.ReactNode
}

const ChartContainer = ({ children }: ChartContainerProps) => {
  return <>{children}</>
}

const ChartTooltip = ({ children }: ChartContainerProps) => {
  return (
    <Tooltip
      contentStyle={{
        background: "hsl(var(--card))",
        color: "hsl(var(--card-foreground))",
        border: "1px solid hsl(var(--border))",
      }}
    />
  )
}

const ChartTooltipContent = () => {
  return null
}

interface ChartXAxisProps {
  dataKey: string
}

const ChartXAxis = ({ dataKey }: ChartXAxisProps) => {
  return (
    <XAxis
      dataKey={dataKey}
      stroke="hsl(var(--muted-foreground))"
      style={{
        fontSize: "10px",
      }}
      axisLine={false}
      tickLine={false}
    />
  )
}

const ChartYAxis = () => {
  return (
    <YAxis
      stroke="hsl(var(--muted-foreground))"
      style={{
        fontSize: "10px",
      }}
      axisLine={false}
      tickLine={false}
    />
  )
}

interface ChartLineProps {
  dataKey: string
  stroke: string
  strokeWidth: number
  dot?: any
}

const ChartLine = ({ dataKey, stroke, strokeWidth, dot }: ChartLineProps) => {
  return <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={strokeWidth} dot={dot} />
}

interface ChartAreaProps {
  dataKey: string
  fill: string
  opacity: number
}

const ChartArea = ({ dataKey, fill, opacity }: ChartAreaProps) => {
  return <Area type="monotone" dataKey={dataKey} fill={fill} fillOpacity={opacity} />
}

interface ChartBarProps {
  dataKey: string
  fill: string
}

const ChartBar = ({ dataKey, fill }: ChartBarProps) => {
  return <Bar dataKey={dataKey} fill={fill} />
}

export {
  Chart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartXAxis,
  ChartYAxis,
  ChartLine,
  ChartArea,
  ChartBar,
}


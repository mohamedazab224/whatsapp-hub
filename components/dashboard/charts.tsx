"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  { name: "29", inbound: 0, outbound: 0 },
  { name: "30", inbound: 0, outbound: 0 },
  { name: "31", inbound: 0, outbound: 0 },
  { name: "01", inbound: 0, outbound: 0 },
  { name: "02", inbound: 0, outbound: 0 },
  { name: "03", inbound: 0, outbound: 0 },
  { name: "04", inbound: 68, outbound: 0 },
]

export function DailyMessagesChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={4}>
          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            cursor={{ fill: "transparent" }}
            contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
          />
          <Bar dataKey="inbound" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={32} />
          <Bar dataKey="outbound" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={32} />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">الوارد</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-slate-400" />
          <span className="text-xs text-muted-foreground">الخارج</span>
        </div>
      </div>
    </div>
  )
}

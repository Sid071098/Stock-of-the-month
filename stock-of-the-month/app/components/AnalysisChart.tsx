"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SparklinePoint } from "../lib/marketData";

export default function AnalysisChart({
  data,
  heightClassName = "h-72",
  strokeColor = "#22c55e"
}: {
  data: SparklinePoint[];
  heightClassName?: string;
  strokeColor?: string;
}) {
  const gradientId = `stockymonthSparkline-${strokeColor.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div className={`${heightClassName} w-full`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ bottom: 0, left: 0, right: 0, top: 10 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.45} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" hide />
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Tooltip
            contentStyle={{
              background: "rgba(15, 23, 42, 0.92)",
              border: "1px solid rgba(148, 163, 184, 0.25)",
              borderRadius: 8,
              color: "#fff"
            }}
            formatter={(value) => [`$${Number(value).toFixed(2)}`, "Close"]}
          />
          <Area
            dataKey="close"
            fill={`url(#${gradientId})`}
            stroke={strokeColor}
            strokeWidth={3}
            type="monotone"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

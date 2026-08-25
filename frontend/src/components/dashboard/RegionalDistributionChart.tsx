"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BarChart3 } from "lucide-react";
import { RegionalPressure } from "@/types/clinical";

interface RegionalDistributionChartProps {
  regionalDistribution: RegionalPressure[];
}

export const RegionalDistributionChart: React.FC<RegionalDistributionChartProps> = ({
  regionalDistribution,
}) => {
  const chartData = (regionalDistribution && regionalDistribution.length > 0)
    ? regionalDistribution.map((r) => ({
        region: r.region,
        pressure: Math.round(r.total_kpa),
        fraction: Math.round(r.relative_fraction * 100),
      }))
    : [
        { region: "Forefoot", pressure: 3200, fraction: 62 },
        { region: "Midfoot", pressure: 720, fraction: 14 },
        { region: "Heel", pressure: 1250, fraction: 24 },
      ];

  const COLORS = ["#E11D48", "#0EA5E9", "#0D9488"];

  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
      <div className="flex items-center space-x-2.5 border-b border-stone-100 pb-3">
        <div className="p-2 rounded-lg bg-teal-50 border border-teal-200 text-teal-700">
          <BarChart3 className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">Regional Pressure Distribution</h3>
          <p className="text-[10px] text-slate-500">Zonal load fraction breakdown (kPa)</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="region" tick={{ fontSize: 11, fill: "#64748B", fontWeight: 600 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: "#0F172A", borderRadius: "10px", color: "#FFF", fontSize: "11px" }}
              formatter={(val: any) => [`${val} kPa`, "Pressure"]}
            />
            <Bar dataKey="pressure" radius={[8, 8, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Stats */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
        {chartData.map((d, i) => (
          <div key={i} className="p-2 rounded-lg bg-stone-50 border border-stone-200/80">
            <span className="text-[10px] font-bold text-slate-500 block">{d.region}</span>
            <span className="text-xs font-black text-slate-900">{d.fraction}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

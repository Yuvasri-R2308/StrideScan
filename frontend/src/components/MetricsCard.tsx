"use client";

import React from "react";
import { Gauge, Activity, Compass, Flame } from "lucide-react";

interface MetricsData {
  peak_pressure: number;
  average_pressure: number;
  heel_pressure: number;
  forefoot_pressure: number;
}

interface MetricsCardProps {
  metrics: MetricsData;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({ metrics }) => {
  const metricItems = [
    {
      title: "Peak Pressure",
      value: metrics.peak_pressure,
      unit: "kPa",
      icon: Flame,
      color: "text-red-600 bg-red-50 border-red-100",
      description: "Maximum load point",
    },
    {
      title: "Average Pressure",
      value: metrics.average_pressure,
      unit: "kPa",
      icon: Activity,
      color: "text-blue-600 bg-blue-50 border-blue-100",
      description: "Mean surface load",
    },
    {
      title: "Heel Pressure",
      value: metrics.heel_pressure,
      unit: "kPa",
      icon: Gauge,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
      description: "Calcaneus load sensor (C.P)",
    },
    {
      title: "Forefoot Pressure",
      value: metrics.forefoot_pressure,
      unit: "kPa",
      icon: Compass,
      color: "text-amber-600 bg-amber-50 border-amber-100",
      description: "Metatarsals & Hallux max",
    },
  ];

  return (
    <div className="card-apple p-6 sm:p-7">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Plantar Pressure Metrics
          </h3>
          <p className="text-xs text-slate-400">
            Regional sensor load measurements at peak pressure frame
          </p>
        </div>
      </div>

      {/* Grid of 4 Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {metricItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100/90 hover:bg-white hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">
                  {item.title}
                </span>
                <div className={`p-2 rounded-xl border ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {item.unit}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

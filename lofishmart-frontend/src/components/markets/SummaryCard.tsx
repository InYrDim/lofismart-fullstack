import React from "react";

interface SummaryCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: React.ReactNode;
}

export function SummaryCard({
  icon,
  iconBg,
  label,
  value,
}: SummaryCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
      <div className={`p-3 ${iconBg} rounded-xl`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

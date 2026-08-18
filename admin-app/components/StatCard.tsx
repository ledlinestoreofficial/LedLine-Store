import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'amber' | 'emerald' | 'blue' | 'purple' | 'rose';
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'amber',
}: StatCardProps) {
  const iconStyleMap = {
    amber: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 hover:border-[#111111] transition-all duration-200 shadow-xs flex flex-col justify-between group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-[#757575]">{title}</p>
          <p className="text-2xl font-black text-[#111111] mt-1.5 font-mono tracking-tight">{value}</p>
        </div>
        <div className={`p-2.5 rounded-xl border ${iconStyleMap[color]} shadow-xs`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-[#E5E5E5] flex items-center justify-between text-xs">
          {subtitle && <span className="text-[#757575] text-[11px] font-medium">{subtitle}</span>}
          {trend && (
            <span
              className={`flex items-center gap-1 font-bold text-[11px] ${
                trend.isPositive ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

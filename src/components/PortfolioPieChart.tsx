import React from 'react';
import { formatCurrency } from '../utils/calculations';

interface PortfolioPieChartProps {
  breakdown: {
    kr_stock: number;
    us_stock: number;
    crypto: number;
    real_estate: number;
    cash: number;
  };
  total: number;
}

const ASSET_META = {
  real_estate: { label: '부동산', color: '#f59e0b', emoji: '🏢' }, // 앰버
  us_stock: { label: '해외주식', color: '#3b82f6', emoji: '🗽' }, // 블루
  kr_stock: { label: '국내주식', color: '#10b981', emoji: '🇰🇷' }, // 에메랄드
  crypto: { label: '가상자산', color: '#8b5cf6', emoji: '⚡' }, // 바이올렛
  cash: { label: '현금', color: '#64748b', emoji: '💵' }, // 슬레이트
};

export const PortfolioPieChart: React.FC<PortfolioPieChartProps> = ({ breakdown, total }) => {
  if (total <= 0) {
    return (
      <div className="text-center py-6 text-slate-500 text-xs">
        등록된 자산이 없습니다.
      </div>
    );
  }

  const items = Object.entries(breakdown)
    .map(([key, value]) => ({
      key: key as keyof typeof ASSET_META,
      value,
      percent: (value / total) * 100,
      meta: ASSET_META[key as keyof typeof ASSET_META],
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  // SVG 도넛 차트 스트로크 오프셋 연산
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
      {/* SVG 도넛 */}
      <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
          {/* 베이스 원 */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="stroke-slate-800"
            strokeWidth="16"
            fill="transparent"
          />
          {items.map((item) => {
            const strokeDasharray = `${(item.percent / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
            accumulatedPercent += item.percent;

            return (
              <circle
                key={item.key}
                cx="50"
                cy="50"
                r={radius}
                stroke={item.meta.color}
                strokeWidth="16"
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            );
          })}
        </svg>

        {/* 중앙 텍스트 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-[10px] text-slate-400 font-medium">총 자산</span>
          <span className="text-xs font-black text-amber-300">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {/* 범례 (Legend) */}
      <div className="grid grid-cols-2 gap-2 text-xs flex-1">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 border border-slate-700/50"
          >
            <div className="flex items-center gap-1.5 truncate">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.meta.color }}
              />
              <span className="text-slate-300 font-semibold truncate">
                {item.meta.emoji} {item.meta.label}
              </span>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <span className="font-bold text-slate-100">{item.percent.toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import { RankedMember, Asset } from '../types';
import { formatCurrency, formatPercent } from '../utils/calculations';
import { ChevronRight } from 'lucide-react';

interface LeaderboardCardProps {
  rankedMember: RankedMember;
  memberAssets: Asset[];
  onSelect: () => void;
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  rankedMember,
  memberAssets,
  onSelect,
}) => {
  const { member, metrics, rank, badges } = rankedMember;
  const isPositive = metrics.profitRate >= 0;

  // 카드 스타일링 (순위별)
  let cardBorder = 'border-slate-800 hover:border-slate-700 bg-slate-900/60';
  let rankBadgeBg = 'bg-slate-800 text-slate-300';

  if (rank === 1) {
    cardBorder = 'border-amber-500/50 bg-gradient-to-r from-amber-950/30 to-slate-900/80 shadow-lg shadow-amber-500/10 hover:border-amber-400';
    rankBadgeBg = 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black';
  } else if (rank === 2) {
    cardBorder = 'border-slate-400/40 bg-slate-900/70 hover:border-slate-300';
    rankBadgeBg = 'bg-slate-300 text-slate-900 font-black';
  } else if (rank === 3) {
    cardBorder = 'border-amber-700/40 bg-slate-900/70 hover:border-amber-600';
    rankBadgeBg = 'bg-amber-700 text-amber-100 font-black';
  } else if (rank === 14) {
    cardBorder = 'border-cyan-500/40 bg-gradient-to-r from-cyan-950/20 to-slate-900/70 hover:border-cyan-400';
    rankBadgeBg = 'bg-cyan-500 text-slate-950 font-black';
  }

  return (
    <div
      onClick={onSelect}
      className={`relative rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer group flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${cardBorder}`}
    >
      {/* 좌측: 순위, 아바타, 이름, 칭호 */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* 순위 배지 */}
        <div
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 shadow-sm ${rankBadgeBg}`}
        >
          {rank === 1 ? '👑 1' : rank}
        </div>

        {/* 아바타 */}
        <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition">
          {member.avatar}
        </div>

        {/* 멤버 정보 및 칭호 */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base sm:text-lg font-black text-white group-hover:text-amber-300 transition">
              {member.name}
            </h4>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              ({member.role || '다락방 멤버'})
            </span>

            {/* 칭호 배지들 */}
            <div className="flex flex-wrap items-center gap-1">
              {badges.map((b) => (
                <span
                  key={b.id}
                  className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-amber-500/20"
                  title={b.description}
                >
                  <span>{b.emoji}</span>
                  <span>{b.label}</span>
                </span>
              ))}
            </div>
          </div>

          {/* 보유 종목 태그 */}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {memberAssets.slice(0, 3).map((asset) => (
              <span
                key={asset.id}
                className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50 truncate max-w-[120px]"
              >
                {asset.type === 'real_estate' ? '🏢' : asset.type === 'crypto' ? '⚡' : '📈'}{' '}
                {asset.name}
              </span>
            ))}
            {memberAssets.length > 3 && (
              <span className="text-[10px] text-slate-500 font-semibold">
                +{memberAssets.length - 3}개 더
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 우측: 총 자산 규모 및 수익률 */}
      <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/60">
        <div className="text-left md:text-right">
          <div className="text-[11px] text-slate-400 font-medium">총 평가 자산</div>
          <div className="text-base sm:text-lg font-black text-slate-100">
            {formatCurrency(metrics.totalCurrentValue)}
          </div>
        </div>

        <div className="text-right min-w-[90px]">
          <div className="text-[11px] text-slate-400 font-medium">수익률</div>
          <div
            className={`text-base sm:text-xl font-black ${
              isPositive ? 'text-rose-400' : 'text-blue-400'
            }`}
          >
            {formatPercent(metrics.profitRate)}
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition hidden sm:block" />
      </div>
    </div>
  );
};

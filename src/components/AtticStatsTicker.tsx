import React from 'react';
import { useAtticStore } from '../context/AtticContext';
import { formatCurrency, formatPercent } from '../utils/calculations';
import { TrendingUp, TrendingDown, DollarSign, Award, ShieldAlert } from 'lucide-react';

export const AtticStatsTicker: React.FC = () => {
  const { rankedMembers } = useAtticStore();

  const totalAssets = rankedMembers.reduce((sum, r) => sum + r.metrics.totalCurrentValue, 0);
  const totalInvested = rankedMembers.reduce((sum, r) => sum + r.metrics.totalInvested, 0);
  const totalProfit = totalAssets - totalInvested;
  const averageProfitRate = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  const topPerformer = rankedMembers[0];
  const bottomPerformer = rankedMembers[rankedMembers.length - 1];

  return (
    <div className="bg-slate-900/60 border-y border-slate-800/80 px-4 py-3 sm:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. 다락방 총 자산 */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">다락방 총 자산 규모</div>
            <div className="text-sm sm:text-base font-black text-slate-100">
              {formatCurrency(totalAssets)}
            </div>
          </div>
        </div>

        {/* 2. 평균 수익률 */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">
          <div className={`p-2.5 rounded-lg border ${
            averageProfitRate >= 0
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
          }`}>
            {averageProfitRate >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">다락방 평균 수익률</div>
            <div className={`text-sm sm:text-base font-black ${
              averageProfitRate >= 0 ? 'text-rose-400' : 'text-blue-400'
            }`}>
              {formatPercent(averageProfitRate)}
            </div>
          </div>
        </div>

        {/* 3. 현재 1위 (챔피언) */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div className="truncate">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <span>수익률 1위</span>
              <span className="text-[10px] text-yellow-400">👑</span>
            </div>
            <div className="text-sm sm:text-base font-black text-slate-100 flex items-center gap-1.5 truncate">
              <span className="truncate">{topPerformer ? `${topPerformer.member.name}` : '-'}</span>
              <span className="text-xs text-rose-400 font-bold">
                {topPerformer ? formatPercent(topPerformer.metrics.profitRate) : ''}
              </span>
            </div>
          </div>
        </div>

        {/* 4. 구출 1순위 (꼴찌) */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="truncate">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <span>구출 1순위</span>
              <span className="text-[10px] text-cyan-400">🛟</span>
            </div>
            <div className="text-sm sm:text-base font-black text-slate-100 flex items-center gap-1.5 truncate">
              <span className="truncate">{bottomPerformer ? `${bottomPerformer.member.name}` : '-'}</span>
              <span className="text-xs text-blue-400 font-bold">
                {bottomPerformer ? formatPercent(bottomPerformer.metrics.profitRate) : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

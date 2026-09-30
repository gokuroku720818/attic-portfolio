import React, { useState } from 'react';
import { RankedMember } from '../types';
import { formatPercent } from '../utils/calculations';
import { triggerRescueCheer } from '../utils/confetti';
import { LifeBuoy, Heart, Thermometer } from 'lucide-react';

interface RescueStationProps {
  bottomMember: RankedMember | undefined;
  onSelectMember: (memberId: string) => void;
}

export const RescueStation: React.FC<RescueStationProps> = ({
  bottomMember,
  onSelectMember,
}) => {
  const [cheerCount, setCheerCount] = useState(18);
  const [cheered, setCheered] = useState(false);

  if (!bottomMember) return null;

  const handleCheer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCheerCount((c) => c + 1);
    setCheered(true);
    triggerRescueCheer();
    setTimeout(() => setCheered(false), 800);
  };

  return (
    <div
      onClick={() => onSelectMember(bottomMember.member.id)}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/30 p-5 sm:p-6 shadow-xl cursor-pointer group transition-all hover:border-cyan-400/60"
    >
      {/* 백그라운드 아쿠아 글로우 */}
      <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-cyan-500/10 blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* 좌측: 튜브 아이콘 및 멤버 정보 */}
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="relative">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-b from-cyan-900 to-slate-800 border-2 border-cyan-400 flex items-center justify-center text-3xl sm:text-4xl shadow-lg group-hover:scale-105 transition">
              {bottomMember.member.avatar}
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 bg-cyan-500 text-slate-950 rounded-full shadow-md animate-bounce">
              <LifeBuoy className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
                <LifeBuoy className="w-3 h-3" />
                <span>오늘의 구출 대상 (Rank {bottomMember.rank})</span>
              </span>
              <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                <Thermometer className="w-3 h-3 text-cyan-400" />
                <span>한강 수온 18.5℃</span>
              </span>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
              <h3 className="text-lg font-black text-white">{bottomMember.member.name}</h3>
              <span className="text-xs text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
                {bottomMember.badges[0]?.label || '한강 수온 체크반장'}
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-1">
              현재 수익률: <span className="font-bold text-blue-400">{formatPercent(bottomMember.metrics.profitRate)}</span>
            </p>
          </div>
        </div>

        {/* 우측: 응원하기 액션 */}
        <div className="flex flex-col items-center sm:items-end gap-1.5 w-full sm:w-auto">
          <button
            onClick={handleCheer}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-lg ${
              cheered
                ? 'bg-rose-500 text-white scale-105'
                : 'bg-gradient-to-r from-rose-500/80 to-rose-600 hover:from-rose-500 hover:to-rose-500 text-white shadow-rose-500/20'
            }`}
          >
            <Heart className={`w-4 h-4 fill-white ${cheered ? 'animate-ping' : ''}`} />
            <span>따뜻한 응원 보내기 ({cheerCount})</span>
          </button>
          <span className="text-[11px] text-slate-400">
            클릭하여 구출 하트를 보내주세요! 🛟
          </span>
        </div>
      </div>
    </div>
  );
};

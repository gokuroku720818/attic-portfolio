import React, { useEffect } from 'react';
import { RankedMember } from '../types';
import { formatPercent } from '../utils/calculations';
import { triggerGoldConfetti } from '../utils/confetti';
import { Trophy, Medal, Sparkles } from 'lucide-react';

interface PodiumProps {
  rankedMembers: RankedMember[];
  onSelectMember: (memberId: string) => void;
}

export const Podium: React.FC<PodiumProps> = ({ rankedMembers, onSelectMember }) => {
  const first = rankedMembers.find((r) => r.rank === 1);
  const second = rankedMembers.find((r) => r.rank === 2);
  const third = rankedMembers.find((r) => r.rank === 3);

  // 컴포넌트 마운트 시 최초 1회 가벼운 축하
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerGoldConfetti();
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-amber-500/20 p-6 sm:p-8 shadow-2xl">
      {/* 백그라운드 앰버 스포트라이트 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 blur-[100px] pointer-events-none" />

      {/* 헤더 */}
      <div className="text-center mb-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
          <Trophy className="w-3.5 h-3.5" />
          <span>다락방 명예의 전당 (Top 3)</span>
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          현재 수익률 <span className="text-amber-400">챔피언 시상대</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          1위 트로피를 누르면 황금 폭죽이 터집니다! 팡파르를 울려보세요 🎊
        </p>
      </div>

      {/* 시상대 그리드: 2위 (좌) - 1위 (중) - 3위 (우) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-6 items-end max-w-3xl mx-auto pt-6 pb-2 relative z-10">
        {/* 2위 (은메달) */}
        {second && (
          <div
            onClick={() => onSelectMember(second.member.id)}
            className="flex flex-col items-center cursor-pointer group transition-transform hover:-translate-y-1"
          >
            {/* 프로필 & 메달 */}
            <div className="relative mb-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-slate-700 to-slate-800 border-2 border-slate-400 flex items-center justify-center text-3xl sm:text-4xl shadow-lg group-hover:scale-105 transition">
                {second.member.avatar}
              </div>
              <div className="absolute -bottom-2 -right-1 w-7 h-7 rounded-full bg-slate-300 text-slate-900 flex items-center justify-center font-black text-xs shadow-md border-2 border-slate-900">
                2
              </div>
            </div>

            <div className="text-center mb-2 px-1">
              <div className="text-xs sm:text-sm font-bold text-slate-200 truncate max-w-[90px] sm:max-w-none">
                {second.member.name}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400 truncate">
                {second.badges[0]?.label || '다락방 멍거'}
              </div>
              <div className="text-xs sm:text-base font-black text-rose-400 mt-0.5">
                {formatPercent(second.metrics.profitRate)}
              </div>
            </div>

            {/* 시상대 단상 (중간 높이) */}
            <div className="w-full h-24 sm:h-32 rounded-t-2xl bg-gradient-to-t from-slate-800 to-slate-700/80 border-t-2 border-x-2 border-slate-400/50 flex flex-col items-center justify-center shadow-lg">
              <Medal className="w-6 h-6 sm:w-8 sm:h-8 text-slate-300" />
              <span className="text-[11px] sm:text-xs font-bold text-slate-300 mt-1">2nd</span>
              <span className="text-[10px] text-slate-400 font-medium hidden sm:block">
                수익률 2위
              </span>
            </div>
          </div>
        )}

        {/* 1위 (금메달 / 트로피 - 제일 높음) */}
        {first && (
          <div
            onClick={() => {
              triggerGoldConfetti();
              onSelectMember(first.member.id);
            }}
            className="flex flex-col items-center cursor-pointer group transition-transform hover:-translate-y-2 relative -top-4"
          >
            {/* 왕관 & 반짝이 */}
            <div className="text-2xl animate-bounce mb-1">👑</div>

            <div className="relative mb-2">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-600 border-4 border-amber-300 flex items-center justify-center text-4xl sm:text-5xl shadow-xl shadow-amber-500/30 group-hover:scale-105 transition">
                {first.member.avatar}
              </div>
              <div className="absolute -bottom-2 -right-1 w-8 h-8 rounded-full bg-gradient-to-r from-amber-300 to-yellow-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-md border-2 border-slate-900">
                1
              </div>
            </div>

            <div className="text-center mb-2 px-1">
              <div className="text-sm sm:text-base font-black text-amber-300 truncate max-w-[100px] sm:max-w-none">
                {first.member.name}
              </div>
              <div className="text-[10px] sm:text-xs text-amber-400/80 font-semibold truncate">
                {first.badges[0]?.label || '다락방 워런 버핏'}
              </div>
              <div className="text-sm sm:text-xl font-black text-rose-400 mt-0.5 animate-pulse">
                {formatPercent(first.metrics.profitRate)}
              </div>
            </div>

            {/* 시상대 단상 (가장 높음) */}
            <div className="w-full h-32 sm:h-44 rounded-t-2xl bg-gradient-to-t from-amber-950 to-amber-800/90 border-t-4 border-x-2 border-amber-400 flex flex-col items-center justify-center shadow-2xl shadow-amber-500/20">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300 drop-shadow" />
              <span className="text-xs sm:text-sm font-black text-amber-200 mt-1">1st Champion</span>
              <span className="text-[11px] sm:text-xs text-amber-300/80 font-bold hidden sm:block">
                수익률 1위 챔피언
              </span>
            </div>
          </div>
        )}

        {/* 3위 (동메달) */}
        {third && (
          <div
            onClick={() => onSelectMember(third.member.id)}
            className="flex flex-col items-center cursor-pointer group transition-transform hover:-translate-y-1"
          >
            <div className="relative mb-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-amber-900 to-slate-800 border-2 border-amber-700 flex items-center justify-center text-3xl sm:text-4xl shadow-lg group-hover:scale-105 transition">
                {third.member.avatar}
              </div>
              <div className="absolute -bottom-2 -right-1 w-7 h-7 rounded-full bg-amber-700 text-amber-100 flex items-center justify-center font-black text-xs shadow-md border-2 border-slate-900">
                3
              </div>
            </div>

            <div className="text-center mb-2 px-1">
              <div className="text-xs sm:text-sm font-bold text-slate-200 truncate max-w-[90px] sm:max-w-none">
                {third.member.name}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400 truncate">
                {third.badges[0]?.label || '다락방 린치'}
              </div>
              <div className="text-xs sm:text-base font-black text-rose-400 mt-0.5">
                {formatPercent(third.metrics.profitRate)}
              </div>
            </div>

            {/* 시상대 단상 (낮음) */}
            <div className="w-full h-18 sm:h-24 rounded-t-2xl bg-gradient-to-t from-slate-900 to-slate-800/80 border-t-2 border-x-2 border-amber-700/50 flex flex-col items-center justify-center shadow-lg">
              <Medal className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
              <span className="text-[11px] sm:text-xs font-bold text-amber-500 mt-1">3rd</span>
              <span className="text-[10px] text-slate-400 font-medium hidden sm:block">
                수익률 3위
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

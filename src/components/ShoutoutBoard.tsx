import React, { useState } from 'react';
import { useAtticStore } from '../context/AtticContext';
import { Volume2, MessageSquarePlus, Heart, Sparkles } from 'lucide-react';
import { NewShoutoutModal } from './NewShoutoutModal';

export const ShoutoutBoard: React.FC = () => {
  const { shoutouts, reactToShoutout } = useAtticStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const latestShoutout = shoutouts[0];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 mt-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 p-4 sm:p-5 shadow-lg">
        {/* 장식용 글로우 */}
        <div className="absolute top-0 right-0 w-64 h-32 bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* 전광판 헤더 및 최신 사자후 */}
          <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex-shrink-0 animate-pulse">
              <Volume2 className="w-5 h-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <span>다락방 실시간 사자후</span>
                  <Sparkles className="w-3 h-3" />
                </span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  • 멤버들의 실시간 한마디
                </span>
              </div>

              {latestShoutout ? (
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-200 flex items-center gap-1">
                    <span>{latestShoutout.avatar}</span>
                    <span className="text-amber-200">{latestShoutout.memberName}:</span>
                  </span>
                  <p className="text-sm text-slate-100 font-medium tracking-tight bg-slate-800/60 px-2.5 py-0.5 rounded-md border border-slate-700/60">
                    "{latestShoutout.message}"
                  </p>
                  <button
                    onClick={() => reactToShoutout(latestShoutout.id)}
                    className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/20 transition ml-1"
                    title="공감하기"
                  >
                    <Heart className="w-3 h-3 fill-rose-400" />
                    <span>{latestShoutout.reactionCount}</span>
                  </button>
                </div>
              ) : (
                <p className="text-sm text-slate-400 mt-1">아직 등록된 사자후가 없습니다. 첫 한마디를 외쳐보세요!</p>
              )}
            </div>
          </div>

          {/* 사자후 외치기 버튼 */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs sm:text-sm font-bold transition shadow-sm"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>나도 한마디 외치기 📣</span>
          </button>
        </div>

        {/* 최근 사자후 히스토리 가로 스크롤 (모바일/데스크탑) */}
        {shoutouts.length > 1 && (
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-3 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-500 flex-shrink-0 font-medium">최근 외침:</span>
            {shoutouts.slice(1, 6).map((item) => (
              <div
                key={item.id}
                className="flex-shrink-0 flex items-center gap-1.5 bg-slate-800/40 border border-slate-700/40 px-2.5 py-1 rounded-lg text-slate-300"
              >
                <span>{item.avatar}</span>
                <span className="text-slate-400 font-semibold">{item.memberName}:</span>
                <span className="truncate max-w-[200px]">{item.message}</span>
                <button
                  onClick={() => reactToShoutout(item.id)}
                  className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-0.5 ml-1"
                >
                  ❤️ {item.reactionCount}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && <NewShoutoutModal onClose={() => setIsModalOpen(false)} />}
    </section>
  );
};

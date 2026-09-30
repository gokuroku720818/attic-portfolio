import React from 'react';
import { useAtticStore } from '../context/AtticContext';
import { RefreshCw, UserCheck, Sparkles, RotateCcw } from 'lucide-react';

interface HeaderProps {
  onOpenManageModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenManageModal }) => {
  const { activeMember, logout, refreshPrices, isRefreshing, resetData } = useAtticStore();

  const handleReset = () => {
    if (window.confirm('정말 14명의 초기 샘플 데이터로 복구하시겠습니까?')) {
      resetData();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-amber-500/20 px-4 py-3 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* 로고 & 타이틀 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20">
            🏠
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                다락방<span className="text-amber-400">포트폴리오</span>
              </h1>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                15 Members
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              주식과 부동산 평단가로 겨루는 우리들만의 실시간 수익률 랭킹
            </p>
          </div>
        </div>

        {/* 우측 액션 버튼들 */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* 시세 새로고침 버튼 */}
          <button
            onClick={() => refreshPrices()}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
            title="실시간 시세 갱신"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span className="hidden md:inline">{isRefreshing ? '조회 중...' : '시세 갱신'}</span>
          </button>

          {/* 샘플 초기화 버튼 */}
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 border border-slate-700/50 transition"
            title="초기 14인 데이터로 리셋"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* 현재 로그인된 멤버 표시 또는 포트폴리오 관리 버튼 */}
          {activeMember ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
              <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-950/40 border border-amber-600/30 px-2.5 py-1 rounded-lg">
                <span>{activeMember.avatar}</span>
                <span className="font-bold">{activeMember.name}</span>
                <UserCheck className="w-3 h-3 text-emerald-400" />
              </div>
              <button
                onClick={onOpenManageModal}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                자산 관리
              </button>
              <button
                onClick={logout}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenManageModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs sm:text-sm font-bold shadow-md shadow-amber-500/20 transition"
            >
              <span>🔑</span>
              <span>내 포트폴리오 관리</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

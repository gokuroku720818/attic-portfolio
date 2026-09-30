import React, { useState } from 'react';
import { useAtticStore } from '../context/AtticContext';
import { RefreshCw, UserCheck, Sparkles, RotateCcw, ShieldAlert, Lock, X } from 'lucide-react';

interface HeaderProps {
  onOpenManageModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenManageModal }) => {
  const { members, activeMember, logout, refreshPrices, isRefreshing, refreshMessage, saveMessage, resetDataByHost } = useAtticStore();
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  const [hostPinInput, setHostPinInput] = useState('');
  const [hostError, setHostError] = useState('');

  const handleOpenHostModal = () => {
    setHostPinInput('');
    setHostError('');
    setIsHostModalOpen(true);
  };

  const handleConfirmHostReset = (e: React.FormEvent) => {
    e.preventDefault();
    const res = resetDataByHost(hostPinInput);
    if (res.success) {
      alert(res.message);
      setIsHostModalOpen(false);
    } else {
      setHostError(res.message);
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
                {members.length} Members
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              주식과 부동산 평단가로 겨루는 우리들만의 수익률 랭킹
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
            title="최신 수집 시세 확인"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isRefreshing ? '조회 중...' : '시세 갱신'}</span>
          </button>

          {/* 호스트(명왕) 전용 데이터 초기화 버튼 */}
          <button
            onClick={handleOpenHostModal}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-700/60 hover:border-rose-500/30 text-xs transition"
            title="호스트(명왕) 전용 데이터 초기화"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px] font-semibold">호스트 초기화</span>
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

      <p role="status" aria-live="polite" className="max-w-7xl mx-auto mt-2 text-xs text-slate-400">{refreshMessage}{saveMessage && <span className="ml-3 text-amber-300">{saveMessage}</span>}</p>
      {/* 호스트(명왕) 초기화 인증 모달 */}
      {isHostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm bg-slate-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => setIsHostModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-white">호스트(명왕) 전용 초기화</h3>
              <p className="text-xs text-slate-400 mt-1">
                데이터 초기화는 오직 <strong className="text-amber-400">호스트(명왕)</strong>의 비밀번호가 있어야만 실행할 수 있습니다.
              </p>
            </div>

            <form onSubmit={handleConfirmHostReset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 text-center">
                  명왕 호스트 비밀번호 (4자리)
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={hostPinInput}
                  onChange={(e) => {
                    setHostPinInput(e.target.value);
                    setHostError('');
                  }}
                  placeholder="••••"
                  autoFocus
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-center text-slate-100 tracking-widest text-lg font-mono focus:outline-none focus:border-rose-400"
                />
              </div>

              {hostError && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{hostError}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsHostModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20 transition"
                >
                  초기화 실행
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

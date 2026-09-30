import React, { useState } from 'react';
import { useAtticStore } from '../context/AtticContext';
import { Asset } from '../types';
import { AssetForm } from './AssetForm';
import { calculateAssetMetrics, formatCurrency, formatPercent } from '../utils/calculations';
import {
  X,
  Lock,
  KeyRound,
  Plus,
  Trash2,
  Edit3,
  LogOut,
  CheckCircle,
  ShieldAlert,
  Sparkles,
  Key,
} from 'lucide-react';

interface ManagePortfolioModalProps {
  onClose: () => void;
}

export const ManagePortfolioModal: React.FC<ManagePortfolioModalProps> = ({ onClose }) => {
  const {
    members,
    assets,
    activeMember,
    loginMember,
    logout,
    checkIsPinSet,
    setupNewPin,
    addOrUpdateAsset,
    deleteAsset,
  } = useAtticStore();

  // 로그인 폼 상태
  const [selectedMemberId, setSelectedMemberId] = useState(
    activeMember ? activeMember.id : members[0]?.id || ''
  );
  const [pinInput, setPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // 비밀번호 변경 모드
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPinChangeInput, setNewPinChangeInput] = useState('');

  // 자산 수정/추가 폼 상태
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const selectedMember = members.find((m) => m.id === selectedMemberId);
  const isPinAlreadySet = selectedMember ? checkIsPinSet(selectedMember.id) : true;
  const isHost = selectedMember?.name === '명왕';

  // 최초 비밀번호 설정 처리
  const handleSetupInitialPin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    if (pinInput.length !== 4 || !/^\d{4}$/.test(pinInput)) {
      setPinError('비밀번호는 숫자 4자리여야 합니다.');
      return;
    }

    if (pinInput !== confirmPinInput) {
      setPinError('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    const success = setupNewPin(selectedMemberId, pinInput);
    if (success) {
      setPinInput('');
      setConfirmPinInput('');
      setSuccessNotice('비밀번호가 성공적으로 설정되었습니다!');
    } else {
      setPinError('비밀번호 설정 중 오류가 발생했습니다.');
    }
  };

  // 기존 비밀번호 로그인 처리
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    const success = loginMember(selectedMemberId, pinInput.trim());
    if (success) {
      setPinInput('');
      setConfirmPinInput('');
    } else {
      setPinError('비밀번호가 일치하지 않습니다! 다시 확인해주세요.');
    }
  };

  // 로그인 상태에서 비밀번호 변경
  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinChangeInput.length !== 4 || !/^\d{4}$/.test(newPinChangeInput)) {
      alert('비밀번호는 숫자 4자리여야 합니다.');
      return;
    }
    if (activeMember) {
      setupNewPin(activeMember.id, newPinChangeInput);
      alert('비밀번호가 안전하게 변경되었습니다!');
      setIsChangingPin(false);
      setNewPinChangeInput('');
    }
  };

  // 자산 삭제 확인
  const handleDelete = (asset: Asset) => {
    if (window.confirm(`'${asset.name}' 종목을 정말 삭제하시겠습니까?`)) {
      deleteAsset(asset.id);
    }
  };

  const currentMemberAssets = activeMember
    ? assets.filter((a) => a.memberId === activeMember.id)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {!activeMember ? (
          /* 1. 멤버 인증 및 최초 비밀번호 설정 뷰 */
          <div className="max-w-md mx-auto py-6">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-3">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-white">포트폴리오 관리자 인증</h3>
              <p className="text-xs text-slate-400 mt-1">
                본인 이름을 선택하고 비밀번호를 입력해주세요.
              </p>
            </div>

            {/* 멤버 선택 드롭다운 */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                멤버 선택
              </label>
              <select
                value={selectedMemberId}
                onChange={(e) => {
                  setSelectedMemberId(e.target.value);
                  setPinInput('');
                  setConfirmPinInput('');
                  setPinError('');
                  setSuccessNotice('');
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.avatar} {m.name} {m.name === '명왕' ? '👑 (호스트)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* 조건부 렌더링: 최초 비밀번호 설정 폼 VS 기존 로그인 폼 */}
            {!isPinAlreadySet && !isHost ? (
              /* A. 최초 비밀번호 설정 (본인이 직접 설정) */
              <form onSubmit={handleSetupInitialPin} className="space-y-4 bg-amber-950/20 border border-amber-500/30 p-4 rounded-2xl">
                <div className="text-center">
                  <span className="text-xs font-black text-amber-300 flex items-center justify-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>첫 방문입니다! 사용할 4자리 비밀번호를 설정해주세요</span>
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    설정한 비밀번호는 앞으로 본인 자산 관리 시 사용됩니다.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    새 4자리 비밀번호
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      setPinError('');
                    }}
                    placeholder="••••"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-center text-slate-100 tracking-widest text-lg font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    비밀번호 확인 (재입력)
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={confirmPinInput}
                    onChange={(e) => {
                      setConfirmPinInput(e.target.value);
                      setPinError('');
                    }}
                    placeholder="••••"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-center text-slate-100 tracking-widest text-lg font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                {pinError && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                    <span>{pinError}</span>
                  </div>
                )}

                {successNotice && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{successNotice}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition"
                >
                  비밀번호 설정 및 관리 시작
                </button>
              </form>
            ) : (
              /* B. 이미 비밀번호가 설정된 멤버 (명왕 포함) */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    4자리 비밀번호
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      maxLength={4}
                      value={pinInput}
                      onChange={(e) => {
                        setPinInput(e.target.value);
                        setPinError('');
                      }}
                      placeholder="••••"
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-center text-slate-100 tracking-widest text-lg font-mono focus:outline-none focus:border-amber-400"
                    />
                    <KeyRound className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
                  </div>
                </div>

                {pinError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                    <span>{pinError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition mt-2"
                >
                  인증하고 관리 시작하기
                </button>
              </form>
            )}
          </div>
        ) : (
          /* 2. 자산 관리 뷰 (로그인 완료 후) */
          <div>
            {/* 인증된 멤버 정보 바 */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl">
                  {activeMember.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-lg font-black text-white">{activeMember.name}의 계좌</h3>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    {activeMember.name === '명왕' && (
                      <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-black">
                        HOST
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    등록된 종목 {currentMemberAssets.length}개
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsChangingPin(!isChangingPin)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-amber-300 border border-slate-700 transition"
                  title="비밀번호 변경"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">비밀번호 변경</span>
                </button>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>로그아웃</span>
                </button>
              </div>
            </div>

            {/* 비밀번호 변경 팝업창 (토글 시) */}
            {isChangingPin && (
              <form onSubmit={handleChangePinSubmit} className="mb-6 p-4 rounded-2xl bg-slate-800/80 border border-amber-500/40 flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    새 4자리 비밀번호 입력
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newPinChangeInput}
                    onChange={(e) => setNewPinChangeInput(e.target.value)}
                    placeholder="••••"
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-center text-slate-100 font-mono tracking-widest text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="flex items-center gap-2 self-end w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsChangingPin(false)}
                    className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-slate-700 text-xs text-slate-300"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow"
                  >
                    변경 저장
                  </button>
                </div>
              </form>
            )}

            {/* 새 종목 추가 버튼 */}
            {!isFormOpen && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => {
                    setEditingAsset(null);
                    setIsFormOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold shadow-md transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>새 종목/부동산 추가하기</span>
                </button>
              </div>
            )}

            {/* 입력/수정 폼 */}
            {isFormOpen && (
              <div className="mb-6">
                <AssetForm
                  memberId={activeMember.id}
                  initialAsset={editingAsset}
                  onSave={(asset) => {
                    addOrUpdateAsset(asset);
                    setIsFormOpen(false);
                    setEditingAsset(null);
                  }}
                  onCancel={() => {
                    setIsFormOpen(false);
                    setEditingAsset(null);
                  }}
                />
              </div>
            )}

            {/* 보유 자산 목록 테이블 */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                현재 등록된 보유 자산 목록
              </h4>

              {currentMemberAssets.length === 0 ? (
                <div className="p-8 text-center bg-slate-800/30 rounded-2xl border border-dashed border-slate-700 text-slate-400 text-xs">
                  아직 등록된 자산이 없습니다. 위 버튼을 눌러 첫 종목을 추가해보세요!
                </div>
              ) : (
                currentMemberAssets.map((asset) => {
                  const itemMetrics = calculateAssetMetrics(asset);
                  const isPositive = itemMetrics.profit >= 0;

                  return (
                    <div
                      key={asset.id}
                      className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-600 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {asset.type === 'real_estate'
                            ? '🏢'
                            : asset.type === 'crypto'
                            ? '⚡'
                            : '📈'}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-slate-100">
                              {asset.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({asset.type})
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            매수 평단 {formatCurrency(asset.buyPrice)} • {asset.quantity}주/개 • 현재 시세 {formatCurrency(asset.currentPrice)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700/40">
                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-200">
                            {formatCurrency(itemMetrics.currentValue)}
                          </div>
                          <div
                            className={`text-xs font-bold ${
                              isPositive ? 'text-rose-400' : 'text-blue-400'
                            }`}
                          >
                            {formatPercent(itemMetrics.profitRate)}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 pl-2 border-l border-slate-700">
                          <button
                            onClick={() => {
                              setEditingAsset(asset);
                              setIsFormOpen(true);
                            }}
                            className="p-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition"
                            title="수정"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(asset)}
                            className="p-2 rounded-lg bg-slate-700/60 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition"
                            title="삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

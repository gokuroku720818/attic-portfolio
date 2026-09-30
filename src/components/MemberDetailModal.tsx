import React, { useState } from 'react';
import { AssetForm } from './AssetForm';
import { PerformanceHistory } from './PerformanceHistory';
import { RankedMember, Asset } from '../types';
import { calculateAssetMetrics, formatCurrency, formatPercent } from '../utils/calculations';
import { useAtticStore } from '../context/AtticContext';
import { PortfolioPieChart } from './PortfolioPieChart';
import { X, Lock } from 'lucide-react';

interface MemberDetailModalProps {
  rankedMember: RankedMember;
  assets: Asset[];
  onClose: () => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  rankedMember,
  assets,
  onClose,
}) => {
  const { activeMember, addOrUpdateAsset } = useAtticStore();
  const [editingAsset,setEditingAsset] = useState<Asset|null>(null);
  const { member, metrics, rank, badges } = rankedMember;
  const isPositive = metrics.profitRate >= 0;

  const isHost = activeMember?.name === '명왕';
  const isSelf = activeMember?.id === member.id;
  const canViewCapital = isHost || isSelf;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 상단 프로필 헤더 */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-6 border-b border-slate-800">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-700 border-2 border-amber-500/40 flex items-center justify-center text-4xl shadow-xl flex-shrink-0">
            {member.avatar}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                랭킹 {rank}위
              </span>
              <h2 className="text-2xl font-black text-white">{member.name}</h2>
              <span className="text-xs text-slate-400 font-medium">
                ({member.role || '멤버'})
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 mt-1 italic">
              "{member.bio || '다락방에서 성투를 꿈꿉니다.'}"
            </p>

            {/* 획득 칭호들 */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mt-3">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-800 text-amber-300 border border-amber-500/20 shadow-sm"
                  title={b.description}
                >
                  <span>{b.emoji}</span>
                  <span>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {editingAsset && <div className="mt-4"><AssetForm memberId={member.id} initialAsset={editingAsset} onSave={asset=>{addOrUpdateAsset(asset);setEditingAsset(null);}} onCancel={()=>setEditingAsset(null)} /></div>}
        <PerformanceHistory memberId={member.id} />

        {/* 호스트 전용 안내 띠 (호스트가 타인의 상세를 볼 때) */}
        {isHost && !isSelf && (
          <div className="mt-4 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <span className="text-sm">👑</span>
            <span>호스트(명왕) 권한으로 개인 투자금액 및 상세 수량을 열람 중입니다.</span>
          </div>
        )}

        {/* 핵심 메트릭 요약 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-6">
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
            <div className="text-[11px] text-slate-400 font-medium">총 평가 자산</div>
            <div className="text-sm sm:text-base font-black text-slate-100 mt-0.5">
              {canViewCapital ? (
                formatCurrency(metrics.totalCurrentValue)
              ) : (
                <span className="text-xs text-slate-500 font-semibold flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" /> 비공개
                </span>
              )}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
            <div className="text-[11px] text-slate-400 font-medium">총 투자 원금</div>
            <div className="text-sm sm:text-base font-black text-slate-300 mt-0.5">
              {canViewCapital ? (
                formatCurrency(metrics.totalInvested)
              ) : (
                <span className="text-xs text-slate-500 font-semibold flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" /> 비공개
                </span>
              )}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
            <div className="text-[11px] text-slate-400 font-medium">평가 손익</div>
            <div
              className={`text-sm sm:text-base font-black mt-0.5 ${
                isPositive ? 'text-rose-400' : 'text-blue-400'
              }`}
            >
              {canViewCapital ? (
                formatCurrency(metrics.totalProfit)
              ) : (
                <span className="text-xs text-slate-500 font-semibold flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" /> 비공개
                </span>
              )}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
            <div className="text-[11px] text-slate-400 font-medium">총 수익률</div>
            <div
              className={`text-sm sm:text-base font-black mt-0.5 ${
                isPositive ? 'text-rose-400' : 'text-blue-400'
              }`}
            >
              {formatPercent(metrics.profitRate)}
            </div>
          </div>
        </div>

        {/* 자산군 도넛 차트 */}
        <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/40 mb-6">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            포트폴리오 비중
          </div>
          <PortfolioPieChart
            breakdown={metrics.assetBreakdown}
            total={metrics.totalCurrentValue}
          />
        </div>

        {/* 상세 보유 종목 리스트 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-black text-slate-200 flex items-center gap-1.5">
              <span>보유 종목 내역 ({assets.length}개)</span>
            </h4>
            <span className="text-[11px] text-slate-400">
              부동산 및 주식 평단가 비교
            </span>
          </div>

          <div className="space-y-2.5">
            {assets.map((asset) => {
              const itemMetrics = calculateAssetMetrics(asset);
              const itemPositive = itemMetrics.profit >= 0;

              return (
                <div
                  key={asset.id}
                  className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  {/* 종목 기본정보 */}
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {asset.type === 'real_estate'
                        ? '🏢'
                        : asset.type === 'crypto'
                        ? '⚡'
                        : asset.type === 'us_stock'
                        ? '🗽'
                        : '🇰🇷'}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-100">
                          {asset.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {asset.symbol}
                        </span>
                        {canViewCapital && <button className="text-[10px] px-2 py-1 rounded border border-amber-500/30 text-amber-300" onClick={()=>setEditingAsset(asset)}>시세·자산 수정</button>}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {asset.priceSource || (asset.type === 'real_estate' || asset.type === 'cash' ? '수동 평가' : '시세 미확인')} · 기준 {Number.isFinite(Date.parse(asset.updatedAt)) ? new Date(asset.updatedAt).toLocaleString('ko-KR', {timeZone:'Asia/Seoul'}) : '미확인'}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        매수 평단 {formatCurrency(asset.buyPrice)}
                        {canViewCapital && (
                          <span className="text-slate-300 font-semibold ml-1.5">
                            • {asset.quantity}주/개
                          </span>
                        )}
                        {asset.memo && (
                          <span className="text-amber-400/80 ml-1.5 italic">
                            "{asset.memo}"
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 시세/평가액(권한별) 및 수익률 */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-700/40">
                    <div>
                      <div className="text-[11px] text-slate-400">
                        {canViewCapital ? '현재 평가액' : '현재 시세'}
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-200">
                        {canViewCapital
                          ? formatCurrency(itemMetrics.currentValue)
                          : formatCurrency(asset.currentPrice)}
                      </div>
                    </div>

                    <div className="min-w-[70px]">
                      <div className="text-[11px] text-slate-400">수익률</div>
                      <div
                        className={`text-xs sm:text-sm font-black ${
                          itemPositive ? 'text-rose-400' : 'text-blue-400'
                        }`}
                      >
                        {formatPercent(itemMetrics.profitRate)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

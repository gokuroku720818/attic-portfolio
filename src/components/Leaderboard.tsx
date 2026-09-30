import React, { lazy, Suspense, useState, useMemo } from 'react';
import { useAtticStore } from '../context/AtticContext';
import { LeaderboardCard } from './LeaderboardCard';
const MemberDetailModal = lazy(() => import('./MemberDetailModal').then(module => ({ default: module.MemberDetailModal })));
import { Award } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const { rankedMembers, assets, members } = useAtticStore();
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  // 정렬 및 필터링된 멤버 목록 (수익률 순위로 유지)
  const displayMembers = useMemo(() => {
    let list = [...rankedMembers];

    // 필터
    if (filterType === 'real_estate') {
      list = list.filter((r) => r.metrics.assetBreakdown.real_estate > 0);
    } else if (filterType === 'crypto') {
      list = list.filter((r) => r.metrics.assetBreakdown.crypto > 0);
    } else if (filterType === 'positive') {
      list = list.filter((r) => r.metrics.profitRate > 0);
    } else if (filterType === 'negative') {
      list = list.filter((r) => r.metrics.profitRate < 0);
    }

    // 수익률 순으로 정렬
    list.sort((a, b) => b.metrics.profitRate - a.metrics.profitRate);

    return list;
  }, [rankedMembers, filterType]);

  const selectedMemberData = rankedMembers.find((r) => r.member.id === selectedMemberId);

  return (
    <section className="max-w-7xl mx-auto mt-5 mb-10">
      {/* 랭킹 타이틀 및 컨트롤 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Award className="w-5 h-5" />
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              다락방 <span className="text-amber-400">수익률 리그전</span>
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-bold">
              {displayMembers.length}명
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            멤버를 클릭하면 종목별 비중 차트와 상세 평단가를 확인할 수 있습니다.
          </p>
        </div>

        {/* 필터 그룹 */}
        <div className="flex flex-wrap items-center gap-2">

          {/* 태그 필터 */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-800/80 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-amber-400"
          >
            <option value="all">참가 멤버 ({rankedMembers.length}명)</option>
            <option value="real_estate">🏢 부동산 보유자</option>
            <option value="crypto">⚡ 코인 보유자</option>
            <option value="positive">📈 수익권 멤버</option>
            <option value="negative">🥶 냉동/손실 멤버</option>
          </select>
        </div>
      </div>

      {/* 랭킹 카드 리스트 */}
      <div className="space-y-3">
        {displayMembers.map((rm) => {
          const memberAssets = assets.filter((a) => a.memberId === rm.member.id);
          return (
            <LeaderboardCard
              key={rm.member.id}
              rankedMember={rm}
              memberAssets={memberAssets}
              onSelect={() => setSelectedMemberId(rm.member.id)}
            />
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border border-slate-800 p-4 text-sm text-slate-400">
        <p className="font-bold mb-2">참가 대기 · 자산 등록 후 순위에 반영됩니다</p>
        <div className="flex flex-wrap gap-2">{members.filter(m => !rankedMembers.some(r => r.member.id === m.id)).map(m => <span key={m.id} className="bg-slate-800 px-3 py-1 rounded-lg">{m.avatar} {m.name}</span>)}</div>
      </div>
      {/* 멤버 상세 포트폴리오 모달 */}
      {selectedMemberData && (
        <Suspense fallback={<p role="status" className="fixed bottom-5 right-5 z-50 bg-slate-800 p-3 rounded-xl">상세 화면을 불러오는 중…</p>}><MemberDetailModal
          rankedMember={selectedMemberData}
          assets={assets.filter((a) => a.memberId === selectedMemberData.member.id)}
          onClose={() => setSelectedMemberId(null)}
        /></Suspense>
      )}
    </section>
  );
};

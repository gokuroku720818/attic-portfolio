import { useState } from 'react';
import { AtticProvider, useAtticStore } from './context/AtticContext';
import { Header } from './components/Header';
import { AtticStatsTicker } from './components/AtticStatsTicker';
import { ShoutoutBoard } from './components/ShoutoutBoard';
import { Podium } from './components/Podium';
import { RescueStation } from './components/RescueStation';
import { Leaderboard } from './components/Leaderboard';
import { ManagePortfolioModal } from './components/ManagePortfolioModal';
import { MemberDetailModal } from './components/MemberDetailModal';

function AtticAppContent() {
  const { rankedMembers, assets, members } = useAtticStore();
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedDetailMemberId, setSelectedDetailMemberId] = useState<string | null>(null);

  const bottomMember = rankedMembers.length > 0 ? rankedMembers[rankedMembers.length - 1] : undefined;
  const detailMemberData = rankedMembers.find((r) => r.member.id === selectedDetailMemberId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* 1. 글로벌 네비게이션 헤더 */}
      <Header onOpenManageModal={() => setIsManageModalOpen(true)} />

      {/* 2. 핵심 지표 티커 */}
      <AtticStatsTicker />

      {/* 3. 실시간 사자후 전광판 */}
      <ShoutoutBoard />

      {/* 4. 메인 컨텐츠 영역 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-4 space-y-5">
        {/* 상단 듀얼 섹션: 시상대 & 꼴찌 구출석 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Podium
              rankedMembers={rankedMembers}
              onSelectMember={(memberId) => setSelectedDetailMemberId(memberId)}
            />
          </div>
          <div className="flex flex-col justify-center">
            <RescueStation
              bottomMember={bottomMember}
              onSelectMember={(memberId) => setSelectedDetailMemberId(memberId)}
            />
          </div>
        </div>

        {/* 5. 14인 전체 랭킹 리그전 */}
        <Leaderboard />
      </main>

      {/* 6. 다락방 푸터 */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">🏠 다락방포트폴리오</span>
            <span>• {members.length}명의 성투와 우정을 응원합니다</span>
          </div>
          <div>
            Built with React, TypeScript & Tailwind CSS • Powered by GitHub Pages
          </div>
        </div>
      </footer>

      {/* 7. 포트폴리오 관리 모달 */}
      {isManageModalOpen && (
        <ManagePortfolioModal onClose={() => setIsManageModalOpen(false)} />
      )}

      {/* 8. 멤버 상세 모달 (시상대나 구출석에서 클릭 시) */}
      {detailMemberData && (
        <MemberDetailModal
          rankedMember={detailMemberData}
          assets={assets.filter((a) => a.memberId === detailMemberData.member.id)}
          onClose={() => setSelectedDetailMemberId(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AtticProvider>
      <AtticAppContent />
    </AtticProvider>
  );
}

import { Asset, Member, RankedMember } from '../types';
import { calculateMemberMetrics } from './calculations';
import { assignMemberBadges } from './badges';

export { assignMemberBadges };

/**
 * 멤버 목록과 보유 자산을 받아 수익률 기준 랭킹 및 칭호가 포함된 RankedMember 배열을 생성합니다.
 * Review Focus 4: 수익률이 완전히 동일할 경우 총 평가 자산 규모로 타이브레이킹합니다.
 */
export function calculateRankings(members: Member[], assets: Asset[]): RankedMember[] {
  if (!members || members.length === 0) return [];

  // 1. 모든 멤버의 메트릭 산출
  const listWithMetrics = members.map((member) => ({
    member,
    metrics: calculateMemberMetrics(member, assets),
  })).filter((item) => item.metrics.totalInvested > 0);

  // 2. 정렬: 수익률 내림차순 -> 총 자산 내림차순 -> 이름 오름차순
  listWithMetrics.sort((a, b) => {
    if (Math.abs(b.metrics.profitRate - a.metrics.profitRate) > 0.0001) {
      return b.metrics.profitRate - a.metrics.profitRate;
    }
    if (Math.abs(b.metrics.totalCurrentValue - a.metrics.totalCurrentValue) > 0.01) {
      return b.metrics.totalCurrentValue - a.metrics.totalCurrentValue;
    }
    return a.member.name.localeCompare(b.member.name);
  });

  // 3. 자산 1위 멤버 찾기 (총 자산이 0보다 큰 경우에만)
  let maxAssetHolderId: string | null = null;
  let maxAssetValue = 0;
  for (const item of listWithMetrics) {
    if (item.metrics.totalCurrentValue > maxAssetValue) {
      maxAssetValue = item.metrics.totalCurrentValue;
      maxAssetHolderId = item.member.id;
    }
  }

  // 4. 순위 및 칭호 배지 할당
  const totalCount = listWithMetrics.length;
  return listWithMetrics.map((item, index) => {
    const rank = index + 1;
    const isTopAssetHolder = item.member.id === maxAssetHolderId;
    const badges = assignMemberBadges(item.metrics, rank, totalCount, isTopAssetHolder);

    return {
      member: item.member,
      metrics: item.metrics,
      rank,
      badges,
    };
  });
}

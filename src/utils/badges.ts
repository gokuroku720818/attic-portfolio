import { Badge, MemberMetrics } from '../types';

export const ALL_BADGE_DEFINITIONS: Record<string, Omit<Badge, 'id'>> = {
  RANK_1: {
    label: '다락방 워런 버핏',
    emoji: '👑',
    description: '현재 다락방 수익률 1위 챔피언! 살아있는 전설',
    type: 'rank',
  },
  RANK_2: {
    label: '다락방 찰리 멍거',
    emoji: '🥈',
    description: '수익률 2위! 흔들리지 않는 가치투자의 품격',
    type: 'rank',
  },
  RANK_3: {
    label: '다락방 피터 린치',
    emoji: '🥉',
    description: '수익률 3위! 생활 속 대박 종목 발굴러',
    type: 'rank',
  },
  BOTTOM: {
    label: '한강 수온 체크반장',
    emoji: '🛟',
    description: '현재 꼴찌... 멤버들의 따뜻한 구출과 위로가 시급함',
    type: 'rank',
  },
  MANSOOR: {
    label: '다락방 만수르',
    emoji: '💰',
    description: '다락방 전체 자산 규모 1위! 원금 깡패',
    type: 'special',
  },
  YOUNG_GGL: {
    label: '영끌 대마왕',
    emoji: '🏢',
    description: '총 자산 중 부동산 비중 70% 이상! 건물주의 꿈',
    type: 'asset',
  },
  BEAST_CRYPTO: {
    label: '야수형 불나방',
    emoji: '🚀',
    description: '총 자산 중 코인 비중 50% 이상! 화성 갈 거니까',
    type: 'asset',
  },
  WEST_ANT: {
    label: '잠 못 드는 서학개미',
    emoji: '🗽',
    description: '총 자산 중 미국 주식 비중 70% 이상! 뉴욕 시간 생체리듬',
    type: 'asset',
  },
  FROZEN_HUMAN: {
    label: '냉동인간 존버단',
    emoji: '🥶',
    description: '수익률 -20% 이하... 본전 올 때까지 해동 불가',
    type: 'special',
  },
  COMPOUND_WIZARD: {
    label: '복리의 마법사',
    emoji: '🧙‍♂️',
    description: '수익률 +100% 돌파! 원금 2배 달성자',
    type: 'special',
  },
};

/**
 * 멤버의 수익률, 순위, 자산 분포를 기반으로 획득 배지를 판정합니다.
 */
export function assignMemberBadges(
  metrics: MemberMetrics,
  rank: number,
  totalMembers: number,
  isTopAssetHolder: boolean
): Badge[] {
  const badges: Badge[] = [];

  // 순위 배지
  if (rank === 1) {
    badges.push({ id: 'rank-1', ...ALL_BADGE_DEFINITIONS.RANK_1 });
  } else if (rank === 2) {
    badges.push({ id: 'rank-2', ...ALL_BADGE_DEFINITIONS.RANK_2 });
  } else if (rank === 3) {
    badges.push({ id: 'rank-3', ...ALL_BADGE_DEFINITIONS.RANK_3 });
  }

  // 꼴찌 배지 (2명 이상일 때만 부여)
  if (rank === totalMembers && totalMembers > 1) {
    badges.push({ id: 'bottom-rank', ...ALL_BADGE_DEFINITIONS.BOTTOM });
  }

  // 만수르 (자산 1위)
  if (isTopAssetHolder) {
    badges.push({ id: 'mansoor', ...ALL_BADGE_DEFINITIONS.MANSOOR });
  }

  // 수익률 특수 배지
  if (metrics.profitRate >= 100) {
    badges.push({ id: 'wizard', ...ALL_BADGE_DEFINITIONS.COMPOUND_WIZARD });
  } else if (metrics.profitRate <= -20) {
    badges.push({ id: 'frozen', ...ALL_BADGE_DEFINITIONS.FROZEN_HUMAN });
  }

  // 자산 구성 배지
  if (metrics.totalCurrentValue > 0) {
    const reRatio = metrics.assetBreakdown.real_estate / metrics.totalCurrentValue;
    const cryptoRatio = metrics.assetBreakdown.crypto / metrics.totalCurrentValue;
    const usStockRatio = metrics.assetBreakdown.us_stock / metrics.totalCurrentValue;

    if (reRatio >= 0.7) {
      badges.push({ id: 'young-ggl', ...ALL_BADGE_DEFINITIONS.YOUNG_GGL });
    }
    if (cryptoRatio >= 0.5) {
      badges.push({ id: 'crypto-beast', ...ALL_BADGE_DEFINITIONS.BEAST_CRYPTO });
    }
    if (usStockRatio >= 0.7) {
      badges.push({ id: 'west-ant', ...ALL_BADGE_DEFINITIONS.WEST_ANT });
    }
  }

  return badges;
}

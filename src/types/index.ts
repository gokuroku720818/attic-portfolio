export type AssetType = 'kr_stock' | 'us_stock' | 'crypto' | 'real_estate' | 'cash';

export interface Member {
  id: string;
  name: string;
  pin: string; // 4자리 비밀번호
  avatar: string; // 이모지 또는 이미지
  bio: string; // 한줄 소개
  role?: string; // 역할 (예: '다락방 총무', '영끌 대장')
  updatedAt: string;
}

export interface Asset {
  id: string;
  memberId: string;
  type: AssetType;
  name: string; // 예: 삼성전자, 테슬라, 비트코인, 마포래미안푸르지오 84㎡
  symbol: string; // 005930, TSLA, BTC, RE-01 등
  buyPrice: number; // 매수 평단가 (원화 기준)
  quantity: number; // 보유 수량
  currentPrice: number; // 현재 평가 단가 (원화 기준)
  currency: 'KRW' | 'USD';
  memo?: string; // 투자 메모
  updatedAt: string;
}

export interface Shoutout {
  id: string;
  memberId: string;
  memberName: string;
  avatar: string;
  message: string;
  createdAt: string;
  reactionCount: number;
}

export interface Badge {
  id: string;
  label: string;
  emoji: string;
  description: string;
  type: 'rank' | 'asset' | 'special';
}

export interface MemberMetrics {
  totalInvested: number;
  totalCurrentValue: number;
  totalProfit: number;
  profitRate: number; // % 단위
  assetBreakdown: {
    kr_stock: number;
    us_stock: number;
    crypto: number;
    real_estate: number;
    cash: number;
  };
}

export interface RankedMember {
  member: Member;
  metrics: MemberMetrics;
  rank: number;
  badges: Badge[];
}

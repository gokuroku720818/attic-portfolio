import { describe, it, expect } from 'vitest';
import { calculateRankings } from '../utils/ranking';
import { Member, Asset } from '../types';

describe('Ranking and Badges Engine', () => {
  const dummyMember1: Member = { id: 'm1', name: '김버핏', pin: '1234', avatar: '🎩', bio: '가치투자', updatedAt: '' };
  const dummyMember2: Member = { id: 'm2', name: '배구출', pin: '1234', avatar: '🛟', bio: '물림', updatedAt: '' };
  const dummyMember3: Member = { id: 'm3', name: '박영끌', pin: '1234', avatar: '🏢', bio: '부동산', updatedAt: '' };
  const dummyMember4: Member = { id: 'm4', name: '오코인', pin: '1234', avatar: '⚡', bio: '코인', updatedAt: '' };

  it('should rank members descending by profit rate and assign top & bottom titles', () => {
    const members = [dummyMember1, dummyMember2, dummyMember3, dummyMember4];
    const assets: Asset[] = [
      // m1: 50% 수익률
      { id: 'a1', memberId: 'm1', type: 'kr_stock', name: '주식1', symbol: 'A', buyPrice: 100, quantity: 10, currentPrice: 150, currency: 'KRW', updatedAt: '' },
      // m2: -40% 수익률 (꼴찌)
      { id: 'a2', memberId: 'm2', type: 'kr_stock', name: '주식2', symbol: 'B', buyPrice: 100, quantity: 10, currentPrice: 60, currency: 'KRW', updatedAt: '' },
      // m3: 10% 수익률, 부동산 올인 (10억 중 9억이 부동산)
      { id: 'a3-1', memberId: 'm3', type: 'real_estate', name: '아파트', symbol: 'RE', buyPrice: 800000000, quantity: 1, currentPrice: 900000000, currency: 'KRW', updatedAt: '' },
      { id: 'a3-2', memberId: 'm3', type: 'kr_stock', name: '주식3', symbol: 'C', buyPrice: 100000000, quantity: 1, currentPrice: 100000000, currency: 'KRW', updatedAt: '' },
      // m4: 20% 수익률, 코인 올인
      { id: 'a4', memberId: 'm4', type: 'crypto', name: '비트', symbol: 'BTC', buyPrice: 100, quantity: 10, currentPrice: 120, currency: 'KRW', updatedAt: '' },
    ];

    const ranked = calculateRankings(members, assets);

    // 순위 검증
    expect(ranked[0].member.id).toBe('m1'); // 50% 1위
    expect(ranked[0].rank).toBe(1);
    expect(ranked[0].badges.some((b) => b.label === '다락방 워런 버핏')).toBe(true);

    expect(ranked[3].member.id).toBe('m2'); // -40% 꼴찌
    expect(ranked[3].rank).toBe(4);
    expect(ranked[3].badges.some((b) => b.label === '한강 수온 체크반장')).toBe(true);

    // 특수 칭호 검증
    const youngggl = ranked.find((r) => r.member.id === 'm3')!;
    expect(youngggl.badges.some((b) => b.label === '영끌 대마왕')).toBe(true);

    const beast = ranked.find((r) => r.member.id === 'm4')!;
    expect(beast.badges.some((b) => b.label === '야수형 불나방')).toBe(true);
  });

  it('should break ties using total asset value when profit rates are identical (Review Focus 4)', () => {
    const memberA: Member = { id: 'mA', name: '동순위A', pin: '1234', avatar: '🅰️', bio: '', updatedAt: '' };
    const memberB: Member = { id: 'mB', name: '동순위B', pin: '1234', avatar: '🅱️', bio: '', updatedAt: '' };

    const assets: Asset[] = [
      // mA: 수익률 10%, 총자산 110만원
      { id: 'aA', memberId: 'mA', type: 'kr_stock', name: '주식A', symbol: 'A', buyPrice: 1000000, quantity: 1, currentPrice: 1100000, currency: 'KRW', updatedAt: '' },
      // mB: 수익률 10%, 총자산 2200만원 (더 큰 자산)
      { id: 'aB', memberId: 'mB', type: 'kr_stock', name: '주식B', symbol: 'B', buyPrice: 20000000, quantity: 1, currentPrice: 22000000, currency: 'KRW', updatedAt: '' },
    ];

    const ranked = calculateRankings([memberA, memberB], assets);
    expect(ranked[0].member.id).toBe('mB');
    expect(ranked[1].member.id).toBe('mA');
  });
});

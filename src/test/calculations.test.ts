import { describe, it, expect } from 'vitest';
import { calculateAssetMetrics, calculateMemberMetrics, formatCurrency, formatPercent } from '../utils/calculations';
import { Asset, Member } from '../types';

describe('Portfolio Calculations', () => {
  const dummyMember: Member = {
    id: 'm1',
    name: '테스트',
    pin: '1234',
    avatar: '🎩',
    bio: '테스트용',
    updatedAt: new Date().toISOString(),
  };

  it('should calculate individual asset metrics accurately', () => {
    const stockAsset: Asset = {
      id: 'a1',
      memberId: 'm1',
      type: 'kr_stock',
      name: '삼성전자',
      symbol: '005930',
      buyPrice: 50000,
      quantity: 10,
      currentPrice: 75000,
      currency: 'KRW',
      updatedAt: new Date().toISOString(),
    };

    const metrics = calculateAssetMetrics(stockAsset);
    expect(metrics.investedAmount).toBe(500000);
    expect(metrics.currentValue).toBe(750000);
    expect(metrics.profit).toBe(250000);
    expect(metrics.profitRate).toBe(50); // 50%
  });

  it('should safely handle zero invested amount without NaN or Infinity (Review Focus 1)', () => {
    const zeroAsset: Asset = {
      id: 'a2',
      memberId: 'm1',
      type: 'kr_stock',
      name: '공짜주식',
      symbol: '000000',
      buyPrice: 0,
      quantity: 10,
      currentPrice: 10000,
      currency: 'KRW',
      updatedAt: new Date().toISOString(),
    };

    const metrics = calculateAssetMetrics(zeroAsset);
    expect(metrics.profitRate).toBe(0);
    expect(Number.isFinite(metrics.profitRate)).toBe(true);

    const memberMetrics = calculateMemberMetrics(dummyMember, []);
    expect(memberMetrics.totalInvested).toBe(0);
    expect(memberMetrics.profitRate).toBe(0);
  });

  it('should calculate member total metrics across mixed assets (stock, real estate, crypto)', () => {
    const assets: Asset[] = [
      {
        id: 'a1',
        memberId: 'm1',
        type: 'kr_stock',
        name: '삼전',
        symbol: '005930',
        buyPrice: 60000,
        quantity: 10, // 원금 600,000, 현재가 800,000
        currentPrice: 80000,
        currency: 'KRW',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'a2',
        memberId: 'm1',
        type: 'real_estate',
        name: '마포 아파트',
        symbol: 'RE-01',
        buyPrice: 1000000000, // 원금 10억, 현재가 12억
        quantity: 1,
        currentPrice: 1200000000,
        currency: 'KRW',
        updatedAt: new Date().toISOString(),
      },
    ];

    const metrics = calculateMemberMetrics(dummyMember, assets);
    expect(metrics.totalInvested).toBe(1000600000);
    expect(metrics.totalCurrentValue).toBe(1200800000);
    expect(metrics.totalProfit).toBe(200200000);
    // 자금규모 제외 후: 종목별 평단가 기준 동일비중 평균 수익률 ((33.333% + 20%) / 2 = 26.667%)
    expect(metrics.profitRate).toBeCloseTo((((80000 - 60000) / 60000 * 100) + ((1200000000 - 1000000000) / 1000000000 * 100)) / 2, 2);
    expect(metrics.assetBreakdown.real_estate).toBe(1200000000);
    expect(metrics.assetBreakdown.kr_stock).toBe(800000);
  });

  it('should correctly format currency and percentages in Korean notation', () => {
    expect(formatCurrency(1250000000)).toBe('12억 5,000만원');
    expect(formatCurrency(78500)).toBe('7만 8,500원');
    expect(formatCurrency(500)).toBe('500원');
    expect(formatPercent(25.456)).toBe('+25.46%');
    expect(formatPercent(-12.3)).toBe('-12.30%');
    expect(formatPercent(0)).toBe('0.00%');
  });
});

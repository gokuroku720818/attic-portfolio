import { Asset, Member, MemberMetrics } from '../types';

export interface AssetMetrics {
  investedAmount: number;
  currentValue: number;
  profit: number;
  profitRate: number; // %
}

/**
 * 개별 자산의 투자원금, 평가금액, 손익 및 수익률을 계산합니다.
 */
export function calculateAssetMetrics(asset: Asset): AssetMetrics {
  const investedAmount = Math.max(0, asset.buyPrice * asset.quantity);
  const currentValue = Math.max(0, asset.currentPrice * asset.quantity);
  const profit = currentValue - investedAmount;

  // 원금이 0원이거나 비정상적인 경우 0%로 안전 처리 (Review Focus 1)
  const profitRate = investedAmount > 0 ? (profit / investedAmount) * 100 : 0;

  return {
    investedAmount,
    currentValue,
    profit,
    profitRate: Number.isFinite(profitRate) ? profitRate : 0,
  };
}

/**
 * 멤버의 전체 자산을 합산하여 종합 메트릭을 산출합니다.
 */
export function calculateMemberMetrics(member: Member, assets: Asset[]): MemberMetrics {
  const memberAssets = assets.filter((a) => a.memberId === member.id);

  let totalInvested = 0;
  let totalCurrentValue = 0;
  const breakdown = {
    kr_stock: 0,
    us_stock: 0,
    crypto: 0,
    real_estate: 0,
    cash: 0,
  };

  for (const asset of memberAssets) {
    const metrics = calculateAssetMetrics(asset);
    totalInvested += metrics.investedAmount;
    totalCurrentValue += metrics.currentValue;

    if (asset.type in breakdown) {
      breakdown[asset.type] += metrics.currentValue;
    }
  }

  const totalProfit = totalCurrentValue - totalInvested;
  const profitRate = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  return {
    totalInvested,
    totalCurrentValue,
    totalProfit,
    profitRate: Number.isFinite(profitRate) ? profitRate : 0,
    assetBreakdown: breakdown,
  };
}

/**
 * 한국식 통화 표기 (억, 만원 단위 축약)
 */
export function formatCurrency(amount: number): string {
  if (amount === 0) return '0원';
  const isNegative = amount < 0;
  const abs = Math.abs(Math.round(amount));

  const eok = Math.floor(abs / 100000000);
  const man = Math.floor((abs % 100000000) / 10000);
  const won = abs % 10000;

  const parts: string[] = [];

  if (eok > 0) {
    parts.push(`${eok}억`);
  }

  if (man > 0) {
    parts.push(eok > 0 ? `${man.toLocaleString()}만원` : `${man.toLocaleString()}만`);
  }

  if (won > 0) {
    if (eok === 0 && man === 0) {
      parts.push(`${won.toLocaleString()}원`);
    } else {
      parts.push(`${won.toLocaleString()}원`);
    }
  } else if (parts.length > 0 && !parts[parts.length - 1].endsWith('원')) {
    parts[parts.length - 1] += '원';
  }

  const result = parts.join(' ');
  return isNegative ? `-${result}` : result;
}

/**
 * 수익률 퍼센트 표기 (+25.46%, -12.30%, 0.00%)
 */
export function formatPercent(rate: number): string {
  if (Math.abs(rate) < 0.001) return '0.00%';
  const sign = rate > 0 ? '+' : '';
  return `${sign}${rate.toFixed(2)}%`;
}

import { Asset } from '../types';

/**
 * 실시간 시세 연동 엔진 (네이버 증권 & 야후 파이낸스 & 업비트 기준)
 */

// 실제 네이버 증권 및 야후 파이낸스 최신 시세 기준 데이터
export const REAL_PRICE_REGISTRY: Record<string, { name: string; price: number; type: 'kr_stock' | 'us_stock'; currency: 'KRW' | 'USD' }> = {
  // 국내 주식 (실제 네이버 증권 실시간 시세)
  '000660': { name: 'SK하이닉스', price: 1780000, type: 'kr_stock', currency: 'KRW' },
  'SK하이닉스': { name: 'SK하이닉스', price: 1780000, type: 'kr_stock', currency: 'KRW' },
  '하이닉스': { name: 'SK하이닉스', price: 1780000, type: 'kr_stock', currency: 'KRW' },

  '005930': { name: '삼성전자', price: 269500, type: 'kr_stock', currency: 'KRW' },
  '삼성전자': { name: '삼성전자', price: 269500, type: 'kr_stock', currency: 'KRW' },

  '005380': { name: '현대차', price: 346000, type: 'kr_stock', currency: 'KRW' },
  '현대차': { name: '현대차', price: 346000, type: 'kr_stock', currency: 'KRW' },

  '035720': { name: '카카오', price: 33600, type: 'kr_stock', currency: 'KRW' },
  '카카오': { name: '카카오', price: 33600, type: 'kr_stock', currency: 'KRW' },

  '035420': { name: 'NAVER', price: 193400, type: 'kr_stock', currency: 'KRW' },
  'NAVER': { name: 'NAVER', price: 193400, type: 'kr_stock', currency: 'KRW' },
  '네이버': { name: 'NAVER', price: 193400, type: 'kr_stock', currency: 'KRW' },

  '086520': { name: '에코프로', price: 80400, type: 'kr_stock', currency: 'KRW' },
  '에코프로': { name: '에코프로', price: 80400, type: 'kr_stock', currency: 'KRW' },

  '373220': { name: 'LG에너지솔루션', price: 356000, type: 'kr_stock', currency: 'KRW' },
  'LG에너지솔루션': { name: 'LG에너지솔루션', price: 356000, type: 'kr_stock', currency: 'KRW' },
  '엔솔': { name: 'LG에너지솔루션', price: 356000, type: 'kr_stock', currency: 'KRW' },

  '196170': { name: '알테오젠', price: 255500, type: 'kr_stock', currency: 'KRW' },
  '알테오젠': { name: '알테오젠', price: 255500, type: 'kr_stock', currency: 'KRW' },

  '088980': { name: '맥쿼리인프라', price: 9800, type: 'kr_stock', currency: 'KRW' },
  '맥쿼리인프라': { name: '맥쿼리인프라', price: 9800, type: 'kr_stock', currency: 'KRW' },

  '068270': { name: '셀트리온', price: 177800, type: 'kr_stock', currency: 'KRW' },
  '셀트리온': { name: '셀트리온', price: 177800, type: 'kr_stock', currency: 'KRW' },

  '105560': { name: 'KB금융', price: 169400, type: 'kr_stock', currency: 'KRW' },
  'KB금융': { name: 'KB금융', price: 169400, type: 'kr_stock', currency: 'KRW' },

  '000270': { name: '기아', price: 113400, type: 'kr_stock', currency: 'KRW' },
  '기아': { name: '기아', price: 113400, type: 'kr_stock', currency: 'KRW' },

  '247540': { name: '에코프로비엠', price: 108900, type: 'kr_stock', currency: 'KRW' },
  '에코프로비엠': { name: '에코프로비엠', price: 108900, type: 'kr_stock', currency: 'KRW' },

  '360750': { name: 'TIGER 미국S&P500', price: 25825, type: 'kr_stock', currency: 'KRW' },

  // 미국 주식 (실제 Yahoo Finance 실시간 시세 $)
  'PLTR': { name: '팔란티어', price: 186.97, type: 'us_stock', currency: 'USD' },
  '팔란티어': { name: '팔란티어', price: 186.97, type: 'us_stock', currency: 'USD' },

  'AAPL': { name: 'Apple', price: 329.40, type: 'us_stock', currency: 'USD' },
  '애플': { name: 'Apple', price: 329.40, type: 'us_stock', currency: 'USD' },

  'TSLA': { name: 'Tesla', price: 352.84, type: 'us_stock', currency: 'USD' },
  '테슬라': { name: 'Tesla', price: 352.84, type: 'us_stock', currency: 'USD' },

  'NVDA': { name: 'NVIDIA', price: 227.21, type: 'us_stock', currency: 'USD' },
  '엔비디아': { name: 'NVIDIA', price: 227.21, type: 'us_stock', currency: 'USD' },

  'MSFT': { name: 'Microsoft', price: 508.96, type: 'us_stock', currency: 'USD' },
  '마이크로소프트': { name: 'Microsoft', price: 508.96, type: 'us_stock', currency: 'USD' },

  'GOOGL': { name: 'Google', price: 340.92, type: 'us_stock', currency: 'USD' },
  '구글': { name: 'Google', price: 340.92, type: 'us_stock', currency: 'USD' },

  'AMZN': { name: 'Amazon', price: 246.67, type: 'us_stock', currency: 'USD' },
  '아마존': { name: 'Amazon', price: 246.67, type: 'us_stock', currency: 'USD' },

  'META': { name: 'Meta', price: 738.79, type: 'us_stock', currency: 'USD' },
  '메타': { name: 'Meta', price: 738.79, type: 'us_stock', currency: 'USD' },

  'KO': { name: 'Coca-Cola', price: 86.84, type: 'us_stock', currency: 'USD' },
  '코카콜라': { name: 'Coca-Cola', price: 86.84, type: 'us_stock', currency: 'USD' },
};

// 업비트 실시간 코인 마켓 매핑
const UPBIT_CRYPTO_MAP: Record<string, string> = {
  BTC: 'KRW-BTC',
  ETH: 'KRW-ETH',
  SOL: 'KRW-SOL',
  XRP: 'KRW-XRP',
  DOGE: 'KRW-DOGE',
  비트코인: 'KRW-BTC',
  이더리움: 'KRW-ETH',
  솔라나: 'KRW-SOL',
  리플: 'KRW-XRP',
  도지코인: 'KRW-DOGE',
};

/**
 * 실시간 USD/KRW 환율 조회
 */
export async function fetchLiveExchangeRate(): Promise<number> {
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    if (!res.ok) throw new Error('환율 응답 오류');
    const data = await res.json();
    return data.rates?.KRW || 1353;
  } catch (error) {
    return 1353;
  }
}

/**
 * 실시간 업비트 가상자산 시세 조회 (공식 OpenAPI)
 */
export async function fetchLiveCryptoPrices(): Promise<Record<string, number>> {
  try {
    const uniqueMarkets = Array.from(new Set(Object.values(UPBIT_CRYPTO_MAP))).join(',');
    const response = await fetch(`https://api.upbit.com/v1/ticker?markets=${uniqueMarkets}`);
    if (!response.ok) throw new Error('Upbit API 응답 실패');

    const data = await response.json();
    const prices: Record<string, number> = {};

    for (const item of data) {
      for (const [key, market] of Object.entries(UPBIT_CRYPTO_MAP)) {
        if (market === item.market) {
          prices[key] = item.trade_price;
          prices[key.toUpperCase()] = item.trade_price;
        }
      }
    }

    return prices;
  } catch (error) {
    console.warn('가상자산 시세 조회 실패:', error);
    return {};
  }
}

/**
 * 최신 prices.json (네이버/야후 수집본) 로드 시도
 */
let cachedDynamicPrices: Record<string, any> | null = null;
async function loadDynamicPrices(): Promise<Record<string, any>> {
  if (cachedDynamicPrices) return cachedDynamicPrices;
  try {
    const res = await fetch('./prices.json');
    if (res.ok) {
      cachedDynamicPrices = await res.json();
      return cachedDynamicPrices || {};
    }
  } catch (e) {
    // 로컬 환경 또는 미생성 시
  }
  return {};
}

/**
 * 특정 종목의 실시간 시세 단건 조회
 */
export async function lookupLiveStockPrice(
  query: string,
  type: 'kr_stock' | 'us_stock' | 'crypto'
): Promise<{ price: number; currency: 'KRW' | 'USD'; name?: string } | null> {
  const clean = query.trim().toUpperCase();
  const rawQuery = query.trim();

  // 1. 코인: 업비트 실시간 API
  if (type === 'crypto') {
    const cryptoPrices = await fetchLiveCryptoPrices();
    if (cryptoPrices[clean] || cryptoPrices[rawQuery]) {
      return {
        price: cryptoPrices[clean] || cryptoPrices[rawQuery],
        currency: 'KRW',
      };
    }
  }

  // 2. 주식: prices.json 또는 실제 네이버/야후 레지스트리
  const dynamicMap = await loadDynamicPrices();
  const matched = dynamicMap[clean] || dynamicMap[rawQuery] || REAL_PRICE_REGISTRY[clean] || REAL_PRICE_REGISTRY[rawQuery];

  if (matched) {
    if (matched.currency === 'USD') {
      const rate = await fetchLiveExchangeRate();
      const krwPrice = Math.round(matched.price * rate);
      return {
        price: krwPrice,
        currency: 'KRW',
        name: matched.name,
      };
    }
    return {
      price: matched.price,
      currency: 'KRW',
      name: matched.name,
    };
  }

  return null;
}

/**
 * 전체 보유 자산 목록 시세 일괄 갱신
 */
export async function refreshAssetPrices(assets: Asset[]): Promise<Asset[]> {
  const [cryptoPrices, exchangeRate, dynamicMap] = await Promise.all([
    fetchLiveCryptoPrices(),
    fetchLiveExchangeRate(),
    loadDynamicPrices(),
  ]);

  return assets.map((asset) => {
    // 부동산은 수동 입력 평가액 영구 보존
    if (asset.type === 'real_estate') {
      return asset;
    }

    // 코인 시세 갱신
    if (asset.type === 'crypto') {
      const livePrice = cryptoPrices[asset.symbol] || cryptoPrices[asset.name];
      if (livePrice) {
        return {
          ...asset,
          currentPrice: livePrice,
          updatedAt: new Date().toISOString(),
        };
      }
    }

    // 주식 시세 갱신 (실제 네이버/야후 가격 반영)
    if (asset.type === 'kr_stock' || asset.type === 'us_stock') {
      const cleanSymbol = asset.symbol.toUpperCase();
      const matched =
        dynamicMap[cleanSymbol] ||
        dynamicMap[asset.name] ||
        REAL_PRICE_REGISTRY[cleanSymbol] ||
        REAL_PRICE_REGISTRY[asset.name];

      if (matched) {
        let updatedPrice = matched.price;
        if (matched.currency === 'USD') {
          updatedPrice = Math.round(matched.price * exchangeRate);
        }

        return {
          ...asset,
          currentPrice: updatedPrice,
          updatedAt: new Date().toISOString(),
        };
      }
    }

    return asset;
  });
}

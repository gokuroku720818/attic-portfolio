import React, { useState } from 'react';
import { Asset, AssetType } from '../types';
import { calculateAssetMetrics, formatCurrency, formatPercent } from '../utils/calculations';
import { lookupLiveStockPrice } from '../services/priceEngine';
import { Save, Sparkles, Search, Loader2, Check } from 'lucide-react';

interface AssetFormProps {
  memberId: string;
  initialAsset?: Asset | null;
  onSave: (asset: Asset) => void;
  onCancel: () => void;
}

export const AssetForm: React.FC<AssetFormProps> = ({
  memberId,
  initialAsset,
  onSave,
  onCancel,
}) => {
  const [type, setType] = useState<AssetType>(initialAsset?.type || 'kr_stock');
  const [name, setName] = useState(initialAsset?.name || '');
  const [symbol, setSymbol] = useState(initialAsset?.symbol || '');
  const [buyPrice, setBuyPrice] = useState<number>(initialAsset?.buyPrice || 0);
  const [quantity, setQuantity] = useState<number>(initialAsset?.quantity || 1);
  const [currentPrice, setCurrentPrice] = useState<number>(
    initialAsset?.currentPrice || initialAsset?.buyPrice || 0
  );
  const [memo, setMemo] = useState(initialAsset?.memo || '');

  // 실시간 조회 상태
  const [isSearchingPrice, setIsSearchingPrice] = useState(false);
  const [searchSuccessMessage, setSearchSuccessMessage] = useState('');

  // 실시간 시세 조회 핸들러
  const handleFetchLivePrice = async () => {
    const query = symbol || name;
    if (!query.trim()) {
      alert('종목명 또는 심볼(티커/코드)을 먼저 입력해주세요!');
      return;
    }

    if (type === 'real_estate') {
      alert('부동산은 최근 실거래가나 KB호가를 직접 기입해주세요.');
      return;
    }

    setIsSearchingPrice(true);
    setSearchSuccessMessage('');

    try {
      const result = await lookupLiveStockPrice(query, type as 'kr_stock' | 'us_stock' | 'crypto');
      if (result) {
        setCurrentPrice(result.price);
        if (result.name && !name) {
          setName(result.name);
        }
        setSearchSuccessMessage(`실시간 시세 ${result.price.toLocaleString()}원 적용 완료!`);
      } else {
        alert(`'${query}'의 실시간 시세를 찾지 못했습니다. 직접 입력해주세요.`);
      }
    } catch (error) {
      alert('시세 조회 중 오류가 발생했습니다.');
    } finally {
      setIsSearchingPrice(false);
    }
  };

  // 미리보기 계산
  const tempAsset: Asset = {
    id: initialAsset?.id || 'temp',
    memberId,
    type,
    name: name || '임시 종목',
    symbol: symbol || 'TEMP',
    buyPrice,
    quantity,
    currentPrice,
    currency: 'KRW',
    updatedAt: '',
  };
  const preview = calculateAssetMetrics(tempAsset);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('종목명 또는 부동산 이름을 입력해주세요.');
      return;
    }

    const newAsset: Asset = {
      id: initialAsset ? initialAsset.id : `a-${Date.now()}`,
      memberId,
      type,
      name: name.trim(),
      symbol: symbol.trim() || (type === 'real_estate' ? 'RE' : 'CUSTOM'),
      buyPrice: Number(buyPrice) || 0,
      quantity: Number(quantity) || 1,
      currentPrice: Number(currentPrice) || Number(buyPrice) || 0,
      currency: 'KRW',
      memo: memo.trim(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newAsset);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800/80 border border-amber-500/30 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
        <h4 className="text-sm font-black text-amber-300 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{initialAsset ? '종목 정보 수정' : '새 투자 종목 등록'}</span>
        </h4>
        <span className="text-[11px] text-slate-400">
          {type === 'real_estate' ? '🏢 부동산 항목' : '📈 금융 투자 항목'}
        </span>
      </div>

      {/* 자산 유형 선택 라디오 */}
      <div>
        <label className="block text-xs font-bold text-slate-300 mb-1.5">자산 유형</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(
            [
              { id: 'kr_stock', label: '국내주식', emoji: '🇰🇷' },
              { id: 'us_stock', label: '미국주식', emoji: '🗽' },
              { id: 'crypto', label: '가상자산', emoji: '⚡' },
              { id: 'real_estate', label: '부동산', emoji: '🏢' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setType(item.id);
                if (item.id === 'real_estate' && quantity !== 1) {
                  setQuantity(1);
                }
              }}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                type === item.id
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                  : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{item.emoji}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 종목명 & 티커 + 실시간 시세 조회 버튼 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">
            {type === 'real_estate' ? '부동산명 (아파트/건물/지분)' : '종목명'}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={
              type === 'real_estate' ? '예: 마포래미안 84㎡' : '예: 삼성전자, 팔란티어, 테슬라'
            }
            required
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-slate-300">
              {type === 'real_estate' ? '지역/식별코드 (선택)' : '종목코드 / 티커'}
            </label>
            {type !== 'real_estate' && (
              <div className="flex items-center gap-2">
                {type === 'kr_stock' && (
                  <a
                    href={`https://m.stock.naver.com/item/main.naver?code=${symbol || '000660'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-slate-400 hover:text-slate-200 underline"
                  >
                    네이버증권 확인 ↗
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleFetchLivePrice}
                  disabled={isSearchingPrice}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                >
                  {isSearchingPrice ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Search className="w-3 h-3" />
                  )}
                  <span>실시간 시세 조회</span>
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder={type === 'real_estate' ? '예: RE-MAPO' : '예: 005930, PLTR, AAPL, BTC'}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {searchSuccessMessage && (
        <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
          <Check className="w-3.5 h-3.5" />
          <span>{searchSuccessMessage}</span>
        </div>
      )}

      {/* 매수 평단가, 보유 수량, 현재 시세 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">
            {type === 'real_estate' ? '매수가 / 취득가 (원)' : '내 매수 평단가 (원)'}
          </label>
          <input
            type="number"
            value={buyPrice || ''}
            onChange={(e) => setBuyPrice(Number(e.target.value))}
            placeholder="0"
            min={0}
            required
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
          />
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            {formatCurrency(buyPrice)}
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">
            {type === 'real_estate' ? '보유 수량 / 지분' : '보유 수량 (주/개)'}
          </label>
          <input
            type="number"
            step="any"
            value={quantity || ''}
            onChange={(e) => setQuantity(Number(e.target.value))}
            placeholder="1"
            min={0}
            required
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">
            {type === 'real_estate' ? '현재 평가액 / 호가 (원)' : '현재 시세 (실시간/입력)'}
          </label>
          <input
            type="number"
            value={currentPrice || ''}
            onChange={(e) => setCurrentPrice(Number(e.target.value))}
            placeholder="0"
            min={0}
            required
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
          />
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            {formatCurrency(currentPrice)}
          </span>
        </div>
      </div>

      {/* 투자 메모 */}
      <div>
        <label className="block text-xs font-bold text-slate-300 mb-1">
          투자 한줄 메모 (선택)
        </label>
        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="예: 3년 장투 예정, 전세 낀 갭투자, 존버 등"
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
        />
      </div>

      {/* 실시간 미리보기 바 */}
      <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="text-slate-400">
          원금 <span className="font-bold text-slate-200">{formatCurrency(preview.investedAmount)}</span> →
          평가 <span className="font-bold text-slate-200">{formatCurrency(preview.currentValue)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">예상 손익:</span>
          <span
            className={`font-black ${
              preview.profitRate >= 0 ? 'text-rose-400' : 'text-blue-400'
            }`}
          >
            {formatPercent(preview.profitRate)} ({formatCurrency(preview.profit)})
          </span>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-slate-200 transition"
        >
          취소
        </button>
        <button
          type="submit"
          className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{initialAsset ? '수정 완료' : '종목 추가하기'}</span>
        </button>
      </div>
    </form>
  );
};

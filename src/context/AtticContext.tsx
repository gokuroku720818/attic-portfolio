import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { cacheAtticData } from '../services/localCache';
import { Asset, Member, RankedMember, Shoutout } from '../types';
import {
  loadAtticData,
  saveAsset,
  removeAsset,
  saveShoutout,
  likeShoutout,
  verifyMemberPin,
  isMemberPinSet,
  setMemberPin,
  resetDataByHost as storageResetByHost,
} from '../services/storage';
import { HistoryDay, loadHistory, updateHistory } from '../services/history';
import { calculateRankings } from '../utils/ranking';
import { refreshAssetPrices } from '../services/priceEngine';
import {
  fetchCloudAtticData,
  saveCloudAtticData,
  subscribeCloudAtticData,
  saveCloudPriceUpdates,
} from '../services/cloudStorage';

interface AtticContextType {
  members: Member[];
  assets: Asset[];
  shoutouts: Shoutout[];
  rankedMembers: RankedMember[];
  activeMember: Member | null;
  isRefreshing: boolean;
  refreshMessage: string;
  saveMessage: string;
  history: HistoryDay[];
  loginMember: (memberId: string, pin: string) => boolean;
  logout: () => void;
  checkIsPinSet: (memberId: string) => boolean;
  setupNewPin: (memberId: string, newPin: string) => boolean;
  addOrUpdateAsset: (asset: Asset) => void;
  deleteAsset: (assetId: string) => void;
  postShoutout: (memberId: string, message: string) => void;
  reactToShoutout: (shoutoutId: string) => void;
  refreshPrices: () => Promise<void>;
  resetDataByHost: (hostPin: string) => { success: boolean; message: string };
}

const AtticContext = createContext<AtticContextType | undefined>(undefined);

export const AtticProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState(() => loadAtticData());
  const [history,setHistory] = useState(loadHistory);
  const [cloudReady,setCloudReady] = useState(false);
  const [activeMember, setActiveMember] = useState<Member | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [refreshMessage, setRefreshMessage] = useState('국내: 직접 조회 우선 · 미국: 수집본 · 코인: 업비트');
  const [saveMessage,setSaveMessage]=useState('');
  const pendingSaves=useRef(0);
  const saveQueue=useRef(Promise.resolve());
  const refreshingRef = useRef(false);
  const dataRef = useRef(data);
  dataRef.current = data;

  const persistChange=useCallback((fresh:ReturnType<typeof loadAtticData>,original:ReturnType<typeof loadAtticData>)=>{
    pendingSaves.current++;
    setSaveMessage('변경사항 서버 저장 중…');
    saveQueue.current=saveQueue.current.then(async()=>{
      const saved=await saveCloudAtticData(fresh,original);
      pendingSaves.current--;
      setSaveMessage(saved?'변경사항 서버 저장 완료':'서버 저장 실패 · 변경사항을 다시 확인해 주세요');
      if(pendingSaves.current===0){const latest=await fetchCloudAtticData();if(latest&&!pendingSaves.current){setData(latest);cacheAtticData(latest);}}
    }).catch(()=>{pendingSaves.current=Math.max(0,pendingSaves.current-1);setSaveMessage('서버 저장 실패 · 다시 시도해 주세요');});
  },[]);

  // 실시간 랭킹 연산
  const rankedMembers = useMemo(() => {
    return calculateRankings(data.members, data.assets);
  }, [data.members, data.assets]);

  useEffect(() => {
    if (!cloudReady || !rankedMembers.length) return;
    const day=new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Seoul'});
    setHistory(previous => {
      const next=updateHistory(previous,{day,values:Object.fromEntries(rankedMembers.map(r=>[r.member.id,{rank:r.rank,rate:r.metrics.profitRate}]))});
      try {localStorage.setItem('attic_history_v1',JSON.stringify(next));} catch { /* 저장 공간 부족 시 현재 화면 기록만 유지 */ }
      return next;
    });
  },[rankedMembers,cloudReady]);

  // 클라우드(Supabase) 실시간 동기화 라이프사이클
  useEffect(() => {
    let isMounted = true;

    // 1) 초기 클라우드 데이터 로드
    fetchCloudAtticData().then((cloudData) => {
      if (!isMounted || refreshingRef.current || pendingSaves.current) return;
      if (cloudData && cloudData.members && cloudData.members.length > 0) {
        setData(cloudData);
        setCloudReady(true);
        cacheAtticData(cloudData);
      }
    });

    // 2) Supabase Realtime 채널 구독
    const unsubscribe = subscribeCloudAtticData((cloudData) => {
      if (!isMounted || refreshingRef.current || pendingSaves.current) return;
      setData(current=>JSON.stringify(current)===JSON.stringify(cloudData)?current:cloudData);
      cacheAtticData(cloudData);
    });

    // Realtime 보완 조회: 화면이 보일 때만, 요청이 겹치지 않게 30초 주기 확인
    let polling=false;
    const poll=() => {
      if(polling||document.visibilityState!=='visible'||pendingSaves.current||refreshingRef.current)return;
      polling=true;
      fetchCloudAtticData().then((cloudData) => {
        if (!isMounted || !cloudData || refreshingRef.current || pendingSaves.current) return;
        setCloudReady(true);
        setData((current) => {
          if (JSON.stringify(current) !== JSON.stringify(cloudData)) {
            cacheAtticData(cloudData);
            return cloudData;
          }
          return current;
        });
      }).finally(()=>{polling=false;});
    };
    const intervalId = setInterval(poll,30000);
    document.addEventListener('visibilitychange',poll);

    return () => {
      isMounted = false;
      unsubscribe();
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange',poll);
    };
  }, []);

  // 시세 갱신: 저장 성공을 확인한 뒤 공유 데이터 반영
  const refreshPrices = useCallback(async () => {
    if(refreshingRef.current)return;
    if(pendingSaves.current){setRefreshMessage('변경사항 저장 중입니다 · 저장 후 다시 눌러 주세요');return;}
    refreshingRef.current = true;
    setIsRefreshing(true);
    setRefreshMessage('최신 시세 확인 중…');
    try {
      const original = dataRef.current.assets;
      const updatedAssets = await refreshAssetPrices(original);
      const eligible = original.filter(a => ['kr_stock','us_stock','crypto'].includes(a.type));
      const changedCount=updatedAssets.filter((a,i)=>a.currentPrice!==original[i].currentPrice).length;
      const successCount = updatedAssets.filter((a,i) => a !== original[i]).length;
      if (!successCount) {
        setRefreshMessage(eligible.length ? '조회 실패 또는 오래된 수집본: 기존 가격 유지' : '자동 갱신할 주식·코인이 없습니다');
        return;
      }
      const saved = await saveCloudPriceUpdates(original,updatedAssets);
      if (!saved) {
        setRefreshMessage('공유 저장 실패: 기존 데이터 유지 · 다시 시도해 주세요');
        return;
      }
      if(!pendingSaves.current){setData(saved);cacheAtticData(saved);}
      setRefreshMessage(`${successCount}/${eligible.length}개 확인 · ${changedCount ? changedCount+'개 가격 변경' : '가격 변동 없음'} · 공유 저장 완료${successCount < eligible.length ? ' · 실패 종목 기존 가격 유지' : ''}`);
    } catch {
      setRefreshMessage('시세 갱신 실패: 기존 가격 유지');
    } finally {
      refreshingRef.current = false;
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!cloudReady) return;
    void refreshPrices();
    const timer=setInterval(() => {if(document.visibilityState==='visible') void refreshPrices();},300000);
    return () => clearInterval(timer);
  },[cloudReady,refreshPrices]);

  // 비밀번호 설정 여부 확인
  const checkIsPinSet = useCallback((memberId: string) => {
    return isMemberPinSet(memberId);
  }, []);

  // 초기 비밀번호 설정
  const setupNewPin = useCallback((memberId: string, newPin: string): boolean => {
    const original=loadAtticData();
    const success = setMemberPin(memberId, newPin);
    if (success) {
      const fresh = loadAtticData();
      setData(fresh);
      persistChange(fresh,original);
      const member = fresh.members.find((m) => m.id === memberId) || null;
      setActiveMember(member);
      return true;
    }
    return false;
  }, []);

  // 4자리 PIN 로그인
  const loginMember = useCallback((memberId: string, pin: string): boolean => {
    const isValid = verifyMemberPin(memberId, pin);
    if (isValid) {
      const fresh = loadAtticData();
      const member = fresh.members.find((m) => m.id === memberId) || null;
      setActiveMember(member);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setActiveMember(null);
  }, []);

  // 자산 추가/수정
  const addOrUpdateAsset = useCallback((asset: Asset) => {
    const original=loadAtticData();
    saveAsset(asset);
    const fresh = loadAtticData();
    setData(fresh);
    persistChange(fresh,original);
  }, []);

  // 자산 삭제
  const deleteAsset = useCallback((assetId: string) => {
    const original=loadAtticData();
    removeAsset(assetId);
    const fresh = loadAtticData();
    setData(fresh);
    persistChange(fresh,original);
  }, []);

  // 사자후 등록
  const postShoutout = useCallback((memberId: string, message: string) => {
    const member = data.members.find((m) => m.id === memberId);
    if (!member) return;

    const newShoutout: Shoutout = {
      id: `s-${Date.now()}`,
      memberId,
      memberName: member.name,
      avatar: member.avatar,
      message,
      createdAt: new Date().toISOString(),
      reactionCount: 0,
    };

    const original=loadAtticData();
    saveShoutout(newShoutout);
    const fresh = loadAtticData();
    setData(fresh);
    persistChange(fresh,original);
  }, [data.members]);

  // 사자후 공감
  const reactToShoutout = useCallback((shoutoutId: string) => {
    const original=loadAtticData();
    likeShoutout(shoutoutId);
    const fresh = loadAtticData();
    setData(fresh);
    persistChange(fresh,original);
  }, []);

  // 호스트(명왕) 전용 초기화
  const resetDataByHost = useCallback((hostPin: string) => {
    const res = storageResetByHost(hostPin);
    if (res.success) {
      const fresh = loadAtticData();
      setData(fresh);
      void saveCloudAtticData(fresh).then(saved=>setSaveMessage(saved?'초기화 서버 저장 완료':'초기화 서버 저장 실패'));
      setActiveMember(null);
    }
    return res;
  }, []);

  return (
    <AtticContext.Provider
      value={{
        members: data.members,
        assets: data.assets,
        shoutouts: data.shoutouts,
        rankedMembers,
        activeMember,
        isRefreshing,
        refreshMessage,
        saveMessage,
        history,
        loginMember,
        logout,
        checkIsPinSet,
        setupNewPin,
        addOrUpdateAsset,
        deleteAsset,
        postShoutout,
        reactToShoutout,
        refreshPrices,
        resetDataByHost,
      }}
    >
      {children}
    </AtticContext.Provider>
  );
};

export const useAtticStore = () => {
  const context = useContext(AtticContext);
  if (!context) {
    throw new Error('useAtticStore는 AtticProvider 내부에서만 사용할 수 있습니다.');
  }
  return context;
};

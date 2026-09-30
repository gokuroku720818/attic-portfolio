import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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
import { calculateRankings } from '../utils/ranking';
import { refreshAssetPrices } from '../services/priceEngine';
import {
  fetchCloudAtticData,
  saveCloudAtticData,
  subscribeCloudAtticData,
} from '../services/cloudStorage';

interface AtticContextType {
  members: Member[];
  assets: Asset[];
  shoutouts: Shoutout[];
  rankedMembers: RankedMember[];
  activeMember: Member | null;
  isRefreshing: boolean;
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
  const [activeMember, setActiveMember] = useState<Member | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 실시간 랭킹 연산
  const rankedMembers = useMemo(() => {
    return calculateRankings(data.members, data.assets);
  }, [data.members, data.assets]);

  // 클라우드(Supabase) 실시간 동기화 라이프사이클
  useEffect(() => {
    let isMounted = true;

    // 1) 초기 클라우드 데이터 로드
    fetchCloudAtticData().then((cloudData) => {
      if (!isMounted) return;
      if (cloudData && cloudData.members && cloudData.members.length > 0) {
        setData(cloudData);
        localStorage.setItem('attic_members_v3', JSON.stringify(cloudData.members));
        localStorage.setItem('attic_assets_v3', JSON.stringify(cloudData.assets));
        localStorage.setItem('attic_shoutouts_v3', JSON.stringify(cloudData.shoutouts));
      } else {
        const initial = loadAtticData();
        saveCloudAtticData(initial);
      }
    });

    // 2) Supabase Realtime 채널 구독
    const unsubscribe = subscribeCloudAtticData((cloudData) => {
      if (!isMounted) return;
      setData(cloudData);
      localStorage.setItem('attic_members_v3', JSON.stringify(cloudData.members));
      localStorage.setItem('attic_assets_v3', JSON.stringify(cloudData.assets));
      localStorage.setItem('attic_shoutouts_v3', JSON.stringify(cloudData.shoutouts));
    });

    // 3) 5초 주기 백그라운드 폴링
    const intervalId = setInterval(() => {
      fetchCloudAtticData().then((cloudData) => {
        if (!isMounted || !cloudData) return;
        setData((current) => {
          if (JSON.stringify(current) !== JSON.stringify(cloudData)) {
            localStorage.setItem('attic_members_v3', JSON.stringify(cloudData.members));
            localStorage.setItem('attic_assets_v3', JSON.stringify(cloudData.assets));
            localStorage.setItem('attic_shoutouts_v3', JSON.stringify(cloudData.shoutouts));
            return cloudData;
          }
          return current;
        });
      });
    }, 5000);

    return () => {
      isMounted = false;
      unsubscribe();
      clearInterval(intervalId);
    };
  }, []);

  // 시세 갱신
  const refreshPrices = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const updatedAssets = await refreshAssetPrices(data.assets);
      setData((prev) => {
        const next = { ...prev, assets: updatedAssets };
        localStorage.setItem('attic_assets_v3', JSON.stringify(updatedAssets));
        saveCloudAtticData(next);
        return next;
      });
    } catch (error) {
      console.error('시세 갱신 실패:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [data.assets]);

  // 비밀번호 설정 여부 확인
  const checkIsPinSet = useCallback((memberId: string) => {
    return isMemberPinSet(memberId);
  }, []);

  // 초기 비밀번호 설정
  const setupNewPin = useCallback((memberId: string, newPin: string): boolean => {
    const success = setMemberPin(memberId, newPin);
    if (success) {
      const fresh = loadAtticData();
      setData(fresh);
      saveCloudAtticData(fresh);
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
    saveAsset(asset);
    const fresh = loadAtticData();
    setData(fresh);
    saveCloudAtticData(fresh);
  }, []);

  // 자산 삭제
  const deleteAsset = useCallback((assetId: string) => {
    removeAsset(assetId);
    const fresh = loadAtticData();
    setData(fresh);
    saveCloudAtticData(fresh);
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

    saveShoutout(newShoutout);
    const fresh = loadAtticData();
    setData(fresh);
    saveCloudAtticData(fresh);
  }, [data.members]);

  // 사자후 공감
  const reactToShoutout = useCallback((shoutoutId: string) => {
    likeShoutout(shoutoutId);
    const fresh = loadAtticData();
    setData(fresh);
    saveCloudAtticData(fresh);
  }, []);

  // 호스트(명왕) 전용 초기화
  const resetDataByHost = useCallback((hostPin: string) => {
    const res = storageResetByHost(hostPin);
    if (res.success) {
      const fresh = loadAtticData();
      setData(fresh);
      saveCloudAtticData(fresh);
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

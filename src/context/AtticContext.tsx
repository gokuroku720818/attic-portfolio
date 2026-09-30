import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Asset, Member, RankedMember, Shoutout } from '../types';
import {
  loadAtticData,
  saveAsset,
  removeAsset,
  saveShoutout,
  likeShoutout,
  verifyMemberPin,
  resetToSeedData,
} from '../services/storage';
import { calculateRankings } from '../utils/ranking';
import { refreshAssetPrices } from '../services/priceEngine';

interface AtticContextType {
  members: Member[];
  assets: Asset[];
  shoutouts: Shoutout[];
  rankedMembers: RankedMember[];
  activeMember: Member | null;
  isRefreshing: boolean;
  loginMember: (memberId: string, pin: string) => boolean;
  logout: () => void;
  addOrUpdateAsset: (asset: Asset) => void;
  deleteAsset: (assetId: string) => void;
  postShoutout: (memberId: string, message: string) => void;
  reactToShoutout: (shoutoutId: string) => void;
  refreshPrices: () => Promise<void>;
  resetData: () => void;
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

  // 시세 갱신
  const refreshPrices = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const updatedAssets = await refreshAssetPrices(data.assets);
      setData((prev) => {
        const next = { ...prev, assets: updatedAssets };
        localStorage.setItem('attic_assets_v1', JSON.stringify(updatedAssets));
        return next;
      });
    } catch (error) {
      console.error('시세 갱신 실패:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [data.assets]);

  // 4자리 PIN 로그인
  const loginMember = useCallback((memberId: string, pin: string): boolean => {
    const isValid = verifyMemberPin(memberId, pin);
    if (isValid) {
      const member = data.members.find((m) => m.id === memberId) || null;
      setActiveMember(member);
      return true;
    }
    return false;
  }, [data.members]);

  const logout = useCallback(() => {
    setActiveMember(null);
  }, []);

  // 자산 추가/수정
  const addOrUpdateAsset = useCallback((asset: Asset) => {
    saveAsset(asset);
    setData(loadAtticData());
  }, []);

  // 자산 삭제
  const deleteAsset = useCallback((assetId: string) => {
    removeAsset(assetId);
    setData(loadAtticData());
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
    setData(loadAtticData());
  }, [data.members]);

  // 사자후 공감
  const reactToShoutout = useCallback((shoutoutId: string) => {
    likeShoutout(shoutoutId);
    setData(loadAtticData());
  }, []);

  // 초기화
  const resetData = useCallback(() => {
    const fresh = resetToSeedData();
    setData(fresh);
    setActiveMember(null);
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
        addOrUpdateAsset,
        deleteAsset,
        postShoutout,
        reactToShoutout,
        refreshPrices,
        resetData,
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

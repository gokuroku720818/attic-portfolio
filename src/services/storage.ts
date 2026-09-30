import { Asset, Member, Shoutout } from '../types';
import { INITIAL_MEMBERS, INITIAL_ASSETS, INITIAL_SHOUTOUTS } from '../data/seedData';

const STORAGE_KEYS = {
  MEMBERS: 'attic_members_v2',
  ASSETS: 'attic_assets_v2',
  SHOUTOUTS: 'attic_shoutouts_v2',
};

export interface AtticData {
  members: Member[];
  assets: Asset[];
  shoutouts: Shoutout[];
}

/**
 * 저장소에서 데이터를 로드합니다. 데이터가 없으면 14인 시드 데이터로 자동 초기화합니다.
 */
export function loadAtticData(): AtticData {
  try {
    const rawMembers = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    const rawAssets = localStorage.getItem(STORAGE_KEYS.ASSETS);
    const rawShoutouts = localStorage.getItem(STORAGE_KEYS.SHOUTOUTS);

    let members: Member[] = rawMembers ? JSON.parse(rawMembers) : [];
    let assets: Asset[] = rawAssets ? JSON.parse(rawAssets) : [];
    let shoutouts: Shoutout[] = rawShoutouts ? JSON.parse(rawShoutouts) : [];

    // 비어 있는 경우 시드 데이터로 자동 세팅
    if (members.length === 0) {
      members = [...INITIAL_MEMBERS];
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    }

    if (assets.length === 0) {
      assets = [...INITIAL_ASSETS];
      localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
    }

    if (shoutouts.length === 0) {
      shoutouts = [...INITIAL_SHOUTOUTS];
      localStorage.setItem(STORAGE_KEYS.SHOUTOUTS, JSON.stringify(shoutouts));
    }

    return { members, assets, shoutouts };
  } catch (error) {
    console.error('LocalStorage 로드 실패, 기본값 사용:', error);
    return {
      members: [...INITIAL_MEMBERS],
      assets: [...INITIAL_ASSETS],
      shoutouts: [...INITIAL_SHOUTOUTS],
    };
  }
}

/**
 * 자산 생성 또는 수정 저장
 */
export function saveAsset(asset: Asset): void {
  const data = loadAtticData();
  const index = data.assets.findIndex((a) => a.id === asset.id);

  if (index >= 0) {
    data.assets[index] = asset;
  } else {
    data.assets.push(asset);
  }

  localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(data.assets));
}

/**
 * 자산 삭제
 */
export function removeAsset(assetId: string): void {
  const data = loadAtticData();
  const filtered = data.assets.filter((a) => a.id !== assetId);
  localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(filtered));
}

/**
 * 새로운 한줄 사자후 등록
 */
export function saveShoutout(shoutout: Shoutout): void {
  const data = loadAtticData();
  const updated = [shoutout, ...data.shoutouts];
  localStorage.setItem(STORAGE_KEYS.SHOUTOUTS, JSON.stringify(updated));
}

/**
 * 사자후 공감/리액션 증가
 */
export function likeShoutout(shoutoutId: string): void {
  const data = loadAtticData();
  const target = data.shoutouts.find((s) => s.id === shoutoutId);
  if (target) {
    target.reactionCount += 1;
    localStorage.setItem(STORAGE_KEYS.SHOUTOUTS, JSON.stringify(data.shoutouts));
  }
}

/**
 * 4자리 간이 PIN 검증 (Review Focus 3)
 */
export function verifyMemberPin(memberId: string, inputPin: string): boolean {
  const data = loadAtticData();
  const member = data.members.find((m) => m.id === memberId);
  if (!member) return false;
  return member.pin === inputPin;
}

/**
 * 시드 데이터로 전체 초기화
 */
export function resetToSeedData(): AtticData {
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(INITIAL_MEMBERS));
  localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(INITIAL_ASSETS));
  localStorage.setItem(STORAGE_KEYS.SHOUTOUTS, JSON.stringify(INITIAL_SHOUTOUTS));
  return {
    members: [...INITIAL_MEMBERS],
    assets: [...INITIAL_ASSETS],
    shoutouts: [...INITIAL_SHOUTOUTS],
  };
}

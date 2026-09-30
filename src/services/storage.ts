import { Asset, Member, Shoutout } from '../types';
import { INITIAL_MEMBERS, INITIAL_ASSETS, INITIAL_SHOUTOUTS, HOST_PIN, HOST_MEMBER_NAME } from '../data/seedData';

const STORAGE_KEYS = {
  MEMBERS: 'attic_members_v3',
  ASSETS: 'attic_assets_v3',
  SHOUTOUTS: 'attic_shoutouts_v3',
};

export interface AtticData {
  members: Member[];
  assets: Asset[];
  shoutouts: Shoutout[];
}

/**
 * 저장소에서 데이터를 로드합니다. 데이터가 없으면 시드 데이터로 자동 초기화합니다.
 */
export function loadAtticData(): AtticData {
  try {
    const rawMembers = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    const rawAssets = localStorage.getItem(STORAGE_KEYS.ASSETS);
    const rawShoutouts = localStorage.getItem(STORAGE_KEYS.SHOUTOUTS);

    let members: Member[] = rawMembers ? JSON.parse(rawMembers) : [];
    let assets: Asset[] = rawAssets ? JSON.parse(rawAssets) : [];
    let shoutouts: Shoutout[] = rawShoutouts ? JSON.parse(rawShoutouts) : [];

    if (members.length === 0) {
      members = [...INITIAL_MEMBERS];
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    }

    if (!rawAssets) {
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
 * 멤버의 비밀번호 설정 여부 확인
 */
export function isMemberPinSet(memberId: string): boolean {
  const data = loadAtticData();
  const member = data.members.find((m) => m.id === memberId);
  return Boolean(member && member.pin && member.pin.trim().length === 4);
}

/**
 * 멤버 비밀번호 최초 설정 및 변경
 */
export function setMemberPin(memberId: string, newPin: string): boolean {
  if (!/^\d{4}$/.test(newPin)) return false;

  const data = loadAtticData();
  const member = data.members.find((m) => m.id === memberId);
  if (!member) return false;

  member.pin = newPin;
  member.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(data.members));
  return true;
}

/**
 * 4자리 PIN 검증
 */
export function verifyMemberPin(memberId: string, inputPin: string): boolean {
  const data = loadAtticData();
  const member = data.members.find((m) => m.id === memberId);
  if (!member) return false;

  // 호스트 명왕의 경우 기본 7581
  if (member.name === HOST_MEMBER_NAME) {
    return member.pin === inputPin || inputPin === HOST_PIN;
  }

  // 비밀번호가 설정되어 있지 않은 경우
  if (!member.pin) {
    return false;
  }

  return member.pin === inputPin;
}

/**
 * 호스트(명왕) 전용 데이터 초기화
 */
export function resetDataByHost(hostPin: string): { success: boolean; message: string } {
  if (hostPin.trim() !== HOST_PIN) {
    return {
      success: false,
      message: '호스트 비밀번호가 올바르지 않습니다! (오직 명왕만 초기화 가능)',
    };
  }

  resetToSeedData();
  return {
    success: true,
    message: '호스트 권한으로 모든 데이터가 깨끗하게 초기화되었습니다!',
  };
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

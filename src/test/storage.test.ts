import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadAtticData,
  saveAsset,
  removeAsset,
  saveShoutout,
  verifyMemberPin,
} from '../services/storage';
import { Asset, Shoutout } from '../types';

describe('Storage and State Layer (LocalStorage & PIN verification)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with 15 seed members and empty assets when empty (Review Focus 5)', () => {
    const data = loadAtticData();
    expect(data.members).toHaveLength(15);
    expect(data.assets).toHaveLength(0);
    expect(data.shoutouts.length).toBeGreaterThanOrEqual(3);
  });

  it('should verify member 4-digit PIN correctly (Review Focus 3)', () => {
    const data = loadAtticData();
    const firstMember = data.members[0];

    expect(verifyMemberPin(firstMember.id, firstMember.pin)).toBe(true);
    expect(verifyMemberPin(firstMember.id, '9999')).toBe(false);
    expect(verifyMemberPin('non-existent-id', '1234')).toBe(false);
  });

  it('should add, update, and remove an asset in storage', () => {
    loadAtticData();
    const testAsset: Asset = {
      id: 'test-asset-1',
      memberId: 'm1',
      type: 'real_estate',
      name: '판교 봇들마을 84㎡',
      symbol: 'RE-PANGYO',
      buyPrice: 1500000000,
      quantity: 1,
      currentPrice: 1900000000,
      currency: 'KRW',
      updatedAt: new Date().toISOString(),
    };

    // 추가
    saveAsset(testAsset);
    let currentData = loadAtticData();
    expect(currentData.assets.some((a) => a.id === 'test-asset-1')).toBe(true);

    // 수정 (평가액 인상)
    const updatedAsset: Asset = { ...testAsset, currentPrice: 2100000000 };
    saveAsset(updatedAsset);
    currentData = loadAtticData();
    const found = currentData.assets.find((a) => a.id === 'test-asset-1');
    expect(found?.currentPrice).toBe(2100000000);

    // 삭제
    removeAsset('test-asset-1');
    currentData = loadAtticData();
    expect(currentData.assets.some((a) => a.id === 'test-asset-1')).toBe(false);
  });

  it('should add new shoutout messages to the top', () => {
    const newShoutout: Shoutout = {
      id: 's-test',
      memberId: 'm1',
      memberName: '김버핏',
      avatar: '🎩',
      message: '다락방 여러분 모두 성투하세요!',
      createdAt: new Date().toISOString(),
      reactionCount: 0,
    };

    saveShoutout(newShoutout);
    const data = loadAtticData();
    expect(data.shoutouts[0].id).toBe('s-test');
    expect(data.shoutouts[0].message).toBe('다락방 여러분 모두 성투하세요!');
  });
});

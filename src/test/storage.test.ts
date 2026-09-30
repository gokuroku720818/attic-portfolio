import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadAtticData,
  saveAsset,
  removeAsset,
  saveShoutout,
  verifyMemberPin,
  isMemberPinSet,
  setMemberPin,
  resetDataByHost,
} from '../services/storage';
import { Asset, Shoutout } from '../types';

describe('Storage and State Layer (Host Myeongwang & Self PIN setup)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with 15 seed members and empty assets', () => {
    const data = loadAtticData();
    expect(data.members).toHaveLength(15);
    expect(data.assets).toHaveLength(0);
    expect(data.shoutouts.length).toBeGreaterThanOrEqual(3);
  });

  it('should have host Myeongwang initialized with PIN 7581', () => {
    const data = loadAtticData();
    const host = data.members.find((m) => m.name === '명왕');
    expect(host).toBeDefined();
    expect(verifyMemberPin(host!.id, '7581')).toBe(true);
    expect(verifyMemberPin(host!.id, '0000')).toBe(false);
  });

  it('should allow members to set their own initial 4-digit PIN', () => {
    const data = loadAtticData();
    const normalMember = data.members.find((m) => m.name === '당근탕(뚱땡이)')!;

    // 초기에는 비밀번호가 미설정 상태
    expect(isMemberPinSet(normalMember.id)).toBe(false);
    expect(verifyMemberPin(normalMember.id, '1234')).toBe(false);

    // 본인이 4자리 비밀번호 '9988' 직접 설정
    const setSuccess = setMemberPin(normalMember.id, '9988');
    expect(setSuccess).toBe(true);
    expect(isMemberPinSet(normalMember.id)).toBe(true);
    expect(verifyMemberPin(normalMember.id, '9988')).toBe(true);
  });

  it('should only allow host to reset data with correct PIN 7581', () => {
    // 잘못된 비번으로 초기화 시도
    const failRes = resetDataByHost('1234');
    expect(failRes.success).toBe(false);

    // 올바른 명왕 호스트 비번 7581로 초기화 시도
    const successRes = resetDataByHost('7581');
    expect(successRes.success).toBe(true);
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

    saveAsset(testAsset);
    let currentData = loadAtticData();
    expect(currentData.assets.some((a) => a.id === 'test-asset-1')).toBe(true);

    const updatedAsset: Asset = { ...testAsset, currentPrice: 2100000000 };
    saveAsset(updatedAsset);
    currentData = loadAtticData();
    const found = currentData.assets.find((a) => a.id === 'test-asset-1');
    expect(found?.currentPrice).toBe(2100000000);

    removeAsset('test-asset-1');
    currentData = loadAtticData();
    expect(currentData.assets.some((a) => a.id === 'test-asset-1')).toBe(false);
  });

  it('should add new shoutout messages to the top', () => {
    const newShoutout: Shoutout = {
      id: 's-test',
      memberId: 'm3',
      memberName: '명왕',
      avatar: '🐔',
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

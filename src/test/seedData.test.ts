import { describe, it, expect } from 'vitest';
import { INITIAL_MEMBERS, INITIAL_ASSETS, INITIAL_SHOUTOUTS } from '../data/seedData';
import { Member, Shoutout } from '../types';

describe('Seed Data Integrity (15 Attic Members)', () => {
  it('should have exactly 15 specified attic members', () => {
    expect(INITIAL_MEMBERS).toHaveLength(15);

    const memberNames = INITIAL_MEMBERS.map((m) => m.name);
    expect(memberNames).toContain('당근탕(뚱땡이)');
    expect(memberNames).toContain('사약');
    expect(memberNames).toContain('명왕');
    expect(memberNames).toContain('포모뇌신');
    expect(memberNames).toContain('빈돈미새');
    expect(memberNames).toContain('오레와고르');
    expect(memberNames).toContain('철약');
    expect(memberNames).toContain('제네시스');
    expect(memberNames).toContain('김팬지');
    expect(memberNames).toContain('하남자');
    expect(memberNames).toContain('아졸려');
    expect(memberNames).toContain('탈출도담');
    expect(memberNames).toContain('청담읍네오');
    expect(memberNames).toContain('진쿨보');
    expect(memberNames).toContain('퉁어게인');
  });

  it('should have valid member properties with 4-digit PIN', () => {
    INITIAL_MEMBERS.forEach((member: Member) => {
      expect(member.id).toBeTruthy();
      expect(member.name).toBeTruthy();
      expect(member.avatar).toBeTruthy();
      expect(member.pin).toMatch(/^\d{4}$/);
    });
  });

  it('should initialize with empty assets (0 won) as requested', () => {
    expect(INITIAL_ASSETS).toHaveLength(0);
  });

  it('should have custom shoutouts for the attic board', () => {
    expect(INITIAL_SHOUTOUTS.length).toBeGreaterThanOrEqual(3);
    INITIAL_SHOUTOUTS.forEach((s: Shoutout) => {
      expect(s.id).toBeTruthy();
      expect(s.message).toBeTruthy();
      expect(s.memberName).toBeTruthy();
    });
  });
});

import { describe, it, expect } from 'vitest';
import { INITIAL_MEMBERS, INITIAL_ASSETS, INITIAL_SHOUTOUTS, HOST_PIN } from '../data/seedData';
import { Member, Shoutout } from '../types';

describe('Seed Data Integrity (15 Attic Members & Host)', () => {
  it('should have exactly 15 specified attic members', () => {
    expect(INITIAL_MEMBERS).toHaveLength(15);
  });

  it('should have host Myeongwang configured with 7581 PIN', () => {
    const host = INITIAL_MEMBERS.find((m) => m.name === '명왕');
    expect(host).toBeDefined();
    expect(host?.pin).toBe(HOST_PIN);
    expect(host?.pin).toBe('7581');
  });

  it('should have normal members with empty initial PIN for self-registration', () => {
    const normalMembers = INITIAL_MEMBERS.filter((m) => m.name !== '명왕');
    normalMembers.forEach((member: Member) => {
      expect(member.pin).toBe('');
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

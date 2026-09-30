import {beforeEach,it,expect,vi} from 'vitest';
const mocks=vi.hoisted(()=>({from:vi.fn(),fetch:vi.fn()}));
vi.mock('../services/supabaseClient',()=>({supabase:{from:mocks.from}}));
vi.mock('../services/cloudBriefing',()=>({fetchBriefingSnapshots:mocks.fetch}));
import {syncAchievements} from '../services/cloudAchievements';
beforeEach(()=>{mocks.from.mockReset();mocks.fetch.mockReset();});
it('과거 달성 업적은 현재 기록이 없어도 유지한다',async()=>{
 const earned={version:1,memberId:'m',id:'first-champion',day:'2026-09-30'};
 mocks.fetch.mockResolvedValue([]);
 mocks.from.mockReturnValue({select:()=>({like:()=>({limit:async()=>({data:[{data:earned}],error:null})})})});
 expect((await syncAchievements()).earned).toEqual([earned]);
});
it('새 업적은 충돌 무시로 저장하고 서버에서 다시 읽어 확인한다',async()=>{
 mocks.fetch.mockResolvedValue([{version:1,day:'2026-09-30',capturedAt:'2026-09-30T10:00:00Z',members:[{id:'m',name:'명왕',avatar:'👑',rank:1,rate:1,holdings:'same'}],assets:[]}]);
 const upsert=vi.fn().mockResolvedValue({error:null});
 const selectResult=(data:unknown[])=>({select:()=>({like:()=>({limit:async()=>({data,error:null})})})});
 mocks.from.mockReturnValueOnce(selectResult([])).mockReturnValueOnce({upsert}).mockReturnValueOnce(selectResult([]));
 const result=await syncAchievements();
 expect(upsert.mock.calls[0][1]).toEqual({onConflict:'key',ignoreDuplicates:true});
 expect(result.earned).toEqual([]);
 expect(mocks.from).toHaveBeenCalledTimes(3);
});

import {beforeEach,expect,it,vi} from 'vitest';
const db=vi.hoisted(()=>({from:vi.fn()}));
vi.mock('../services/supabaseClient',()=>({supabase:db}));
import {saveBriefingSnapshot,fetchBriefingSnapshots} from '../services/cloudBriefing';
import {buildSnapshot} from '../services/briefing';
beforeEach(()=>db.from.mockReset());
it('공유 원본을 읽지 못하면 기록을 쓰지 않는다',async()=>{
 const maybeSingle=vi.fn().mockResolvedValue({data:null,error:{message:'failed'}});
 db.from.mockReturnValue({select:()=>({eq:()=>({maybeSingle})})});
 expect(await saveBriefingSnapshot(buildSnapshot([],[]))).toBe(false);
 expect(db.from).toHaveBeenCalledTimes(1);
});
it('클라이언트 데이터 대신 서버 원본을 별도 날짜 키에 저장한다',async()=>{
 const source={members:[],assets:[]};
 const upsert=vi.fn().mockResolvedValue({error:null});
 db.from.mockReturnValueOnce({select:()=>({eq:()=>({maybeSingle:async()=>({data:{data:source},error:null})})})}).mockReturnValueOnce({upsert});
 expect(await saveBriefingSnapshot(buildSnapshot([],[]))).toBe(true);
 expect(upsert.mock.calls[0][0].key).toMatch(/^briefing_day_v1:/);
 expect(upsert.mock.calls[0][0].data).not.toHaveProperty('shoutouts');
 expect(upsert.mock.calls[0][0].data.members).toEqual([]);
});
it('서버 조회 오류를 성공한 빈 기록으로 숨기지 않는다',async()=>{
 db.from.mockReturnValue({select:()=>({like:()=>({gte:()=>({order:()=>({limit:async()=>({data:null,error:{message:'failed'}})})})})})});
 await expect(fetchBriefingSnapshots()).rejects.toThrow('불러오지 못했습니다');
});

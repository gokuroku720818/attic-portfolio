import {expect,it} from 'vitest';
import {updateHistory} from '../services/history';
it('같은 날 기록은 하나로 유지하고 이전 날 기록을 보존한다',()=>{
 const rows=updateHistory([{day:'2026-09-29',values:{m:{rank:2,rate:1}}}],{day:'2026-09-30',values:{m:{rank:1,rate:2}}});
 expect(updateHistory(rows,{day:'2026-09-30',values:{m:{rank:1,rate:3}}})).toEqual([{day:'2026-09-29',values:{m:{rank:2,rate:1}}},{day:'2026-09-30',values:{m:{rank:1,rate:3}}}]);
});

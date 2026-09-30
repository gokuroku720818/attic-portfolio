import {expect,it} from 'vitest';
import {mergeDataChanges} from '../services/dataMerge';
import {AtticData} from '../services/storage';
const base={members:[],assets:[{id:'a',quantity:1,buyPrice:100,currentPrice:100}],shoutouts:[{id:'s',reactionCount:1,message:'x'}]} as unknown as AtticData;
it('수량 수정은 동시에 갱신된 시세와 새 자산을 보존한다',()=>{const current={...base,assets:[{...base.assets[0],currentPrice:120},{...base.assets[0],id:'b'}]};const next={...base,assets:[{...base.assets[0],quantity:2}]};expect(mergeDataChanges(current,base,next).assets).toEqual([{...base.assets[0],currentPrice:120,quantity:2},{...base.assets[0],id:'b'}]);});
it('변경하지 않은 자산을 다른 멤버가 삭제했으면 되살리지 않는다',()=>{const next={...base,shoutouts:[]};expect(mergeDataChanges({...base,assets:[]},base,next).assets).toEqual([]);});
it('공감 증가를 병합해 다른 사람의 공감을 보존한다',()=>{expect(mergeDataChanges({...base,shoutouts:[{...base.shoutouts[0],reactionCount:3}]},base,{...base,shoutouts:[{...base.shoutouts[0],reactionCount:2}]}).shoutouts[0].reactionCount).toBe(4);});

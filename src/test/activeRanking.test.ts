import { expect,it } from 'vitest';
import { calculateRankings } from '../utils/ranking';
import { Member,Asset } from '../types';
it('미등록 멤버는 손실 중인 투자자보다 앞서지 않고 순위에서 제외한다',()=>{
 const m=(id:string):Member=>({id,name:id,pin:'',avatar:'',bio:'',updatedAt:''});
 const a:Asset={id:'a',memberId:'active',type:'kr_stock',symbol:'A',name:'A',buyPrice:100,currentPrice:80,quantity:1,currency:'KRW',updatedAt:''};
 expect(calculateRankings([m('empty'),m('active')],[a]).map(x=>x.member.id)).toEqual(['active']);
});

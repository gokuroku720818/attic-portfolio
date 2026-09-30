import {it,expect} from 'vitest';
import {mergePriceUpdates} from '../services/priceMerge';
import {Asset} from '../types';
const a:Asset={id:'a',memberId:'m',type:'kr_stock',symbol:'A',name:'A',buyPrice:100,quantity:1,currentPrice:100,currency:'KRW',updatedAt:'old'};
it('조회 중 수정한 수량과 평단을 유지한다',()=>{
 expect(mergePriceUpdates([{...a,quantity:2,buyPrice:90}],[a],[{...a,currentPrice:120}])).toEqual([{...a,quantity:2,buyPrice:90,currentPrice:120}]);
});
it('조회 중 삭제한 자산을 되살리지 않는다',()=>expect(mergePriceUpdates([],[a],[{...a,currentPrice:120}])).toEqual([]));
it('조회 중 종목이 바뀌었으면 이전 종목 시세를 적용하지 않는다',()=>expect(mergePriceUpdates([{...a,symbol:'B'}],[a],[{...a,currentPrice:120}])[0].currentPrice).toBe(100));

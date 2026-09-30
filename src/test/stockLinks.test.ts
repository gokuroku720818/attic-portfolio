import {expect,it} from 'vitest';
import {getAssetLinks} from '../utils/stockLinks';
it('국내주식과 영문 포함 ETF 코드로 네이버·토스 링크를 만든다',()=>{
 expect(getAssetLinks({name:'삼성전자',symbol:'005930',type:'kr_stock'}).naverUrl).toBe('https://m.stock.naver.com/domestic/stock/005930/total');
 expect(getAssetLinks({name:'ETF',symbol:'0193W0',type:'kr_stock'}).tossUrl).toBe('https://tossinvest.com/stocks/A0193W0');
});
it('코드 없이 이름으로 등록한 삼성전자와 하이닉스도 실제 종목으로 연결한다',()=>{
 expect(getAssetLinks({name:'삼성전자',symbol:'CUSTOM',type:'kr_stock'}).codeOrSymbol).toBe('005930');
 expect(getAssetLinks({name:'하이닉스',symbol:'CUSTOM',type:'kr_stock'}).codeOrSymbol).toBe('000660');
});
it('미국주식은 해외종목 링크로 연결한다',()=>expect(getAssetLinks({name:'구글',symbol:'CUSTOM',type:'us_stock'}).naverUrl).toBe('https://m.stock.naver.com/worldstock/stock/GOOGL/total'));
it('알 수 없는 종목은 임의의 다른 종목 대신 이름 검색으로 연결한다',()=>expect(getAssetLinks({name:'미등록종목',symbol:'CUSTOM',type:'kr_stock'}).naverUrl).toContain('keyword='+encodeURIComponent('미등록종목')));

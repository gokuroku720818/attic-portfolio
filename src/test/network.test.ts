import {it,expect,vi,afterEach} from 'vitest';
import {fetchWithTimeout} from '../services/network';
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();});
it('응답 없는 서버 요청은 15초 뒤 종료한다',async()=>{
 vi.useFakeTimers();
 vi.stubGlobal('fetch',vi.fn((_:unknown,init:RequestInit)=>new Promise((_,reject)=>init.signal?.addEventListener('abort',()=>reject(init.signal?.reason)))));
 const request=expect(fetchWithTimeout('https://example.test')).rejects.toThrow('요청 시간 초과');
 await vi.advanceTimersByTimeAsync(15000);await request;
});
it('상위 요청의 취소 신호를 유지한다',async()=>{
 vi.stubGlobal('fetch',vi.fn((_:unknown,init:RequestInit)=>new Promise((_,reject)=>init.signal?.addEventListener('abort',()=>reject(new Error('cancelled'))))));
 const controller=new AbortController();const request=expect(fetchWithTimeout('https://example.test',{signal:controller.signal})).rejects.toThrow('cancelled');controller.abort();await request;
});

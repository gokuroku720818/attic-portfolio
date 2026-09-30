const cache=new Map<string,{value:unknown;expires:number}>();
const pending=new Map<string,Promise<unknown>>();
const versions=new Map<string,number>();
export function invalidateRequests(prefix:string){
 for(const key of new Set([...cache.keys(),...pending.keys()]))if(key.startsWith(prefix)){cache.delete(key);pending.delete(key);versions.set(key,(versions.get(key)||0)+1);}
}
export function cachedRequest<T>(key:string,request:()=>Promise<T>,ttl=30000):Promise<T>{
 const hit=cache.get(key);if(hit&&hit.expires>Date.now())return Promise.resolve(hit.value as T);
 const running=pending.get(key);if(running)return running as Promise<T>;
 const version=versions.get(key)||0;
 const promise=request().then(value=>{if((versions.get(key)||0)===version)cache.set(key,{value,expires:Date.now()+ttl});return value;}).finally(()=>{if(pending.get(key)===promise)pending.delete(key);});
 pending.set(key,promise);return promise;
}

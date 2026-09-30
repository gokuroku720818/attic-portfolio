import {AtticData} from './storage';
export function cacheAtticData(data:AtticData):void {
 try{localStorage.setItem('attic_members_v3',JSON.stringify(data.members));localStorage.setItem('attic_assets_v3',JSON.stringify(data.assets));localStorage.setItem('attic_shoutouts_v3',JSON.stringify(data.shoutouts));}catch{/* 캐시 실패는 서버 저장/화면 동작을 막지 않는다. */}
}

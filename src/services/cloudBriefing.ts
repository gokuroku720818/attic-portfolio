import {supabase} from './supabaseClient';
import {BriefingSnapshot,buildSnapshot,isSnapshot,seoulDay,shiftDay} from './briefing';
const PREFIX='briefing_day_v1:';
// main_state와 분리해 포트폴리오 수정/시세 갱신을 덮어쓰지 않는다.
export async function fetchBriefingSnapshots(days=90):Promise<BriefingSnapshot[]> {
 const {data,error}=await supabase.from('attic_store').select('key,data').like('key',`${PREFIX}%`).gte('key',`${PREFIX}${shiftDay(seoulDay(),-days)}`).order('key',{ascending:true}).limit(Math.min(days+1,5000));
 if(error)throw new Error('브리핑 기록을 불러오지 못했습니다');
 return (data||[]).map(row=>row.data).filter(isSnapshot);
}
export async function saveBriefingSnapshot(snapshot:BriefingSnapshot):Promise<boolean> {
 if(!isSnapshot(snapshot))return false;
 // 클라이언트의 오래된 화면이 새 시세 기록을 덮어쓰지 않도록 공유 원본을 다시 읽는다.
 const {data:source,error:readError}=await supabase.from('attic_store').select('data').eq('key','main_state').maybeSingle();
 if(readError||!source?.data)return false;
 const fresh=buildSnapshot(source.data.members,source.data.assets);
 if(fresh.day!==snapshot.day)return false;
 const {error}=await supabase.from('attic_store').upsert({key:`${PREFIX}${fresh.day}`,data:fresh,updated_at:fresh.capturedAt},{onConflict:'key'});
 return !error;
}

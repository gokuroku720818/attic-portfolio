import {supabase} from './supabaseClient';
import {EarnedAchievement,evaluateAchievements,isEarnedAchievement} from './achievements';
import {fetchBriefingSnapshots} from './cloudBriefing';
const PREFIX='achievement_v1:';
export async function syncAchievements(){
 const snapshots=await fetchBriefingSnapshots(3650);
 const {data:existing,error:readError}=await supabase.from('attic_store').select('key,data').like('key',`${PREFIX}%`).limit(5000);
 if(readError)throw new Error('업적 기록을 불러오지 못했습니다');
 const earned=(existing||[]).map(row=>row.data).filter(isEarnedAchievement) as EarnedAchievement[];
 const fresh=evaluateAchievements(snapshots).filter(a=>!earned.some(e=>e.memberId===a.memberId&&e.id===a.id));
 if(fresh.length){
  const {error}=await supabase.from('attic_store').upsert(fresh.map(a=>({key:`${PREFIX}${encodeURIComponent(a.memberId)}:${a.id}`,data:a,updated_at:new Date().toISOString()})),{onConflict:'key',ignoreDuplicates:true});
  if(error)throw new Error('새 업적 저장에 실패했습니다');
  const {data,error:checkError}=await supabase.from('attic_store').select('key,data').like('key',`${PREFIX}%`).limit(5000);
  if(checkError)throw new Error('업적 저장 확인에 실패했습니다');
  return {snapshots,earned:(data||[]).map(row=>row.data).filter(isEarnedAchievement)};
 }
 return {snapshots,earned};
}

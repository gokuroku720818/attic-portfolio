import {createContext,useContext,useEffect,useState,ReactNode} from 'react';
import {useAtticStore} from './AtticContext';
import {BriefingSnapshot} from '../services/briefing';
import {EarnedAchievement} from '../services/achievements';
import {syncAchievements} from '../services/cloudAchievements';
const AchievementContext=createContext<{earned:EarnedAchievement[];snapshots:BriefingSnapshot[];status:string}>({earned:[],snapshots:[],status:'서버 업적 연결 중…'});
export function AchievementProvider({children}:{children:ReactNode}) {
 const {assets}=useAtticStore();
 const [value,setValue]=useState({earned:[] as EarnedAchievement[],snapshots:[] as BriefingSnapshot[],status:'서버 업적 연결 중…'});
 useEffect(()=>{
  let cancelled=false,busy=false;
  const refresh=async()=>{if(busy)return;busy=true;try{const next=await syncAchievements();if(!cancelled)setValue({...next,status:'서버 업적 저장 확인 완료'});}catch{if(!cancelled)setValue(old=>({...old,status:'업적 서버 연결 실패 · 잠시 후 다시 확인합니다'}));}finally{busy=false;}};
  const initial=setTimeout(()=>void refresh(),2500);
  const interval=setInterval(()=>{if(document.visibilityState==='visible')void refresh();},60000);
  return()=>{cancelled=true;clearTimeout(initial);clearInterval(interval);};
 },[assets]);
 return <AchievementContext.Provider value={value}>{children}</AchievementContext.Provider>;
}
export const useAchievements=()=>useContext(AchievementContext);

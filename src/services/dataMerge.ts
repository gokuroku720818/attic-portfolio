import {AtticData} from './storage';
function mergeRows<T extends {id:string}>(current:T[],before:T[],after:T[]):T[]{
 const result=new Map(current.map(row=>[row.id,row]));
 const previous=new Map(before.map(row=>[row.id,row]));
 const incoming=new Map(after.map(row=>[row.id,row]));
 for(const row of before)if(!incoming.has(row.id))result.delete(row.id);
 for(const row of after){
  const old=previous.get(row.id),remote=result.get(row.id);
  if(!old){if(!remote)result.set(row.id,row);continue;}
  if(!remote)continue; // 다른 클라이언트에서 삭제한 항목은 부활시키지 않는다.
  const updated={...remote} as Record<string,unknown>;
  for(const key of new Set([...Object.keys(old),...Object.keys(row)])){
   if(key==='id')continue;
   const was=(old as Record<string,unknown>)[key],next=(row as Record<string,unknown>)[key];
   if(JSON.stringify(was)===JSON.stringify(next))continue;
   if(key==='reactionCount'&&typeof was==='number'&&typeof next==='number'&&typeof updated[key]==='number')updated[key]=(updated[key] as number)+next-was;
   else if(next===undefined)delete updated[key];
   else updated[key]=next;
  }
  result.set(row.id,updated as T);
 }
 return [...result.values()];
}
export function mergeDataChanges(current:AtticData,before:AtticData,after:AtticData):AtticData {
 return {...current,members:mergeRows(current.members,before.members,after.members),assets:mergeRows(current.assets,before.assets,after.assets),shoutouts:mergeRows(current.shoutouts,before.shoutouts,after.shoutouts)};
}

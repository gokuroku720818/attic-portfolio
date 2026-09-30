export async function fetchWithTimeout(input:RequestInfo|URL,init?:RequestInit):Promise<Response>{
 const controller=new AbortController();
 const external=init?.signal||(input instanceof Request?input.signal:undefined);
 const abort=()=>controller.abort(external?.reason);
 if(external?.aborted)abort();else external?.addEventListener('abort',abort,{once:true});
 const timer=setTimeout(()=>controller.abort(new DOMException('요청 시간 초과','TimeoutError')),15000);
 try{return await fetch(input,{...init,signal:controller.signal});}
 finally{clearTimeout(timer);external?.removeEventListener('abort',abort);}
}

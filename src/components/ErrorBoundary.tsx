import {Component,ReactNode} from 'react';
export class ErrorBoundary extends Component<{children:ReactNode},{failed:boolean}> {
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?<div role="alert" className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6"><div className="max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6"><h1 className="font-bold text-xl">화면을 불러오지 못했습니다</h1><p className="text-sm text-slate-400 mt-3">배포 중 파일이 바뀌었거나 연결이 끊겼을 수 있습니다. 새로고침해서 다시 확인해 주세요.</p><button onClick={()=>window.location.reload()} className="mt-4 rounded-lg bg-amber-400 text-slate-950 font-bold px-4 py-2">다시 불러오기</button></div></div>:this.props.children;}
}

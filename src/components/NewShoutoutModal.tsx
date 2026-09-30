import React, { useState } from 'react';
import { useAtticStore } from '../context/AtticContext';
import { X, Send, Sparkles } from 'lucide-react';

interface NewShoutoutModalProps {
  onClose: () => void;
}

export const NewShoutoutModal: React.FC<NewShoutoutModalProps> = ({ onClose }) => {
  const { members, activeMember, postShoutout } = useAtticStore();
  const [selectedMemberId, setSelectedMemberId] = useState(
    activeMember ? activeMember.id : members[0]?.id || ''
  );
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    postShoutout(selectedMemberId, message.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📣</span>
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-1.5">
              다락방 사자후 외치기
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-400">전체 전광판에 당신의 목소리를 띄웁니다</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 멤버 선택 */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              외치는 사람 (멤버 선택)
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.avatar} {m.name} ({m.role || '멤버'})
                </option>
              ))}
            </select>
          </div>

          {/* 한마디 입력 */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              오늘의 한마디 (절규, 환호, 도발, 조언 등)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="예: 오늘 삼전 평단 낮췄습니다! 한강물 아직 춥네요 등"
              maxLength={80}
              rows={3}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none"
            />
            <div className="text-right text-[11px] text-slate-500 mt-1">
              {message.length} / 80자
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>전광판에 띄우기</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

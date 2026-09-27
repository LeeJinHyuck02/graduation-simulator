import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const LockButton: React.FC = () => {
  const { isAuthenticated, unlock, lock } = useAuthStore();
  const [showInput, setShowInput] = useState(false);
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await unlock(password);
    if (ok) {
      setShowInput(false);
      setPassword('');
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  if (isAuthenticated) {
    return (
      <button
        onClick={lock}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium bg-postech/10 hover:bg-postech/20 text-postech border-postech/30 transition-all"
        title="편집 모드 잠금"
      >
        <Lock size={13} />
        <span>편집 중</span>
      </button>
    );
  }

  if (showInput) {
    return (
      <form onSubmit={handleUnlock} className="flex items-center gap-1.5">
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            placeholder="비밀번호"
            autoFocus
            className={`w-28 px-2 py-1 text-xs bg-dark-card border rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none pr-7 ${
              error ? 'border-red-500 focus:border-red-500' : 'border-dark-border focus:border-postech'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPw((p) => !p)}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          >
            {showPw ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
        </div>
        <button
          type="submit"
          className="px-2 py-1 text-xs font-semibold bg-postech hover:bg-postech-hover text-white rounded-lg transition-colors"
        >
          확인
        </button>
        <button
          type="button"
          onClick={() => { setShowInput(false); setPassword(''); setError(false); }}
          className="px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          취소
        </button>
      </form>
    );
  }

  return (
    <button
      onClick={() => setShowInput(true)}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium bg-dark-card hover:bg-dark-hover text-zinc-400 hover:text-zinc-200 border-dark-border/60 transition-all"
      title="편집 모드 잠금 해제"
    >
      <Lock size={13} />
      <span>잠금</span>
    </button>
  );
};

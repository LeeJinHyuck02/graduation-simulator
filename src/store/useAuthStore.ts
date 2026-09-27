import { create } from 'zustand';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirebaseAuth } from '../services/firebaseClient';

// 편집자 계정 이메일 (환경변수 VITE_EDITOR_EMAIL, GitHub Secrets 또는 .env.local)
// 비밀번호 검증과 쓰기 권한은 Firebase Authentication + Firestore 보안 규칙이 담당합니다.
const EDITOR_EMAIL = (import.meta.env.VITE_EDITOR_EMAIL || '').trim();

interface AuthState {
  isAuthenticated: boolean;
  unlock: (password: string) => Promise<boolean>;
  lock: () => Promise<void>;
}

export const useAuthStore = create<AuthState>(() => ({
  isAuthenticated: false,

  unlock: async (password: string) => {
    const auth = getFirebaseAuth();
    // Firebase 또는 편집자 이메일이 설정되지 않은 빌드에서는 편집 불가 (보기 전용)
    if (!auth || !EDITOR_EMAIL) return false;
    try {
      await signInWithEmailAndPassword(auth, EDITOR_EMAIL, password);
      return true;
    } catch (err) {
      console.warn('편집자 로그인 실패:', err);
      return false;
    }
  },

  lock: async () => {
    const auth = getFirebaseAuth();
    if (auth) await signOut(auth);
  },
}));

// Firebase 로그인 상태 변화(로그인/로그아웃/새로고침 후 복원)를 스토어에 반영
const auth = getFirebaseAuth();
if (auth) {
  onAuthStateChanged(auth, (user) => {
    useAuthStore.setState({ isAuthenticated: Boolean(user) });
  });
}

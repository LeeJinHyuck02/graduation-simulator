import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

export interface FirebaseConfig {
  apiKey: string;
  authDomain?: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

const STORAGE_KEYS = {
  FIREBASE_CONFIG: 'postech_sim_firebase_config_v1',
  SYNC_ROOM_ID: 'postech_sim_sync_room_id_v1',
};

export const DEFAULT_ROOM_ID = 'postech_math_plan_default';

export function getStoredSyncRoomId(): string {
  return localStorage.getItem(STORAGE_KEYS.SYNC_ROOM_ID) || DEFAULT_ROOM_ID;
}

export function saveStoredSyncRoomId(roomId: string): void {
  const trimmed = roomId.trim();
  if (trimmed) {
    localStorage.setItem(STORAGE_KEYS.SYNC_ROOM_ID, trimmed);
  } else {
    localStorage.setItem(STORAGE_KEYS.SYNC_ROOM_ID, DEFAULT_ROOM_ID);
  }
}

export function isConfiguredViaEnv(): boolean {
  return Boolean(import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID);
}

export function getStoredFirebaseConfig(): FirebaseConfig | null {
  // 1. 환경변수 (VITE_FIREBASE_*) 최우선 (GitHub Secrets 또는 .env.local)
  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  if (envApiKey && envProjectId) {
    return {
      apiKey: envApiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
      projectId: envProjectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${envProjectId}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    };
  }

  // 2. 브라우저 LocalStorage 수동 입력값
  const saved = localStorage.getItem(STORAGE_KEYS.FIREBASE_CONFIG);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && parsed.projectId) {
        return parsed as FirebaseConfig;
      }
    } catch {
      // parse error, fallback
    }
  }

  return null;
}

export function saveFirebaseConfig(config: FirebaseConfig | null): void {
  if (config) {
    localStorage.setItem(STORAGE_KEYS.FIREBASE_CONFIG, JSON.stringify(config));
  } else {
    localStorage.removeItem(STORAGE_KEYS.FIREBASE_CONFIG);
  }
}

/**
 * 사용자가 Firebase 콘솔에서 복사한 코드 스니펫(JS 객체 또는 JSON 문자열)을 파싱하는 유틸리티
 */
export function parseFirebaseSnippet(input: string): FirebaseConfig | null {
  if (!input || !input.trim()) return null;

  // 1. 순수 JSON 파싱 시도
  try {
    const json = JSON.parse(input);
    if (json.apiKey && json.projectId) {
      return {
        apiKey: String(json.apiKey).trim(),
        authDomain: json.authDomain ? String(json.authDomain).trim() : undefined,
        projectId: String(json.projectId).trim(),
        storageBucket: json.storageBucket ? String(json.storageBucket).trim() : undefined,
        messagingSenderId: json.messagingSenderId ? String(json.messagingSenderId).trim() : undefined,
        appId: json.appId ? String(json.appId).trim() : '',
      };
    }
  } catch {
    // Not valid JSON, continue with regex
  }

  // 2. JS 객체 스니펫(const firebaseConfig = { apiKey: "..." }) 정규식 추출
  const extractField = (key: string): string | undefined => {
    const regex = new RegExp(`${key}\\s*:\\s*["'\`]([^"'\`]+)["'\`]`, 'i');
    const match = input.match(regex);
    return match ? match[1].trim() : undefined;
  };

  const apiKey = extractField('apiKey');
  const projectId = extractField('projectId');
  const authDomain = extractField('authDomain');
  const storageBucket = extractField('storageBucket');
  const messagingSenderId = extractField('messagingSenderId');
  const appId = extractField('appId');

  if (apiKey && projectId) {
    return {
      apiKey,
      projectId,
      authDomain,
      storageBucket,
      messagingSenderId,
      appId: appId || '',
    };
  }

  return null;
}

export function getFirebaseDb(): Firestore | null {
  const config = getStoredFirebaseConfig();
  if (!config) return null;

  try {
    const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(config);
    return getFirestore(app);
  } catch (err) {
    console.error('Firebase Firestore 초기화 실패:', err);
    return null;
  }
}


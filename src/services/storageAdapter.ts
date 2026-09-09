import { doc, getDoc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { Scenario } from '../types/scenario';
import { DEFAULT_SCENARIOS } from '../constants/defaultData';
import { getFirebaseDb, getStoredSyncRoomId } from './firebaseClient';

const LOCAL_STORAGE_KEY = 'postech_graduation_scenarios_v4';
const LAST_SAVED_TIME_KEY = 'postech_sim_last_saved_time';

export const storageAdapter = {
  // 1. 시나리오 데이터 로드
  async loadScenarios(): Promise<Scenario[]> {
    const db = getFirebaseDb();
    const roomId = getStoredSyncRoomId();

    // Firebase Firestore 연동 시도
    if (db) {
      try {
        const docRef = doc(db, 'simulation_plans', roomId);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && Array.isArray(data.scenarios) && data.scenarios.length > 0) {
            console.log('🔥 Firebase Firestore에서 데이터를 성공적으로 불러왔습니다.');
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.scenarios));
            if (data.updatedAt) {
              localStorage.setItem(LAST_SAVED_TIME_KEY, String(data.updatedAt));
            }
            return data.scenarios as Scenario[];
          }
        } else {
          // Firestore 문서가 아직 비어있는 경우: 기존 기본 시나리오(분배, 기본, 빠른 졸업, 드랍)를 자동 최초 주입
          console.log('🌱 Firestore에 문서가 없어 초기 시나리오 데이터를 자동 주입(Seed)합니다.');
          const rawLocal = localStorage.getItem(LOCAL_STORAGE_KEY);
          let initialData = DEFAULT_SCENARIOS;
          if (rawLocal) {
            try {
              const parsed = JSON.parse(rawLocal);
              if (Array.isArray(parsed) && parsed.length > 0) initialData = parsed;
            } catch {
              // fallback
            }
          }
          const now = Date.now();
          await setDoc(docRef, {
            scenarios: initialData,
            updatedAt: now,
            clientInfo: 'initial_seed',
          });
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialData));
          localStorage.setItem(LAST_SAVED_TIME_KEY, String(now));
          return initialData;
        }
      } catch (e) {
        console.warn('Firebase 로드 실패, 로컬 데이터를 사용합니다:', e);
      }
    }

    // 로컬 스토리지 확인
    const rawLocal = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (rawLocal) {
      try {
        const parsed = JSON.parse(rawLocal);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as Scenario[];
        }
      } catch (e) {
        console.error('로컬스토리지 파싱 실패:', e);
      }
    }

    // 초기 기본값
    return DEFAULT_SCENARIOS;
  },

  // 2. 시나리오 데이터 저장
  async saveScenarios(scenarios: Scenario[]): Promise<void> {
    const now = Date.now();
    // 1단계: 로컬스토리지에 즉시 동기 저장 (0ms 지연)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(scenarios));
    localStorage.setItem(LAST_SAVED_TIME_KEY, String(now));

    // 2단계: Firebase Firestore 클라우드에 비동기 업서트
    const db = getFirebaseDb();
    const roomId = getStoredSyncRoomId();
    if (db) {
      try {
        const docRef = doc(db, 'simulation_plans', roomId);
        await setDoc(
          docRef,
          {
            scenarios,
            updatedAt: now,
            clientInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
          },
          { merge: true }
        );
        console.log('🔥 Firebase Firestore에 변경사항이 동기화되었습니다.');
      } catch (err) {
        console.error('Firebase 동기화 에러:', err);
      }
    }
  },

  // 3. 실시간 변경 감지 구독 (아이패드 ↔ PC 양방향 실시간 동기화)
  subscribeToRemote(onUpdate: (scenarios: Scenario[]) => void): Unsubscribe | null {
    const db = getFirebaseDb();
    const roomId = getStoredSyncRoomId();
    if (!db) return null;

    try {
      const docRef = doc(db, 'simulation_plans', roomId);
      const unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          if (!snapshot.exists()) return;
          const data = snapshot.data();
          if (!data || !Array.isArray(data.scenarios)) return;

          const remoteUpdated = Number(data.updatedAt) || 0;
          const localUpdated = Number(localStorage.getItem(LAST_SAVED_TIME_KEY)) || 0;

          // 원격 업데이트가 로컬 저장 시점보다 새로운 경우에만 업데이트 적용 (에코 방지)
          if (remoteUpdated > localUpdated) {
            console.log('🔥 다른 기기(원격)에서 새로운 변경사항이 수신되었습니다.');
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.scenarios));
            localStorage.setItem(LAST_SAVED_TIME_KEY, String(remoteUpdated));
            onUpdate(data.scenarios as Scenario[]);
          }
        },
        (error) => {
          console.warn('Firestore 실시간 리스너 오류:', error);
        }
      );
      return unsubscribe;
    } catch (e) {
      console.error('Firestore 리스너 등록 실패:', e);
      return null;
    }
  },

  // 4. 단일 시나리오 JSON 파일로 내보내기 (백업)
  exportToJson(scenario: Scenario) {
    const dataStr = JSON.stringify(scenario, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `POSTECH_이수계획_${(scenario.scenarioName || 'scenario').replace(/[^a-zA-Z0-9가-힣]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // 5. 전체 데이터 JSON 백업
  exportAllToJson(scenarios: Scenario[]) {
    const dataStr = JSON.stringify(scenarios, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `POSTECH_전체시나리오_백업_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // 6. JSON 파일에서 가져오기
  parseImportJson(jsonString: string): Scenario[] | Scenario | null {
    try {
      const parsed = JSON.parse(jsonString);
      return parsed;
    } catch (e) {
      console.error('JSON 파싱 오류:', e);
      return null;
    }
  },
};

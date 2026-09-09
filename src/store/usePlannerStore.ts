import { create } from 'zustand';
import { Scenario } from '../types/scenario';
import { Course } from '../types/course';
import { Activity } from '../types/activity';
import { storageAdapter } from '../services/storageAdapter';
import { DEFAULT_SCENARIOS } from '../constants/defaultData';

interface PlannerState {
  scenarios: Scenario[];
  currentScenarioId: string;
  showVacations: boolean;
  showPreviousSemesters: boolean;
  currentView: 'planner' | 'activities';
  isLoading: boolean;
  isSyncing: boolean;

  // Actions
  init: () => Promise<void>;
  setCurrentScenarioId: (id: string) => void;
  toggleVacations: () => void;
  togglePreviousSemesters: () => void;
  setCurrentView: (view: 'planner' | 'activities') => void;

  // Course Actions
  moveCourse: (sourceSemId: string | number, targetSemId: string | number, courseId: string, targetIndex?: number) => void;
  reorderCoursesInSemester: (semId: string | number, activeId: string, overId: string) => void;
  addCourse: (semId: string | number, course: Omit<Course, 'id'>) => void;
  updateCourse: (courseId: string, updated: Partial<Course>) => void;
  deleteCourse: (courseId: string) => void;

  // Activity Actions
  addActivity: (activity: Omit<Activity, 'id'>) => void;
  updateActivity: (activityId: string, updated: Partial<Activity>) => void;
  deleteActivity: (activityId: string) => void;

  // Scenario Actions
  addScenario: (name: string) => void;
  importScenarios: (imported: Scenario[]) => void;
  resetToDefault: () => void;
  reconnectSync: () => Promise<void>;
}

let activeUnsubscribe: (() => void) | null = null;

const setupRealtimeSubscription = (set: any, get: any) => {
  if (activeUnsubscribe) {
    activeUnsubscribe();
    activeUnsubscribe = null;
  }

  activeUnsubscribe = storageAdapter.subscribeToRemote((remoteScenarios) => {
    const currentId = get().currentScenarioId;
    const exists = remoteScenarios.some((s) => s.id === currentId);
    set({
      scenarios: remoteScenarios,
      currentScenarioId: exists ? currentId : remoteScenarios[0]?.id || '',
    });
  });
};

export const usePlannerStore = create<PlannerState>((set, get) => ({
  scenarios: [],
  currentScenarioId: '',
  showVacations: true,
  showPreviousSemesters: false,
  currentView: 'planner',
  isLoading: true,
  isSyncing: false,

  init: async () => {
    set({ isLoading: true });
    try {
      const loaded = await storageAdapter.loadScenarios();
      const initialScenarios = loaded.length > 0 ? loaded : DEFAULT_SCENARIOS;
      set({
        scenarios: initialScenarios,
        currentScenarioId: initialScenarios[0]?.id || '',
        isLoading: false,
      });

      // Firebase 실시간 리스너 구독 연결
      setupRealtimeSubscription(set, get);
    } catch (err) {
      console.error('초기화 에러:', err);
      set({
        scenarios: DEFAULT_SCENARIOS,
        currentScenarioId: DEFAULT_SCENARIOS[0].id,
        isLoading: false,
      });
    }
  },

  reconnectSync: async () => {
    try {
      const loaded = await storageAdapter.loadScenarios();
      if (loaded.length > 0) {
        set({ scenarios: loaded });
      }
      setupRealtimeSubscription(set, get);
    } catch (err) {
      console.error('동기화 재연결 에러:', err);
    }
  },

  setCurrentScenarioId: (id) => set({ currentScenarioId: id }),
  toggleVacations: () => set((state) => ({ showVacations: !state.showVacations })),
  togglePreviousSemesters: () => set((state) => ({ showPreviousSemesters: !state.showPreviousSemesters })),
  setCurrentView: (view) => set({ currentView: view }),

  // 1. 과목 이동 (학기간 또는 동일 학기 내)
  moveCourse: (sourceSemId, targetSemId, courseId, targetIndex) => {
    const { scenarios, currentScenarioId } = get();
    const scenario = scenarios.find((s) => s.id === currentScenarioId);
    if (!scenario) return;

    const newSemesters = scenario.semesters.map((sem) => ({
      ...sem,
      courses: [...sem.courses],
    }));

    const sourceSem = newSemesters.find((s) => String(s.id) === String(sourceSemId));
    const targetSem = newSemesters.find((s) => String(s.id) === String(targetSemId));
    if (!sourceSem || !targetSem) return;

    const courseIndex = sourceSem.courses.findIndex((c) => c.id === courseId);
    if (courseIndex === -1) return;

    const [movedCourse] = sourceSem.courses.splice(courseIndex, 1);

    if (targetIndex !== undefined && targetIndex >= 0) {
      targetSem.courses.splice(targetIndex, 0, movedCourse);
    } else {
      targetSem.courses.push(movedCourse);
    }

    const updatedScenarios = scenarios.map((s) =>
      s.id === currentScenarioId ? { ...s, semesters: newSemesters } : s
    );

    set({ scenarios: updatedScenarios });
    storageAdapter.saveScenarios(updatedScenarios);
  },

  // 동일 학기 내 순서 정렬
  reorderCoursesInSemester: (semId, activeId, overId) => {
    if (activeId === overId) return;
    const { scenarios, currentScenarioId } = get();
    const scenario = scenarios.find((s) => s.id === currentScenarioId);
    if (!scenario) return;

    const newSemesters = scenario.semesters.map((sem) => {
      if (String(sem.id) !== String(semId)) return sem;

      const courses = [...sem.courses];
      const oldIndex = courses.findIndex((c) => c.id === activeId);
      const newIndex = courses.findIndex((c) => c.id === overId);
      if (oldIndex === -1 || newIndex === -1) return sem;

      const [moved] = courses.splice(oldIndex, 1);
      courses.splice(newIndex, 0, moved);
      return { ...sem, courses };
    });

    const updatedScenarios = scenarios.map((s) =>
      s.id === currentScenarioId ? { ...s, semesters: newSemesters } : s
    );

    set({ scenarios: updatedScenarios });
    storageAdapter.saveScenarios(updatedScenarios);
  },

  // 2. 과목 추가
  addCourse: (semId, courseData) => {
    const { scenarios, currentScenarioId } = get();
    const newCourse: Course = {
      ...courseData,
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };

    const updatedScenarios = scenarios.map((s) => {
      if (s.id !== currentScenarioId) return s;
      return {
        ...s,
        semesters: s.semesters.map((sem) =>
          String(sem.id) === String(semId)
            ? { ...sem, courses: [...sem.courses, newCourse] }
            : sem
        ),
      };
    });

    set({ scenarios: updatedScenarios });
    storageAdapter.saveScenarios(updatedScenarios);
  },

  // 3. 과목 수정
  updateCourse: (courseId, updated) => {
    const { scenarios, currentScenarioId } = get();
    const updatedScenarios = scenarios.map((s) => {
      if (s.id !== currentScenarioId) return s;
      return {
        ...s,
        semesters: s.semesters.map((sem) => ({
          ...sem,
          courses: sem.courses.map((c) => (c.id === courseId ? { ...c, ...updated } : c)),
        })),
      };
    });

    set({ scenarios: updatedScenarios });
    storageAdapter.saveScenarios(updatedScenarios);
  },

  // 4. 과목 삭제
  deleteCourse: (courseId) => {
    const { scenarios, currentScenarioId } = get();
    const updatedScenarios = scenarios.map((s) => {
      if (s.id !== currentScenarioId) return s;
      return {
        ...s,
        semesters: s.semesters.map((sem) => ({
          ...sem,
          courses: sem.courses.filter((c) => c.id !== courseId),
        })),
      };
    });

    set({ scenarios: updatedScenarios });
    storageAdapter.saveScenarios(updatedScenarios);
  },

  // 5. 활동 추가
  addActivity: (activityData) => {
    const { scenarios, currentScenarioId } = get();
    const newActivity: Activity = {
      ...activityData,
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };

    const updatedScenarios = scenarios.map((s) => {
      if (s.id !== currentScenarioId) return s;
      return {
        ...s,
        activities: [...s.activities, newActivity],
      };
    });

    set({ scenarios: updatedScenarios });
    storageAdapter.saveScenarios(updatedScenarios);
  },

  // 6. 활동 수정
  updateActivity: (activityId, updated) => {
    const { scenarios, currentScenarioId } = get();
    const updatedScenarios = scenarios.map((s) => {
      if (s.id !== currentScenarioId) return s;
      return {
        ...s,
        activities: s.activities.map((a) => (a.id === activityId ? { ...a, ...updated } : a)),
      };
    });

    set({ scenarios: updatedScenarios });
    storageAdapter.saveScenarios(updatedScenarios);
  },

  // 7. 활동 삭제
  deleteActivity: (activityId) => {
    const { scenarios, currentScenarioId } = get();
    const updatedScenarios = scenarios.map((s) => {
      if (s.id !== currentScenarioId) return s;
      return {
        ...s,
        activities: s.activities.filter((a) => a.id !== activityId),
      };
    });

    set({ scenarios: updatedScenarios });
    storageAdapter.saveScenarios(updatedScenarios);
  },

  // 8. 새 시나리오 생성
  addScenario: (name) => {
    const { scenarios } = get();
    const baseScenario = scenarios[0] || DEFAULT_SCENARIOS[0];
    const newId = `scenario-${Date.now()}`;
    const newScenario: Scenario = {
      id: newId,
      scenarioName: name,
      semesters: baseScenario.semesters.map((sem, sIdx) => ({
        id: `sem-${newId}-${sIdx}`,
        originalIndex: sem.originalIndex,
        name: sem.name,
        courses: [],
      })),
      activities: [],
    };

    const updatedScenarios = [...scenarios, newScenario];
    set({ scenarios: updatedScenarios, currentScenarioId: newId });
    storageAdapter.saveScenarios(updatedScenarios);
  },

  // 9. 시나리오 데이터 가져오기
  importScenarios: (imported) => {
    if (!Array.isArray(imported) || imported.length === 0) return;
    set({ scenarios: imported, currentScenarioId: imported[0].id });
    storageAdapter.saveScenarios(imported);
  },

  // 10. 초기화
  resetToDefault: () => {
    set({ scenarios: DEFAULT_SCENARIOS, currentScenarioId: DEFAULT_SCENARIOS[0].id });
    storageAdapter.saveScenarios(DEFAULT_SCENARIOS);
  },
}));


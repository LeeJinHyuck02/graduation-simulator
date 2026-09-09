import { useEffect, useState } from 'react';
import { usePlannerStore } from './store/usePlannerStore';
import { ScenarioTabs } from './components/header/ScenarioTabs';
import { ViewControls } from './components/header/ViewControls';
import { SemesterGrid } from './components/planner/SemesterGrid';
import { ActivityTimeline } from './components/activities/ActivityTimeline';
import { CourseModal } from './components/planner/CourseModal';
import { ActivityModal } from './components/activities/ActivityModal';
import { SyncModal } from './components/common/SyncModal';
import { StatsPanel } from './components/footer/StatsPanel';
import { Course } from './types/course';
import { Activity } from './types/activity';
import { GraduationCap } from 'lucide-react';

export function App() {
  const { init, isLoading, currentView } = usePlannerStore();

  // 모달 상태
  const [isSyncOpen, setIsSyncOpen] = useState(false);

  // 과목 모달 상태
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [selectedSemId, setSelectedSemId] = useState<string | number | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // 활동 모달 상태
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  useEffect(() => {
    init();
  }, [init]);

  const handleAddCourse = (semId: string | number) => {
    setSelectedSemId(semId);
    setSelectedCourse(null);
    setIsCourseModalOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setSelectedSemId(null);
    setSelectedCourse(course);
    setIsCourseModalOpen(true);
  };

  const handleAddActivity = () => {
    setSelectedActivity(null);
    setIsActivityModalOpen(true);
  };

  const handleEditActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsActivityModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-dark-bg text-zinc-300">
        <div className="w-10 h-10 border-4 border-postech border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">이수 계획 시뮬레이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col pb-44">
      {/* 상단 앱 헤더 */}
      <header className="sticky top-0 z-30 bg-dark-bg/95 backdrop-blur-md border-b border-dark-border px-4 py-2.5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* 타이틀 및 엠블럼 */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-postech/20 border border-postech/40 flex items-center justify-center text-postech">
              <GraduationCap size={18} />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-bold tracking-tight text-zinc-100 flex items-center gap-1.5">
                <span>POSTECH 수학과 이수 계획 시뮬레이터</span>
                <span className="px-1 py-0.2 text-[9px] font-mono font-semibold bg-postech text-white rounded">
                  v4.0
                </span>
              </h1>
            </div>
          </div>

          {/* 뷰 및 필터 컨트롤 */}
          <ViewControls
            onOpenSync={() => setIsSyncOpen(true)}
            onOpenAddActivity={handleAddActivity}
          />
        </div>

        {/* 시나리오 탭 목록 */}
        <div className="max-w-5xl mx-auto mt-2 pt-1.5 border-t border-dark-border/50">
          <ScenarioTabs />
        </div>
      </header>

      {/* 메인 캔버스 뷰 */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3">
        {currentView === 'planner' ? (
          <SemesterGrid
            onAddCourse={handleAddCourse}
            onEditCourse={handleEditCourse}
          />
        ) : (
          <ActivityTimeline
            onAddActivity={handleAddActivity}
            onEditActivity={handleEditActivity}
          />
        )}
      </main>

      {/* 하단 졸업요건 통계 배너 */}
      <StatsPanel />

      {/* 모달 팝업들 */}
      <CourseModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        semId={selectedSemId}
        initialCourse={selectedCourse}
      />

      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        initialActivity={selectedActivity}
      />

      <SyncModal
        isOpen={isSyncOpen}
        onClose={() => setIsSyncOpen(false)}
      />
    </div>
  );
}

export default App;


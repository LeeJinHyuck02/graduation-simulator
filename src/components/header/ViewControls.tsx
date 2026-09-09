import React from 'react';
import { usePlannerStore } from '../../store/usePlannerStore';
import { Eye, EyeOff, LayoutGrid, CalendarRange } from 'lucide-react';

export const ViewControls: React.FC = () => {
  const {
    showVacations,
    toggleVacations,
    showPreviousSemesters,
    togglePreviousSemesters,
    currentView,
    setCurrentView,
  } = usePlannerStore();

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* 뷰 전환 토글 (수강 플래너 <-> 비교과 활동 아이콘) */}
      <div className="flex items-center p-0.5 bg-dark-card border border-dark-border rounded-lg">
        <button
          onClick={() => setCurrentView('planner')}
          className={`p-1.5 rounded-md transition-colors ${
            currentView === 'planner'
              ? 'bg-postech text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="수강 플래너"
          aria-label="수강 플래너"
        >
          <LayoutGrid size={16} />
        </button>
        <button
          onClick={() => setCurrentView('activities')}
          className={`p-1.5 rounded-md transition-colors ${
            currentView === 'activities'
              ? 'bg-postech text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="비교과 활동"
          aria-label="비교과 활동"
        >
          <CalendarRange size={16} />
        </button>
      </div>

      {/* 방학 토글 버튼 */}
      <button
        onClick={toggleVacations}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors shrink-0 ${
          showVacations
            ? 'bg-dark-card hover:bg-dark-hover text-zinc-200 border-dark-border'
            : 'bg-dark-card/60 hover:bg-dark-card text-zinc-500 border-dark-border/60'
        }`}
        title={showVacations ? '방학 숨기기' : '방학 보이기'}
      >
        {showVacations ? <Eye size={14} className="text-zinc-300" /> : <EyeOff size={14} className="text-zinc-500" />}
        <span>방학</span>
      </button>

      {/* 이전 학기 토글 버튼 */}
      <button
        onClick={togglePreviousSemesters}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors shrink-0 ${
          showPreviousSemesters
            ? 'bg-dark-card hover:bg-dark-hover text-zinc-200 border-dark-border'
            : 'bg-dark-card/60 hover:bg-dark-card text-zinc-500 border-dark-border/60'
        }`}
        title={showPreviousSemesters ? '이전 학기 숨기기' : '이전 학기 보이기'}
      >
        {showPreviousSemesters ? <Eye size={14} className="text-zinc-300" /> : <EyeOff size={14} className="text-zinc-500" />}
        <span>이전 학기</span>
      </button>
    </div>
  );
};


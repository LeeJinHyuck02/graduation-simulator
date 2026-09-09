import React from 'react';
import { usePlannerStore } from '../../store/usePlannerStore';
import { Cloud, Eye, EyeOff, Plus, LayoutGrid, CalendarRange } from 'lucide-react';

interface ViewControlsProps {
  onOpenSync: () => void;
  onOpenAddActivity: () => void;
}

export const ViewControls: React.FC<ViewControlsProps> = ({ onOpenSync, onOpenAddActivity }) => {
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
      {/* 뷰 전환 토글 (과목 플래너 <-> 활동 관리) */}
      <div className="flex items-center p-0.5 bg-dark-card border border-dark-border rounded-lg">
        <button
          onClick={() => setCurrentView('planner')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            currentView === 'planner'
              ? 'bg-postech text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <LayoutGrid size={14} />
          <span>수강 플래너</span>
        </button>
        <button
          onClick={() => setCurrentView('activities')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            currentView === 'activities'
              ? 'bg-postech text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <CalendarRange size={14} />
          <span>비교과 활동</span>
        </button>
      </div>

      {/* 방학 토글 버튼 */}
      <button
        onClick={toggleVacations}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-dark-card hover:bg-dark-hover text-zinc-300 border border-dark-border rounded-lg transition-colors"
        title="방학 학기 표시 여부"
      >
        {showVacations ? <EyeOff size={14} /> : <Eye size={14} />}
        <span>{showVacations ? '방학 숨기기' : '방학 보이기'}</span>
      </button>

      {/* 이전 학기 토글 버튼 */}
      <button
        onClick={togglePreviousSemesters}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-dark-card hover:bg-dark-hover text-zinc-300 border border-dark-border rounded-lg transition-colors"
        title="이전 학기(3-1 이전) 표시 여부"
      >
        {showPreviousSemesters ? <EyeOff size={14} /> : <Eye size={14} />}
        <span>{showPreviousSemesters ? '이전 학기 숨기기' : '이전 학기 보기'}</span>
      </button>

      {/* 활동 추가 버튼 */}
      <button
        onClick={onOpenAddActivity}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
      >
        <Plus size={14} />
        <span>새 활동</span>
      </button>

      {/* 기기 간 동기화 모달 열기 버튼 */}
      <button
        onClick={onOpenSync}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-dark-card hover:bg-dark-hover text-zinc-300 border border-dark-border rounded-lg transition-colors"
        title="기기 간 실시간 동기화 및 백업"
      >
        <Cloud size={14} className="text-postech" />
        <span className="hidden sm:inline">기기 동기화</span>
      </button>
    </div>
  );
};


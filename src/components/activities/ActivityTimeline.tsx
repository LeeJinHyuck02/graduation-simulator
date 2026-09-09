import React, { useMemo } from 'react';
import { usePlannerStore } from '../../store/usePlannerStore';
import { Activity, ACTIVITY_TYPE_OPTIONS } from '../../types/activity';
import { getShortSemesterName } from '../../types/semester';
import { ActivityBadge } from '../common/Badge';
import { Plus } from 'lucide-react';

interface ActivityTimelineProps {
  onEditActivity: (activity: Activity) => void;
  onAddActivity: () => void;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  onEditActivity,
  onAddActivity,
}) => {
  const { scenarios, currentScenarioId, showVacations, showPreviousSemesters } = usePlannerStore();
  const currentScenario = scenarios.find((s) => s.id === currentScenarioId);

  if (!currentScenario) return null;

  // 표시할 학기 필터링
  const lastAllowedIndex = currentScenario.semesters.findIndex((s) => s.name === '5학년 여름방학');

  const visibleSemesters = currentScenario.semesters
    .filter((sem) => {
      if (!showVacations && sem.name.includes('방학')) return false;
      if (!showPreviousSemesters && (sem.name === '3학년 1학기' || sem.name === '3학년 여름방학')) {
        return false;
      }
      if (lastAllowedIndex !== -1 && sem.originalIndex >= lastAllowedIndex) return false;
      return true;
    })
    .sort((a, b) => a.originalIndex - b.originalIndex);

  // visibleSemesters의 originalIndex 목록과 매핑
  const originalIndexMap = new Map<number, number>();
  visibleSemesters.forEach((sem, colIdx) => {
    originalIndexMap.set(sem.originalIndex, colIdx);
  });

  // 비교과 활동 정렬: 1순위 인턴 -> 연구 -> 자격증, 2순위 시작 학기(빠른 순), 3순위 종료 학기, 4순위 이름
  const TYPE_PRIORITY: Record<string, number> = {
    Intern: 1,
    Research: 2,
    Cert: 3,
  };

  const sortedActivities = useMemo(() => {
    return [...currentScenario.activities].sort((a, b) => {
      const pA = TYPE_PRIORITY[a.type] ?? 99;
      const pB = TYPE_PRIORITY[b.type] ?? 99;
      if (pA !== pB) return pA - pB;
      if (a.startSem !== b.startSem) return a.startSem - b.startSem;
      if (a.endSem !== b.endSem) return a.endSem - b.endSem;
      return a.name.localeCompare(b.name);
    });
  }, [currentScenario.activities]);

  return (
    <div className="w-full bg-dark-card border border-dark-border rounded-xl p-4 shadow-md space-y-4 overflow-x-auto">
      <div className="flex items-center justify-between min-w-max">
        <div>
          <h3 className="text-sm font-bold text-zinc-100">비교과 활동 타임라인 (간트차트)</h3>
          <p className="text-xs text-zinc-400">
            자격증 취득, 인턴십 참여, 연구 활동(UGRP 등) 기간을 학기별로 관리합니다.
          </p>
        </div>
        <button
          onClick={onAddActivity}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-postech hover:bg-postech-hover text-white rounded-lg transition-colors shadow"
        >
          <Plus size={14} />
          <span>활동 추가</span>
        </button>
      </div>

      {/* 타임라인 그리드 테이블 */}
      <div className="min-w-[700px] border border-dark-border rounded-lg overflow-hidden bg-dark-bg/40">
        {/* 학기 헤더 행 */}
        <div
          className="grid border-b border-dark-border bg-dark-subcard/90"
          style={{ gridTemplateColumns: `140px repeat(${visibleSemesters.length}, minmax(60px, 1fr))` }}
        >
          <div className="p-2.5 text-xs font-semibold text-zinc-400 border-r border-dark-border flex items-center">
            구분 / 활동명
          </div>
          {visibleSemesters.map((sem) => (
            <div
              key={sem.id}
              className="p-2 text-center text-xs font-semibold text-zinc-200 border-r last:border-r-0 border-dark-border"
            >
              {getShortSemesterName(sem.name)}
            </div>
          ))}
        </div>

        {/* 활동 항목 목록 */}
        <div className="divide-y divide-dark-border/60">
          {sortedActivities.map((act) => {
            const startCol = originalIndexMap.get(act.startSem);
            const endCol = originalIndexMap.get(act.endSem);

            const opt = ACTIVITY_TYPE_OPTIONS.find((o) => o.value === act.type) || ACTIVITY_TYPE_OPTIONS[0];

            return (
              <div
                key={act.id}
                className="grid items-center hover:bg-dark-hover/40 transition-colors"
                style={{ gridTemplateColumns: `140px repeat(${visibleSemesters.length}, minmax(60px, 1fr))` }}
              >
                {/* 좌측 활동 라벨 */}
                <div
                  onClick={() => onEditActivity(act)}
                  className="p-2 border-r border-dark-border cursor-pointer flex items-center gap-1.5 truncate"
                >
                  <ActivityBadge type={act.type} />
                  <span className="text-xs font-medium text-zinc-200 truncate">{act.name}</span>
                </div>

                {/* 우측 타임라인 영역 */}
                <div
                  className="relative h-9 p-1 border-r last:border-r-0 border-dark-border"
                  style={{ gridColumn: `2 / span ${visibleSemesters.length}` }}
                >
                  {startCol !== undefined && endCol !== undefined && (
                    <div
                      onClick={() => onEditActivity(act)}
                      style={{
                        left: `${(startCol / visibleSemesters.length) * 100}%`,
                        width: `${((Math.max(endCol - startCol + 1, 1)) / visibleSemesters.length) * 100}%`,
                      }}
                      className={`absolute top-1.5 bottom-1.5 px-2 rounded-md flex items-center justify-center text-[11px] font-semibold text-white shadow-sm border cursor-pointer hover:opacity-90 transition-all ${opt.barBg}`}
                      title={`${act.name} (클릭하여 수정)`}
                    >
                      <span className="truncate text-center">{act.name}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {sortedActivities.length === 0 && (
            <div className="p-8 text-center text-xs text-zinc-500">
              등록된 비교과 활동이 없습니다. '+ 활동 추가' 버튼으로 자격증이나 인턴십을 등록해 보세요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


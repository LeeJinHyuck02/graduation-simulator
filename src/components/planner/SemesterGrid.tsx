import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  closestCorners,
} from '@dnd-kit/core';
import { usePlannerStore } from '../../store/usePlannerStore';
import { Semester } from '../../types/semester';
import { Course } from '../../types/course';
import { SemesterCard } from './SemesterCard';
import { CourseBadge } from '../common/Badge';

interface SemesterGridProps {
  onEditCourse: (course: Course) => void;
  onAddCourse: (semId: string | number) => void;
}

interface YearGroup {
  yearName: string;
  totalCredits: number;
  semesters: Semester[];
}

export const SemesterGrid: React.FC<SemesterGridProps> = ({ onEditCourse, onAddCourse }) => {
  const {
    scenarios,
    currentScenarioId,
    showVacations,
    showPreviousSemesters,
    moveCourse,
    reorderCoursesInSemester,
  } = usePlannerStore();

  const currentScenario = scenarios.find((s) => s.id === currentScenarioId);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);

  // 컴퓨터 마우스 및 아이패드 터치 제스처 최적화 센서
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  if (!currentScenario) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-400 text-sm">
        시나리오를 선택하거나 추가하세요.
      </div>
    );
  }

  // 필터링: 방학 표시 여부 및 이전 학기(3-1, 3-여름) 표시 여부
  const lastAllowedSemesterIndex = currentScenario.semesters.findIndex(
    (s) => s.name === '5학년 여름방학'
  );

  const visibleSemesters = currentScenario.semesters
    .filter((sem) => {
      if (!showVacations && sem.name.includes('방학')) return false;
      if (
        !showPreviousSemesters &&
        (sem.name === '3학년 1학기' || sem.name === '3학년 여름방학')
      ) {
        return false;
      }
      if (lastAllowedSemesterIndex !== -1 && sem.originalIndex >= lastAllowedSemesterIndex) {
        return false;
      }
      return true;
    })
    .sort((a, b) => a.originalIndex - b.originalIndex);

  // 3, 4, 5학년별로 줄바꿈을 위한 그룹핑
  const yearGroupMap = new Map<string, Semester[]>();
  visibleSemesters.forEach((sem) => {
    const match = sem.name.match(/(\d+)학년/);
    const yearKey = match ? `${match[1]}학년` : '기타';
    if (!yearGroupMap.has(yearKey)) {
      yearGroupMap.set(yearKey, []);
    }
    yearGroupMap.get(yearKey)!.push(sem);
  });

  const yearGroups: YearGroup[] = Array.from(yearGroupMap.entries()).map(([yearName, sems]) => {
    const totalCredits = sems.reduce(
      (sum, sem) => sum + sem.courses.reduce((cSum, c) => cSum + (c.credit || 0), 0),
      0
    );
    return { yearName, totalCredits, semesters: sems };
  });

  const findSemesterByCourseId = (courseId: string): Semester | undefined => {
    return currentScenario.semesters.find((sem) =>
      sem.courses.some((c) => c.id === courseId)
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const course = active.data.current?.course as Course;
    if (course) {
      setActiveCourse(course);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const sourceSem = findSemesterByCourseId(activeId);
    let targetSem: Semester | undefined;

    if (overId.startsWith('droppable-sem-')) {
      const targetSemId = overId.replace('droppable-sem-', '');
      targetSem = currentScenario.semesters.find((s) => String(s.id) === targetSemId);
    } else {
      targetSem = findSemesterByCourseId(overId);
    }

    if (!sourceSem || !targetSem || sourceSem.id === targetSem.id) {
      return;
    }

    const overIndex = targetSem.courses.findIndex((c) => c.id === overId);
    moveCourse(sourceSem.id, targetSem.id, activeId, overIndex >= 0 ? overIndex : undefined);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCourse(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const sourceSem = findSemesterByCourseId(activeId);
    if (!sourceSem) return;

    if (overId.startsWith('droppable-sem-')) {
      const targetSemId = overId.replace('droppable-sem-', '');
      if (String(sourceSem.id) !== targetSemId) {
        moveCourse(sourceSem.id, targetSemId, activeId);
      }
    } else {
      const targetSem = findSemesterByCourseId(overId);
      if (targetSem && sourceSem.id === targetSem.id && activeId !== overId) {
        reorderCoursesInSemester(sourceSem.id, activeId, overId);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full space-y-4 pb-2">
        {yearGroups.map((yg) => (
          <div
            key={yg.yearName}
            className="p-3 bg-dark-card/40 border border-dark-border/60 rounded-xl"
          >
            {/* 학년 라벨 및 연간 총 학점 헤더 */}
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-dark-border/40">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-200 px-2 py-0.5 rounded bg-dark-subcard border border-dark-border">
                  {yg.yearName}
                </span>
                <span className="text-[11px] text-zinc-400 font-medium">
                  연간 이수: <strong className="text-zinc-200">{yg.totalCredits}</strong>학점
                </span>
              </div>
            </div>

            {/* 학년별 학기 카드 배치 (방학 여부에 따라 2열 또는 4열 그리드) */}
            <div
              className={`grid gap-2.5 ${
                showVacations
                  ? 'grid-cols-2 md:grid-cols-4'
                  : 'grid-cols-2'
              }`}
            >
              {yg.semesters.map((sem) => (
                <SemesterCard
                  key={sem.id}
                  semester={sem}
                  onEditCourse={onEditCourse}
                  onAddCourse={onAddCourse}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 드래그 중인 과목 플로팅 오버레이 */}
      <DragOverlay>
        {activeCourse ? (
          <div className="flex items-center justify-between p-2 rounded-md bg-dark-subcard border-2 border-postech shadow-2xl scale-105 opacity-95 min-w-[180px]">
            <div className="flex items-center gap-1.5">
              <CourseBadge type={activeCourse.type} />
              <span className="text-xs font-semibold text-zinc-100">{activeCourse.name || '(미정)'}</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 bg-dark-bg/70 px-1 py-0.5 rounded ml-2">
              {activeCourse.credit}학점
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

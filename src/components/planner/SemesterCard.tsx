import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Semester, getShortSemesterName } from '../../types/semester';
import { Course } from '../../types/course';
import { CourseCard } from './CourseCard';
import { Plus } from 'lucide-react';

interface SemesterCardProps {
  semester: Semester;
  onEditCourse: (course: Course) => void;
  onAddCourse: (semId: string | number) => void;
}

export const SemesterCard: React.FC<SemesterCardProps> = ({
  semester,
  onEditCourse,
  onAddCourse,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `droppable-sem-${semester.id}`,
    data: {
      type: 'Semester',
      semester,
    },
  });

  const semesterCredits = semester.courses.reduce((sum, c) => sum + (c.credit || 0), 0);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-full min-w-0 bg-dark-card border rounded-lg overflow-hidden transition-all shadow-sm ${
        isOver ? 'border-postech ring-1 ring-postech/50' : 'border-dark-border/80'
      }`}
    >
      {/* 학기 헤더 */}
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-dark-subcard/80 border-b border-dark-border/80">
        <div className="flex items-center gap-1 min-w-0">
          <span className="font-bold text-xs text-zinc-100 whitespace-nowrap">
            {getShortSemesterName(semester.name)}
          </span>
          <span className="text-[10px] text-zinc-400 font-normal truncate hidden sm:inline">
            ({semester.name.replace('학년 ', '').replace('학기', '')})
          </span>
        </div>
        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-dark-bg text-postech border border-postech/20 flex-shrink-0 font-mono">
          {semesterCredits}학점
        </span>
      </div>

      {/* 과목 리스트 (Sortable) */}
      <div className="flex-1 p-1.5 space-y-1 min-h-[110px] max-h-[280px] overflow-y-auto scrollbar-thin">
        <SortableContext
          items={semester.courses.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {semester.courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              semId={semester.id}
              onEdit={onEditCourse}
            />
          ))}
        </SortableContext>

        {semester.courses.length === 0 && (
          <div className="flex items-center justify-center h-20 border border-dashed border-dark-border/50 rounded text-zinc-500 text-[11px]">
            과목 드롭
          </div>
        )}
      </div>

      {/* 과목 추가 버튼 */}
      <div className="p-1 border-t border-dark-border/50 bg-dark-card/90">
        <button
          onClick={() => onAddCourse(semester.id)}
          className="w-full flex items-center justify-center gap-1 py-1 px-2 rounded text-[11px] font-medium text-zinc-400 hover:text-zinc-100 hover:bg-dark-hover border border-dashed border-dark-border/60 transition-colors"
        >
          <Plus size={11} />
          <span>과목 추가</span>
        </button>
      </div>
    </div>
  );
};

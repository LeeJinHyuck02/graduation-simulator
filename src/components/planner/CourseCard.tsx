import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Course } from '../../types/course';
import { CourseBadge } from '../common/Badge';
import { GripVertical } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  semId: string | number;
  onEdit: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, semId, onEdit }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: course.id,
    data: {
      type: 'Course',
      course,
      semId,
    },
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  const hasName = Boolean(course.name && course.name.trim().length > 0);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-dark-subcard hover:bg-dark-hover border border-dark-border/70 hover:border-zinc-500 transition-all shadow-sm ${
        isDragging ? 'ring-2 ring-postech ring-offset-1 ring-offset-dark-bg z-30' : ''
      }`}
    >
      {/* 드래그 핸들 */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-0.5 -ml-0.5 text-zinc-500 hover:text-zinc-300 touch-none flex-shrink-0"
        title="드래그하여 이동"
      >
        <GripVertical size={12} />
      </div>

      {/* 이수 구분 뱃지 */}
      <CourseBadge type={course.type} />

      {/* 과목명 (클릭 시 수정) */}
      <div
        onClick={() => onEdit(course)}
        className="flex-1 min-w-0 cursor-pointer"
        title={hasName ? course.name : '과목명 미정 (클릭하여 수정)'}
      >
        <span
          className={`text-[11px] font-medium truncate block leading-tight ${
            hasName ? 'text-zinc-100' : 'text-zinc-500 italic'
          }`}
        >
          {hasName ? course.name : '(미정)'}
        </span>
      </div>

      {/* 학점 */}
      <span
        onClick={() => onEdit(course)}
        className="text-[10px] font-mono font-medium text-zinc-400 bg-dark-bg/70 px-1 py-0.5 rounded cursor-pointer flex-shrink-0"
      >
        {course.credit}학점
      </span>
    </div>
  );
};

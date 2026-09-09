import React from 'react';
import { CourseType, COURSE_TYPE_OPTIONS } from '../../types/course';
import { ActivityType, ACTIVITY_TYPE_OPTIONS } from '../../types/activity';

interface CourseBadgeProps {
  type: CourseType;
  className?: string;
}

export const CourseBadge: React.FC<CourseBadgeProps> = ({ type, className = '' }) => {
  const opt = COURSE_TYPE_OPTIONS.find((o) => o.value === type) || COURSE_TYPE_OPTIONS[0];
  return (
    <span
      className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[11px] font-semibold border whitespace-nowrap flex-shrink-0 leading-tight ${opt.badgeBg} ${className}`}
    >
      {opt.label}
    </span>
  );
};

interface ActivityBadgeProps {
  type: ActivityType;
  className?: string;
}

export const ActivityBadge: React.FC<ActivityBadgeProps> = ({ type, className = '' }) => {
  const opt = ACTIVITY_TYPE_OPTIONS.find((o) => o.value === type) || ACTIVITY_TYPE_OPTIONS[0];
  return (
    <span
      className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[11px] font-semibold border whitespace-nowrap flex-shrink-0 leading-tight ${opt.badgeBg} ${className}`}
    >
      {opt.label}
    </span>
  );
};

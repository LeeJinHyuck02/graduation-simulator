export type CourseType = 'JP' | 'JS' | 'Jas' | 'GS' | 'Eng' | 'PE';

export interface Course {
  id: string;
  type: CourseType;
  name: string;
  credit: number;
}

export interface CourseTypeOption {
  value: CourseType;
  label: string;
  badgeBg: string;
  badgeText: string;
}

export const COURSE_TYPE_OPTIONS: CourseTypeOption[] = [
  { value: 'JP', label: '전필', badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40', badgeText: '전필' },
  { value: 'JS', label: '전선', badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40', badgeText: '전선' },
  { value: 'Jas', label: '자선', badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40', badgeText: '자선' },
  { value: 'GS', label: '교선', badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', badgeText: '교선' },
  { value: 'Eng', label: '영어', badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', badgeText: '영어' },
  { value: 'PE', label: '체육', badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40', badgeText: '체육' },
];


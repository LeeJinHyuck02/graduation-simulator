import { Course } from './course';

export interface Semester {
  id: string | number;
  originalIndex: number;
  name: string;
  courses: Course[];
}

export function getShortSemesterName(name: string): string {
  if (name.includes('3학년 1학기')) return '3-1';
  if (name.includes('3학년 여름방학')) return '3-여름';
  if (name.includes('3학년 2학기')) return '3-2';
  if (name.includes('3학년 겨울방학')) return '3-겨울';
  if (name.includes('4학년 1학기')) return '4-1';
  if (name.includes('4학년 여름방학')) return '4-여름';
  if (name.includes('4학년 2학기')) return '4-2';
  if (name.includes('4학년 겨울방학')) return '4-겨울';
  if (name.includes('5학년 1학기')) return '5-1';
  if (name.includes('5학년 여름방학')) return '5-여름';
  if (name.includes('5학년 2학기')) return '5-2';
  if (name.includes('5학년 겨울방학')) return '5-겨울';
  return name.replace('학년', '').replace('학기', '').trim();
}


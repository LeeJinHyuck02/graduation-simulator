import { CourseType } from './course';

export interface GraduationRequirements {
  JP: number;  // 전필 기준 (예: 2과목)
  JS: number;  // 전선 기준 (예: 8과목)
  Jas: number; // 자선 기준 (예: 5과목)
  GS: number;  // 교선 기준 (예: 3과목)
  Eng: number; // 영어 기준 (예: 4과목)
  PE: number;  // 체육 기준 (예: 1과목)
}

export interface GraduationStats {
  counts: Record<CourseType, number>;
  credits: Record<CourseType, number>;
  totalCredits: number;
  certCount: number;
  certNames: string[];
  internCount: number;
  internNames: string[];
  researchCount: number;
  researchNames: string[];
}


import { GraduationRequirements, CreditRequirements, GraduationStats } from '../types/stats';
import { Semester } from '../types/semester';
import { Activity } from '../types/activity';
import { CourseType } from '../types/course';

export const DEFAULT_REQUIREMENTS: GraduationRequirements = {
  JP: 2,
  JS: 8,
  Jas: 5,
  GS: 3,
  Eng: 4,
  PE: 1,
};

export const DEFAULT_CREDIT_REQUIREMENTS: CreditRequirements = {
  JP: 6,
  JS: 24,
  Jas: 14,
  GS: 9,
};

export function calculateGraduationStats(semesters: Semester[], activities: Activity[]): GraduationStats {
  const counts: Record<CourseType, number> = {
    JP: 0,
    JS: 0,
    Jas: 0,
    GS: 0,
    Eng: 0,
    PE: 0,
  };

  const credits: Record<CourseType, number> = {
    JP: 0,
    JS: 0,
    Jas: 0,
    GS: 0,
    Eng: 0,
    PE: 0,
  };

  let totalCredits = 0;

  // 과목 학점 및 개수 계산
  semesters.forEach((sem) => {
    sem.courses.forEach((c) => {
      if (counts[c.type] !== undefined) {
        counts[c.type]++;
        credits[c.type] += c.credit;
      }
      // 영어는 총 학점 계산에서 제외 (기존 로직 유지)
      if (c.type !== 'Eng') {
        totalCredits += c.credit;
      }
    });
  });

  // 비교과 활동 통계 계산
  const uniqueCerts = new Set<string>();
  const uniqueResearch = new Set<string>();
  let internCount = 0;
  const internNames: string[] = [];

  activities.forEach((act) => {
    const trimmedName = act.name?.trim();
    if (!trimmedName) return;

    if (act.type === 'Cert') {
      uniqueCerts.add(trimmedName);
    } else if (act.type === 'Research') {
      uniqueResearch.add(trimmedName);
    } else if (act.type === 'Intern') {
      internCount++;
      internNames.push(trimmedName);
    }
  });

  return {
    counts,
    credits,
    totalCredits,
    certCount: uniqueCerts.size,
    certNames: Array.from(uniqueCerts),
    internCount,
    internNames,
    researchCount: uniqueResearch.size,
    researchNames: Array.from(uniqueResearch),
  };
}


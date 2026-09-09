export type ActivityType = 'Cert' | 'Intern' | 'Research';

export interface Activity {
  id: string;
  type: ActivityType;
  name: string;
  credit?: number;
  startSem: number; // 학기 originalIndex 기준
  endSem: number;   // 학기 originalIndex 기준
}

export interface ActivityTypeOption {
  value: ActivityType;
  label: string;
  badgeBg: string;
  barBg: string;
}

export const ACTIVITY_TYPE_OPTIONS: ActivityTypeOption[] = [
  { value: 'Cert', label: '자격증', badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', barBg: 'bg-emerald-600/80 border-emerald-400' },
  { value: 'Intern', label: '인턴', badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40', barBg: 'bg-blue-600/80 border-blue-400' },
  { value: 'Research', label: '연구', badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40', barBg: 'bg-purple-600/80 border-purple-400' },
];


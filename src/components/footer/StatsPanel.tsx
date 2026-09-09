import React, { useMemo } from 'react';
import { usePlannerStore } from '../../store/usePlannerStore';
import { DEFAULT_REQUIREMENTS, calculateGraduationStats } from '../../constants/requirements';
import { Award, Briefcase, Microscope } from 'lucide-react';

export const StatsPanel: React.FC = () => {
  const { scenarios, currentScenarioId } = usePlannerStore();
  const currentScenario = scenarios.find((s) => s.id === currentScenarioId);

  const stats = useMemo(() => {
    if (!currentScenario) return null;
    return calculateGraduationStats(currentScenario.semesters, currentScenario.activities);
  }, [currentScenario]);

  if (!stats) return null;

  const formatList = (names: string[]) => {
    if (names.length === 0) return '';
    if (names.length <= 2) return names.join(', ');
    return `${names[0]} 외 ${names.length - 1}건`;
  };

  return (
    <footer className="fixed bottom-3 left-0 right-0 z-40 pointer-events-none px-3 flex justify-center">
      <div className="w-full max-w-5xl pointer-events-auto">
        {/* 오리지널 대시보드 통계 패널 박스 (투명 배경 플로팅 아일랜드 스타일) */}
        <div className="rounded-xl border border-zinc-700/70 bg-gradient-to-b from-zinc-800/95 to-zinc-900/95 shadow-[0_12px_32px_rgba(0,0,0,0.7)] backdrop-blur-xl px-4 py-2 space-y-1.5">
          {/* 1단: 교과목 이수 현황 (6컬럼 균등 분할) */}
          <div className="grid grid-cols-6 w-full text-center divide-x divide-zinc-700/80 items-center">
            {/* 1. 전공필수 */}
            <div className="flex flex-col items-center justify-center px-1">
              <span className="text-xs sm:text-sm font-semibold text-zinc-300 leading-none">전공필수</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-base sm:text-lg font-black text-white font-mono leading-tight">
                  {stats.counts.JP} / {DEFAULT_REQUIREMENTS.JP}
                </span>
                <span className="text-xs text-zinc-400 font-mono">({stats.credits.JP}학점)</span>
              </div>
            </div>

            {/* 2. 전공선택 */}
            <div className="flex flex-col items-center justify-center px-1">
              <span className="text-xs sm:text-sm font-semibold text-zinc-300 leading-none">전공선택</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-base sm:text-lg font-black text-white font-mono leading-tight">
                  {stats.counts.JS} / {DEFAULT_REQUIREMENTS.JS}
                </span>
                <span className="text-xs text-zinc-400 font-mono">({stats.credits.JS}학점)</span>
              </div>
            </div>

            {/* 3. 자유선택 */}
            <div className="flex flex-col items-center justify-center px-1">
              <span className="text-xs sm:text-sm font-semibold text-zinc-300 leading-none">자유선택</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-base sm:text-lg font-black text-white font-mono leading-tight">
                  {stats.counts.Jas} / {DEFAULT_REQUIREMENTS.Jas}
                </span>
                <span className="text-xs text-zinc-400 font-mono">({stats.credits.Jas}학점)</span>
              </div>
            </div>

            {/* 4. 교양선택 */}
            <div className="flex flex-col items-center justify-center px-1">
              <span className="text-xs sm:text-sm font-semibold text-zinc-300 leading-none">교양선택</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-base sm:text-lg font-black text-white font-mono leading-tight">
                  {stats.counts.GS} / {DEFAULT_REQUIREMENTS.GS}
                </span>
                <span className="text-xs text-zinc-400 font-mono">({stats.credits.GS}학점)</span>
              </div>
            </div>

            {/* 5. 영어 / 체육 */}
            <div className="flex flex-col items-center justify-center px-1">
              <span className="text-xs sm:text-sm font-semibold text-zinc-300 leading-none">영어 / 체육</span>
              <div className="flex items-baseline gap-1 mt-0.5 font-mono text-base sm:text-lg font-black leading-tight">
                <span className="text-orange-500">
                  {stats.counts.Eng} / {DEFAULT_REQUIREMENTS.Eng}
                </span>
                <span className="text-zinc-500 font-normal">|</span>
                <span className="text-teal-400">
                  {stats.counts.PE} / {DEFAULT_REQUIREMENTS.PE}
                </span>
              </div>
            </div>

            {/* 6. 총 이수 학점 */}
            <div className="flex flex-col items-center justify-center px-1">
              <span className="text-xs sm:text-sm font-semibold text-zinc-300 leading-none">총 이수 학점</span>
              <span className="text-xl sm:text-2xl font-black font-mono text-postech leading-none mt-0.5 drop-shadow-[0_0_8px_rgba(255,51,112,0.3)]">
                {stats.totalCredits}
              </span>
            </div>
          </div>

          {/* 2단: 비교과 활동 (슬림한 상하 여백 및 완벽한 수직 정렬) */}
          <div className="pt-1.5 border-t border-zinc-700/60 grid grid-cols-6 w-full text-center items-center">
            {/* 1. 자격증 */}
            <div
              className="col-span-2 flex items-center justify-center gap-2 cursor-default border-r border-zinc-700/80 px-2"
              title={stats.certNames.length > 0 ? `자격증 전체: ${stats.certNames.join(', ')}` : '없음'}
            >
              <Award size={15} className="text-amber-400 flex-shrink-0" />
              <span className="text-zinc-300 text-xs sm:text-sm font-semibold">자격증</span>
              <span className="font-black text-amber-300 font-mono text-sm sm:text-base">{stats.certCount}개</span>
              {stats.certNames.length > 0 && (
                <span className="text-zinc-400 text-xs hidden sm:inline font-normal">
                  ({formatList(stats.certNames)})
                </span>
              )}
            </div>

            {/* 2. 인턴 */}
            <div
              className="col-span-2 flex items-center justify-center gap-2 cursor-default border-r border-zinc-700/80 px-2"
              title={stats.internNames.length > 0 ? `인턴 전체: ${stats.internNames.join(', ')}` : '없음'}
            >
              <Briefcase size={15} className="text-blue-400 flex-shrink-0" />
              <span className="text-zinc-300 text-xs sm:text-sm font-semibold">인턴</span>
              <span className="font-black text-blue-300 font-mono text-sm sm:text-base">{stats.internCount}회</span>
              {stats.internNames.length > 0 && (
                <span className="text-zinc-400 text-xs hidden sm:inline font-normal">
                  ({formatList(stats.internNames)})
                </span>
              )}
            </div>

            {/* 3. 연구 */}
            <div
              className="col-span-2 flex items-center justify-center gap-2 cursor-default px-2"
              title={stats.researchNames.length > 0 ? `연구 전체: ${stats.researchNames.join(', ')}` : '없음'}
            >
              <Microscope size={15} className="text-purple-400 flex-shrink-0" />
              <span className="text-zinc-300 text-xs sm:text-sm font-semibold">연구</span>
              <span className="font-black text-purple-300 font-mono text-sm sm:text-base">{stats.researchCount}회</span>
              {stats.researchNames.length > 0 && (
                <span className="text-zinc-400 text-xs hidden sm:inline font-normal">
                  ({formatList(stats.researchNames)})
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

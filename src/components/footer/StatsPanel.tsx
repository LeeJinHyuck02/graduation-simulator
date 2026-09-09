import React, { useMemo } from 'react';
import { usePlannerStore } from '../../store/usePlannerStore';
import { DEFAULT_REQUIREMENTS, DEFAULT_CREDIT_REQUIREMENTS, calculateGraduationStats } from '../../constants/requirements';
import { Award, Briefcase, Microscope, ChevronUp, ChevronDown, BarChart2 } from 'lucide-react';

export const StatsPanel: React.FC = () => {
  const { scenarios, currentScenarioId, showStatsPanel, toggleStatsPanel } = usePlannerStore();
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
    <>
      {/* 1. 플로팅 토글 버튼 (메인 카드 열 max-w-5xl 우측 끝에 정확히 정렬) */}
      <div className="fixed bottom-3 sm:bottom-4 left-0 right-0 z-50 pointer-events-none px-3">
        <div className="w-full max-w-5xl mx-auto flex justify-end">
          <button
            onClick={toggleStatsPanel}
            className={`pointer-events-auto flex items-center gap-2 px-3.5 py-2 rounded-xl border shadow-[0_8px_24px_rgba(0,0,0,0.6)] backdrop-blur-md text-xs font-semibold transition-all group ${
              showStatsPanel
                ? 'bg-zinc-800 text-white border-zinc-600 shadow-postech/10'
                : 'bg-zinc-900/95 hover:bg-zinc-800 text-zinc-200 border-zinc-700/90 hover:border-postech'
            }`}
            title={showStatsPanel ? '이수 현황 대시보드 접기' : '이수 현황 대시보드 펼치기'}
          >
            <BarChart2 size={15} className="text-postech group-hover:scale-110 transition-transform" />
            <span>이수 현황</span>
            <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-zinc-800/90 border border-zinc-700 rounded text-postech">
              {stats.totalCredits}학점
            </span>
            {showStatsPanel ? (
              <ChevronDown size={14} className="text-zinc-400 group-hover:text-white transition-colors" />
            ) : (
              <ChevronUp size={14} className="text-zinc-400 group-hover:text-white transition-colors" />
            )}
          </button>
        </div>
      </div>

      {/* 2. 하단 슬림 대시보드 패널 (토글에 따라 부드럽게 슬라이드 업/다운) */}
      <footer
        className={`fixed bottom-14 left-0 right-0 z-40 pointer-events-none px-3 flex justify-center transition-all duration-300 transform ${
          showStatsPanel
            ? 'translate-y-0 opacity-100'
            : 'translate-y-12 opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-full max-w-5xl pointer-events-auto relative">
          {/* 오리지널 대시보드 통계 패널 박스 (투명 배경 플로팅 아일랜드 스타일) */}
          <div className="rounded-xl border border-zinc-700/70 bg-gradient-to-b from-zinc-800/95 to-zinc-900/95 shadow-[0_12px_32px_rgba(0,0,0,0.7)] backdrop-blur-xl px-3.5 py-1.5 space-y-1">
            {/* 1단: 교과목 이수 현황 (6컬럼 균등 분할) */}
            <div className="grid grid-cols-6 w-full text-center divide-x divide-zinc-700/70 items-center">
              {/* 1. 전공필수 */}
              <div className="flex flex-col items-center justify-center px-1">
                <span className="text-[11px] font-semibold text-zinc-400 leading-none">전공필수</span>
                <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
                  <span className="text-xs sm:text-sm font-bold text-white font-mono leading-tight">
                    {stats.credits.JP} / {DEFAULT_CREDIT_REQUIREMENTS.JP}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">학점</span>
                </div>
              </div>

              {/* 2. 전공선택 */}
              <div className="flex flex-col items-center justify-center px-1">
                <span className="text-[11px] font-semibold text-zinc-400 leading-none">전공선택</span>
                <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
                  <span className="text-xs sm:text-sm font-bold text-white font-mono leading-tight">
                    {stats.credits.JS} / {DEFAULT_CREDIT_REQUIREMENTS.JS}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">학점</span>
                </div>
              </div>

              {/* 3. 자유선택 */}
              <div className="flex flex-col items-center justify-center px-1">
                <span className="text-[11px] font-semibold text-zinc-400 leading-none">자유선택</span>
                <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
                  <span className="text-xs sm:text-sm font-bold text-white font-mono leading-tight">
                    {stats.credits.Jas} / {DEFAULT_CREDIT_REQUIREMENTS.Jas}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">학점</span>
                </div>
              </div>

              {/* 4. 교양선택 */}
              <div className="flex flex-col items-center justify-center px-1">
                <span className="text-[11px] font-semibold text-zinc-400 leading-none">교양선택</span>
                <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
                  <span className="text-xs sm:text-sm font-bold text-white font-mono leading-tight">
                    {stats.credits.GS} / {DEFAULT_CREDIT_REQUIREMENTS.GS}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">학점</span>
                </div>
              </div>

              {/* 5. 영어 / 체육 */}
              <div className="flex flex-col items-center justify-center px-1">
                <span className="text-[11px] font-semibold text-zinc-400 leading-none">영어 / 체육</span>
                <div className="flex items-baseline gap-1 mt-0.5 font-mono text-xs sm:text-sm font-bold leading-tight">
                  <span className="text-orange-400">
                    {stats.counts.Eng} / {DEFAULT_REQUIREMENTS.Eng}
                  </span>
                  <span className="text-zinc-600 font-normal">|</span>
                  <span className="text-teal-400">
                    {stats.counts.PE} / {DEFAULT_REQUIREMENTS.PE}
                  </span>
                </div>
              </div>

              {/* 6. 총 이수 학점 */}
              <div className="flex flex-col items-center justify-center px-1">
                <span className="text-[11px] font-semibold text-zinc-400 leading-none">총 이수 학점</span>
                <span className="text-base sm:text-lg font-black font-mono text-postech leading-tight mt-0.5 drop-shadow-[0_0_8px_rgba(255,51,112,0.3)]">
                  {stats.totalCredits}
                </span>
              </div>
            </div>

            {/* 2단: 비교과 활동 (슬림한 상하 여백 및 완벽한 수직 정렬) */}
            <div className="pt-1 border-t border-zinc-700/60 grid grid-cols-6 w-full text-center items-center">
              {/* 1. 자격증 */}
              <div
                className="col-span-2 flex items-center justify-center gap-1.5 cursor-default border-r border-zinc-700/70 px-2"
                title={stats.certNames.length > 0 ? `자격증 전체: ${stats.certNames.join(', ')}` : '없음'}
              >
                <Award size={13} className="text-amber-400 flex-shrink-0" />
                <span className="text-zinc-400 text-[11px] font-medium">자격증</span>
                <span className="font-bold text-amber-300 font-mono text-xs sm:text-sm">{stats.certCount}개</span>
                {stats.certNames.length > 0 && (
                  <span className="text-zinc-500 text-[10px] hidden sm:inline font-normal truncate">
                    ({formatList(stats.certNames)})
                  </span>
                )}
              </div>

              {/* 2. 인턴 */}
              <div
                className="col-span-2 flex items-center justify-center gap-1.5 cursor-default border-r border-zinc-700/70 px-2"
                title={stats.internNames.length > 0 ? `인턴 전체: ${stats.internNames.join(', ')}` : '없음'}
              >
                <Briefcase size={13} className="text-blue-400 flex-shrink-0" />
                <span className="text-zinc-400 text-[11px] font-medium">인턴</span>
                <span className="font-bold text-blue-300 font-mono text-xs sm:text-sm">{stats.internCount}회</span>
                {stats.internNames.length > 0 && (
                  <span className="text-zinc-500 text-[10px] hidden sm:inline font-normal truncate">
                    ({formatList(stats.internNames)})
                  </span>
                )}
              </div>

              {/* 3. 연구 */}
              <div
                className="col-span-2 flex items-center justify-center gap-1.5 cursor-default px-2"
                title={stats.researchNames.length > 0 ? `연구 전체: ${stats.researchNames.join(', ')}` : '없음'}
              >
                <Microscope size={13} className="text-purple-400 flex-shrink-0" />
                <span className="text-zinc-400 text-[11px] font-medium">연구</span>
                <span className="font-bold text-purple-300 font-mono text-xs sm:text-sm">{stats.researchCount}회</span>
                {stats.researchNames.length > 0 && (
                  <span className="text-zinc-500 text-[10px] hidden sm:inline font-normal truncate">
                    ({formatList(stats.researchNames)})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

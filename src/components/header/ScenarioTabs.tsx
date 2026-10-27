import React, { useState, useRef, useEffect } from 'react';
import { usePlannerStore } from '../../store/usePlannerStore';
import { Plus, ChevronDown, Check, Trash2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useAuthStore } from '../../store/useAuthStore';
import { ScenarioDuration, getSemesterNames } from '../../constants/defaultData';

const DURATION_OPTIONS: { value: ScenarioDuration; label: string; desc: string }[] = [
  { value: 4, label: '4년', desc: '3-1 ~ 4-겨울' },
  { value: 5, label: '5년', desc: '5-1까지 연장' },
];

export const ScenarioTabs: React.FC = () => {
  const { scenarios, currentScenarioId, setCurrentScenarioId, addScenario, deleteScenario } = usePlannerStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [isOpen, setIsOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [duration, setDuration] = useState<ScenarioDuration>(4);
  const [templateId, setTemplateId] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentScenario = scenarios.find((s) => s.id === currentScenarioId) || scenarios[0];
  const canDelete = isAuthenticated && scenarios.length > 1;

  // 템플릿의 학기 중 선택한 학기 구성 범위 밖(예: 4년 선택 시 5학년 1학기)의 과목은 복사되지 않으므로 안내
  const template = scenarios.find((s) => s.id === templateId);
  const semesterNames = getSemesterNames(duration);
  const excludedCourseCount = (template?.semesters || [])
    .filter((sem) => !semesterNames.includes(sem.name))
    .reduce((sum, sem) => sum + sem.courses.length, 0);

  // 외부 클릭 및 ESC 키 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const openAddModal = () => {
    // 기본 템플릿: '기본' 시나리오 (없으면 첫 번째 시나리오)
    const defaultTemplate = scenarios.find((s) => s.scenarioName === '기본') || scenarios[0];
    setNewScenarioName('');
    setDuration(4);
    setTemplateId(defaultTemplate?.id || '');
    setIsOpen(false);
    setIsAddOpen(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScenarioName.trim()) return;
    addScenario(newScenarioName.trim(), duration, templateId || null);
    setNewScenarioName('');
    setIsAddOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`'${name}' 시나리오를 삭제하시겠습니까?\n과목과 비교과 활동이 모두 삭제되며 되돌릴 수 없습니다.`)) {
      deleteScenario(id);
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* 메인 헤더: 현재 선택된 시나리오 트리거 버튼 (핑크 강조형) */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-postech hover:bg-postech-hover shadow-md shadow-postech/20 transition-all cursor-pointer"
          title="시나리오 선택 및 관리"
        >
          <span>{currentScenario?.scenarioName || '시나리오 선택'}</span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* 클릭 시 아래로 토글되는 드롭다운 패널 */}
        {isOpen && (
          <div className="absolute left-0 top-full mt-1.5 z-50 min-w-[170px] bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl backdrop-blur-xl py-1 animate-in fade-in zoom-in-95 duration-150">
            {/* 시나리오 목록 */}
            <div className="max-h-60 overflow-y-auto py-0.5">
              {scenarios.map((scen) => {
                const isActive = scen.id === currentScenarioId;
                return (
                  <div
                    key={scen.id}
                    className={`flex items-center transition-colors ${
                      isActive ? 'bg-postech/15' : 'hover:bg-zinc-800/70'
                    }`}
                  >
                    <button
                      onClick={() => {
                        setCurrentScenarioId(scen.id);
                        setIsOpen(false);
                      }}
                      className={`flex-1 min-w-0 flex items-center justify-between pl-3 py-2 text-xs text-left cursor-pointer ${
                        canDelete ? 'pr-1' : 'pr-3'
                      } ${isActive ? 'text-postech font-bold' : 'text-zinc-300 hover:text-white'}`}
                    >
                      <span className="truncate">{scen.scenarioName}</span>
                      {isActive && <Check size={14} className="text-postech shrink-0 ml-2" />}
                    </button>
                    {/* 시나리오 삭제 버튼 (편집 모드 + 2개 이상일 때만, 터치 기기 고려해 항상 노출) */}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(scen.id, scen.scenarioName)}
                        className="shrink-0 p-1.5 mr-1 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="시나리오 삭제"
                        aria-label={`${scen.scenarioName} 시나리오 삭제`}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 토글 최하단: 시나리오 추가 버튼 (편집 모드에서만) */}
            {isAuthenticated && (
            <div className="pt-1 mt-1 border-t border-zinc-800 px-1">
              <button
                onClick={openAddModal}
                className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 rounded-lg transition-colors font-medium cursor-pointer"
              >
                <Plus size={13} className="text-zinc-400" />
                <span>시나리오 추가</span>
              </button>
            </div>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={isAddOpen && isAuthenticated} onClose={() => setIsAddOpen(false)} title="새 시나리오 추가">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">시나리오 명칭</label>
            <input
              type="text"
              value={newScenarioName}
              onChange={(e) => setNewScenarioName(e.target.value)}
              placeholder="예: 대학원 진학 플랜"
              autoFocus
              className="w-full px-3 py-2 text-sm bg-dark-bg border border-dark-border rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-postech"
            />
          </div>

          {/* 학기 구성: 4년 / 5년(5학년 1학기까지) */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">학기 구성</label>
            <div className="grid grid-cols-2 gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDuration(opt.value)}
                  className={`py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all ${
                    duration === opt.value
                      ? 'border-postech bg-postech/20 text-white shadow-sm ring-1 ring-postech'
                      : 'border-dark-border bg-dark-subcard text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {opt.label}
                  <span className="ml-1.5 font-normal text-[11px] opacity-70">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 과목·활동을 복사해 올 시나리오 */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">기본 과목 불러오기</label>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-dark-bg border border-dark-border rounded-lg text-zinc-100 focus:outline-none focus:border-postech"
            >
              {scenarios.map((scen) => (
                <option key={scen.id} value={scen.id}>
                  {scen.scenarioName}
                </option>
              ))}
              <option value="">빈 시나리오 (불러오지 않음)</option>
            </select>
            <p className="mt-1 text-[11px] text-zinc-500">
              {template
                ? `'${template.scenarioName}'의 과목과 비교과 활동이 같은 학기에 복사됩니다.`
                : '학기만 생성되고 과목은 비어 있습니다.'}
            </p>
            {excludedCourseCount > 0 && (
              <p className="mt-0.5 text-[11px] text-amber-400">
                학기 구성 범위 밖의 과목 {excludedCourseCount}개는 제외됩니다.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 bg-dark-hover rounded-lg"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-postech hover:bg-postech-hover rounded-lg shadow"
            >
              생성하기
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

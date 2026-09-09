import React, { useState, useRef, useEffect } from 'react';
import { usePlannerStore } from '../../store/usePlannerStore';
import { Plus, ChevronDown, Check } from 'lucide-react';
import { Modal } from '../common/Modal';

export const ScenarioTabs: React.FC = () => {
  const { scenarios, currentScenarioId, setCurrentScenarioId, addScenario } = usePlannerStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentScenario = scenarios.find((s) => s.id === currentScenarioId) || scenarios[0];

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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScenarioName.trim()) return;
    addScenario(newScenarioName.trim());
    setNewScenarioName('');
    setIsAddOpen(false);
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
                  <button
                    key={scen.id}
                    onClick={() => {
                      setCurrentScenarioId(scen.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-postech/15 text-postech font-bold'
                        : 'text-zinc-300 hover:text-white hover:bg-zinc-800/70'
                    }`}
                  >
                    <span className="truncate">{scen.scenarioName}</span>
                    {isActive && <Check size={14} className="text-postech shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>

            {/* 토글 최하단: 시나리오 추가 버튼 */}
            <div className="pt-1 mt-1 border-t border-zinc-800 px-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsAddOpen(true);
                }}
                className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 rounded-lg transition-colors font-medium cursor-pointer"
              >
                <Plus size={13} className="text-zinc-400" />
                <span>시나리오 추가</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="새 시나리오 추가">
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


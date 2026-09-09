import React, { useState } from 'react';
import { usePlannerStore } from '../../store/usePlannerStore';
import { Plus } from 'lucide-react';
import { Modal } from '../common/Modal';

export const ScenarioTabs: React.FC = () => {
  const { scenarios, currentScenarioId, setCurrentScenarioId, addScenario } = usePlannerStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScenarioName.trim()) return;
    addScenario(newScenarioName.trim());
    setNewScenarioName('');
    setIsAddOpen(false);
  };

  return (
    <>
      <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
        {scenarios.map((scen) => {
          const isActive = scen.id === currentScenarioId;
          return (
            <button
              key={scen.id}
              onClick={() => setCurrentScenarioId(scen.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-postech text-white shadow-md shadow-postech/20 scale-[1.02]'
                  : 'bg-dark-card hover:bg-dark-hover text-zinc-300 border border-dark-border'
              }`}
            >
              {scen.scenarioName}
            </button>
          );
        })}

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium bg-dark-card hover:bg-dark-hover text-zinc-400 hover:text-zinc-200 border border-dashed border-dark-border whitespace-nowrap transition-colors"
          title="새 시나리오 추가"
        >
          <Plus size={14} />
          <span>시나리오 추가</span>
        </button>
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


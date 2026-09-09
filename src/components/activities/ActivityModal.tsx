import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Activity, ActivityType, ACTIVITY_TYPE_OPTIONS } from '../../types/activity';
import { usePlannerStore } from '../../store/usePlannerStore';
import { Trash2 } from 'lucide-react';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialActivity?: Activity | null;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  initialActivity,
}) => {
  const { scenarios, currentScenarioId, addActivity, updateActivity, deleteActivity } =
    usePlannerStore();
  const currentScenario = scenarios.find((s) => s.id === currentScenarioId);

  const [name, setName] = useState('');
  const [type, setType] = useState<ActivityType>('Cert');
  const [startSem, setStartSem] = useState(0);
  const [endSem, setEndSem] = useState(0);

  const semesters = currentScenario?.semesters || [];

  useEffect(() => {
    if (initialActivity) {
      setName(initialActivity.name);
      setType(initialActivity.type);
      setStartSem(initialActivity.startSem);
      setEndSem(initialActivity.endSem);
    } else {
      setName('');
      setType('Cert');
      setStartSem(0);
      setEndSem(0);
    }
  }, [initialActivity, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalStart = Math.min(Number(startSem), Number(endSem));
    const finalEnd = Math.max(Number(startSem), Number(endSem));

    if (initialActivity) {
      updateActivity(initialActivity.id, {
        name: name.trim(),
        type,
        startSem: finalStart,
        endSem: finalEnd,
      });
    } else {
      addActivity({
        name: name.trim(),
        type,
        credit: 0,
        startSem: finalStart,
        endSem: finalEnd,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (initialActivity && confirm(`'${initialActivity.name}' 활동을 삭제하시겠습니까?`)) {
      deleteActivity(initialActivity.id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialActivity ? '활동 정보 수정' : '새 비교과 활동 추가'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 활동명 */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">활동명</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: SQLD, 삼성 하계 인턴, UGRP"
            autoFocus
            className="w-full px-3 py-2 text-xs bg-dark-bg border border-dark-border rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-postech"
          />
        </div>

        {/* 활동 구분 */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">활동 구분</label>
          <div className="grid grid-cols-3 gap-2">
            {ACTIVITY_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                className={`py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all ${
                  type === opt.value
                    ? 'border-postech bg-postech/20 text-white shadow-sm ring-1 ring-postech'
                    : 'border-dark-border bg-dark-subcard text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 기간 선택 (시작학기 ~ 종료학기) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">시작 학기</label>
            <select
              value={startSem}
              onChange={(e) => setStartSem(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-dark-bg border border-dark-border rounded-lg text-zinc-100 focus:outline-none focus:border-postech"
            >
              {semesters.map((sem) => (
                <option key={sem.id} value={sem.originalIndex}>
                  {sem.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">종료 학기</label>
            <select
              value={endSem}
              onChange={(e) => setEndSem(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-dark-bg border border-dark-border rounded-lg text-zinc-100 focus:outline-none focus:border-postech"
            >
              {semesters.map((sem) => (
                <option key={sem.id} value={sem.originalIndex}>
                  {sem.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center justify-between pt-3 border-t border-dark-border">
          {initialActivity ? (
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-200 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
              <span>활동 삭제</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 bg-dark-hover rounded-lg"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-postech hover:bg-postech-hover rounded-lg shadow"
            >
              {initialActivity ? '저장하기' : '추가하기'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};


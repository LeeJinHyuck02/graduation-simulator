import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Course, CourseType, COURSE_TYPE_OPTIONS } from '../../types/course';
import { usePlannerStore } from '../../store/usePlannerStore';
import { Trash2 } from 'lucide-react';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  semId: string | number | null;
  initialCourse?: Course | null;
}

export const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  onClose,
  semId,
  initialCourse,
}) => {
  const { addCourse, updateCourse, deleteCourse } = usePlannerStore();

  const [name, setName] = useState('');
  const [type, setType] = useState<CourseType>('JS');
  const [credit, setCredit] = useState(3);

  useEffect(() => {
    if (initialCourse) {
      setName(initialCourse.name);
      setType(initialCourse.type);
      setCredit(initialCourse.credit);
    } else {
      setName('');
      setType('JS');
      setCredit(3);
    }
  }, [initialCourse, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialCourse) {
      updateCourse(initialCourse.id, { name: name.trim(), type, credit: Number(credit) });
    } else if (semId !== null) {
      addCourse(semId, { name: name.trim(), type, credit: Number(credit) });
    }
    onClose();
  };

  const handleDelete = () => {
    if (initialCourse && confirm(`'${initialCourse.name || '과목'}'을(를) 삭제하시겠습니까?`)) {
      deleteCourse(initialCourse.id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialCourse ? '과목 정보 수정' : '새 과목 추가'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 과목명 */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">과목명</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 인공지능수학"
            autoFocus
            className="w-full px-3 py-2 text-xs bg-dark-bg border border-dark-border rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-postech"
          />
        </div>

        {/* 이수 구분 선택 */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">이수 구분</label>
          <div className="grid grid-cols-3 gap-2">
            {COURSE_TYPE_OPTIONS.map((opt) => (
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

        {/* 학점 선택 */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">학점</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((cr) => (
              <button
                key={cr}
                type="button"
                onClick={() => setCredit(cr)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
                  credit === cr
                    ? 'border-postech bg-postech text-white'
                    : 'border-dark-border bg-dark-subcard text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {cr}학점
              </button>
            ))}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center justify-between pt-3 border-t border-dark-border">
          {initialCourse ? (
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-200 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
              <span>과목 삭제</span>
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
              {initialCourse ? '저장하기' : '추가하기'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};


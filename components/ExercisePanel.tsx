import React from 'react';
import { ClipboardList, CheckCircle2, XCircle as XCircleIcon, Download } from 'lucide-react';
import { Exercise, ExerciseCheckResult } from '../types';

interface ExercisePanelProps {
  exercises: Exercise[];
  selectedExerciseId: string;
  onSelectExercise: (id: string) => void;
  results: ExerciseCheckResult[] | null;
  onExportResult: () => void;
}

export const ExercisePanel: React.FC<ExercisePanelProps> = ({
  exercises, selectedExerciseId, onSelectExercise, results, onExportResult
}) => {
  const selected = exercises.find(e => e.id === selectedExerciseId);
  const passedCount = results ? results.filter(r => r.passed).length : 0;

  return (
    <section className="bg-white p-4 rounded-xl border border-slate-300">
      <h2 className="text-[10px] font-bold text-purple-600 uppercase mb-3 flex items-center gap-2">
        <ClipboardList size={12} /> Chế độ Đề bài
      </h2>

      <select
        value={selectedExerciseId}
        onChange={(e) => onSelectExercise(e.target.value)}
        className="w-full bg-slate-100 border border-slate-300 rounded px-2 py-1.5 text-[11px] font-bold outline-none focus:border-purple-500 mb-3"
      >
        <option value="">— Không chọn đề bài —</option>
        {exercises.map(ex => (
          <option key={ex.id} value={ex.id}>{ex.title}</option>
        ))}
      </select>

      {selected && (
        <div className="space-y-3">
          <p className="text-[11px] text-slate-600 leading-relaxed">{selected.description}</p>

          {results && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-500 flex justify-between">
                <span>Tiêu chí</span>
                <span>{passedCount}/{results.length}</span>
              </div>
              <ul className="divide-y divide-slate-200">
                {results.map(r => (
                  <li key={r.id} className="flex items-center gap-2 px-3 py-2 text-[11px]">
                    {r.passed
                      ? <CheckCircle2 size={14} className="text-green-600 shrink-0" />
                      : <XCircleIcon size={14} className="text-red-500 shrink-0" />}
                    <span className={r.passed ? 'text-slate-700' : 'text-slate-500'}>{r.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={onExportResult}
            className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Download size={12} /> Nộp bài (xuất .json)
          </button>
        </div>
      )}
    </section>
  );
};

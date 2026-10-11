'use client';

import React, { useState } from 'react';
import {
  Gamepad2,
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Bug,
  Split,
  ListOrdered,
  Sparkles,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { IInteractiveActivity, InteractiveActivityType } from '@/models/Lesson';

interface InteractiveActivityEditorProps {
  activity: IInteractiveActivity;
  onChange: (activity: IInteractiveActivity) => void;
}

export default function InteractiveActivityEditor({
  activity,
  onChange,
}: InteractiveActivityEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [previewGameState, setPreviewGameState] = useState<any>({});
  const [previewFeedback, setPreviewFeedback] = useState<string | null>(null);

  const currentType = activity.type || 'MATCH_PAIRS';

  const handleTypeChange = (newType: InteractiveActivityType) => {
    let updated: IInteractiveActivity = {
      ...activity,
      type: newType,
    };

    if (newType === 'MATCH_PAIRS' && (!updated.pairs || updated.pairs.length === 0)) {
      updated.title = updated.title || "Tushunchalar juftligini toping";
      updated.instructions = updated.instructions || "Chap tomondagi elementni o'ng tomondagi mos element bilan tutashtiring.";
      updated.pairs = [
        { left: 'let', right: "O'zgaruvchan o'zgaruvchi" },
        { left: 'const', right: "O'zgarmas o'zgaruvchi" },
        { left: 'console.log()', right: "Konsolga xabar chiqarish" },
      ];
    } else if (newType === 'ORDER_STEPS' && (!updated.steps || updated.steps.length === 0)) {
      updated.title = updated.title || "Kod satrlarini to'g'ri tartiblang";
      updated.instructions = updated.instructions || "Kod satrlarini yuqoridan pastga mantiqiy ketma-ketlikda joylashtiring.";
      updated.steps = [
        { id: '1', text: 'let a = 5;', correctOrder: 1 },
        { id: '2', text: 'let b = 10;', correctOrder: 2 },
        { id: '3', text: 'let sum = a + b;', correctOrder: 3 },
        { id: '4', text: 'console.log(sum);', correctOrder: 4 },
      ];
    } else if (newType === 'FIND_BUG' && !updated.bugTask) {
      updated.title = updated.title || "Koddagi xatoni toping";
      updated.instructions = updated.instructions || "Quyidagi berilgan kod parchasidagi xatoni aniqlang va to'g'ri yechimni tanlang.";
      updated.bugTask = {
        code: `function hisobla() {\n  const x = 10;\n  x = 20; // Xato qayerda?\n  return x;\n}`,
        options: [
          "'const' o'zgaruvchisiga qayta qiymat berib bo'lmaydi (TypeError)",
          "Funksiya nomida xatolik bor",
          "'return' kalit so'zi noto'g'ri yozilgan",
          "Kodda hech qanday xato yo'q",
        ],
        correctOptionIndex: 0,
        explanation: "'const' bilan e'lon qilingan identifikatorga yangi qiymat qayta tayinlab bo'lmaydi.",
      };
    } else if (newType === 'FILL_BLANKS' && !updated.fillBlanks) {
      updated.title = updated.title || "Bo'sh joylarni to'ldiring";
      updated.instructions = updated.instructions || "Koddagi yetishmayotgan kalit so'zlarni tanlang va to'ldiring.";
      updated.fillBlanks = {
        textWithBlanks: "for (___ i = 0; i < 10; i___) { console.log(i); }",
        missingWords: ["let", "++"],
      };
    }

    onChange(updated);
    setPreviewFeedback(null);
  };

  // Pair editing helpers
  const handleAddPair = () => {
    const pairs = [...(activity.pairs || [])];
    pairs.push({ left: '', right: '' });
    onChange({ ...activity, pairs });
  };

  const handleUpdatePair = (index: number, field: 'left' | 'right', val: string) => {
    const pairs = [...(activity.pairs || [])];
    pairs[index] = { ...pairs[index], [field]: val };
    onChange({ ...activity, pairs });
  };

  const handleDeletePair = (index: number) => {
    const pairs = (activity.pairs || []).filter((_, i) => i !== index);
    onChange({ ...activity, pairs });
  };

  // Step ordering helpers
  const handleAddStep = () => {
    const steps = [...(activity.steps || [])];
    const nextOrder = steps.length + 1;
    steps.push({ id: String(Date.now()), text: '', correctOrder: nextOrder });
    onChange({ ...activity, steps });
  };

  const handleUpdateStep = (index: number, text: string) => {
    const steps = [...(activity.steps || [])];
    steps[index] = { ...steps[index], text };
    onChange({ ...activity, steps });
  };

  const handleDeleteStep = (index: number) => {
    const steps = (activity.steps || []).filter((_, i) => i !== index);
    // Recalculate 1-indexed order
    const reordered = steps.map((s, idx) => ({ ...s, correctOrder: idx + 1 }));
    onChange({ ...activity, steps: reordered });
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const steps = [...(activity.steps || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;
    const temp = steps[index];
    steps[index] = steps[targetIndex];
    steps[targetIndex] = temp;
    const reordered = steps.map((s, idx) => ({ ...s, correctOrder: idx + 1 }));
    onChange({ ...activity, steps: reordered });
  };

  // Bug task helpers
  const handleUpdateBugTask = (field: string, val: any) => {
    const bugTask = { ...(activity.bugTask || { code: '', options: ['', '', '', ''], correctOptionIndex: 0 }), [field]: val };
    onChange({ ...activity, bugTask });
  };

  // Preview tester
  const startPreviewGame = () => {
    setActiveTab('preview');
    setPreviewFeedback(null);
    if (currentType === 'MATCH_PAIRS') {
      const pairs = activity.pairs || [];
      // Shuffle right side for matching challenge
      const shuffledRight = [...pairs].map((p, idx) => ({ text: p.right, originalIdx: idx })).sort(() => Math.random() - 0.5);
      setPreviewGameState({
        selectedLeftIdx: null,
        matchedLeftIndices: [] as number[],
        matches: {} as Record<number, number>, // leftIdx -> rightOriginalIdx
        shuffledRight,
      });
    } else if (currentType === 'ORDER_STEPS') {
      const steps = activity.steps || [];
      // Shuffle steps for user to order
      const shuffled = [...steps].sort(() => Math.random() - 0.5);
      setPreviewGameState({
        currentOrder: shuffled,
      });
    } else if (currentType === 'FIND_BUG') {
      setPreviewGameState({
        selectedOption: null,
      });
    }
  };

  return (
    <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between p-3 bg-slate-50 border-b border-slate-200 gap-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <Gamepad2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-900">Interaktiv Mashg'ulot (O'yin turi)</h4>
            <p className="text-[11px] text-slate-500">Oddiy matn topshirig'i o'rniga o'quvchi uchun jonli interaktiv o'yin</p>
          </div>
        </div>

        {/* Edit / Preview Tabs */}
        <div className="flex items-center space-x-1.5 bg-slate-200/70 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'edit'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tahrirlash
          </button>
          <button
            type="button"
            onClick={startPreviewGame}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
              activeTab === 'preview'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>O'ynab ko'rish</span>
          </button>
        </div>
      </div>

      {activeTab === 'edit' ? (
        <div className="p-4 space-y-4">
          {/* Game Type Picker */}
          <div>
            <label className="block font-bold text-xs text-slate-700 mb-2">Mashg'ulot Turini Tanlang:</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('MATCH_PAIRS')}
                className={`p-3 rounded-xl border text-left transition-all flex items-start space-x-2.5 ${
                  currentType === 'MATCH_PAIRS'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <Split className={`w-4 h-4 mt-0.5 ${currentType === 'MATCH_PAIRS' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <div>
                  <div className="font-extrabold text-xs text-slate-900">A. Juftini top</div>
                  <div className="text-[11px] text-slate-500">Tushuncha va ta'rifni moslashtirish</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('ORDER_STEPS')}
                className={`p-3 rounded-xl border text-left transition-all flex items-start space-x-2.5 ${
                  currentType === 'ORDER_STEPS'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <ListOrdered className={`w-4 h-4 mt-0.5 ${currentType === 'ORDER_STEPS' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <div>
                  <div className="font-extrabold text-xs text-slate-900">B. To'g'ri tartibni top</div>
                  <div className="text-[11px] text-slate-500">Kod satrlarini tartiblash</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('FIND_BUG')}
                className={`p-3 rounded-xl border text-left transition-all flex items-start space-x-2.5 ${
                  currentType === 'FIND_BUG'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <Bug className={`w-4 h-4 mt-0.5 ${currentType === 'FIND_BUG' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <div>
                  <div className="font-extrabold text-xs text-slate-900">C. Koddagi xatoni top</div>
                  <div className="text-[11px] text-slate-500">Xatoni topish va tanlash</div>
                </div>
              </button>
            </div>
          </div>

          {/* Title & Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-xs text-slate-700 mb-1">Mashg'ulot Nomi</label>
              <input
                type="text"
                value={activity.title || ''}
                onChange={(e) => onChange({ ...activity, title: e.target.value })}
                placeholder="Masalan: JavaScript o'zgaruvchilarini moslashtiring"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block font-bold text-xs text-slate-700 mb-1">Ko'rsatma / Qoida</label>
              <input
                type="text"
                value={activity.instructions || ''}
                onChange={(e) => onChange({ ...activity, instructions: e.target.value })}
                placeholder="O'quvchiga vazifani qanday bajarish bo'yicha ko'rsatma"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              />
            </div>
          </div>

          {/* Game Type Specific Editors */}
          {currentType === 'MATCH_PAIRS' && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800">
                  Moslashtirish Juftliklari ({activity.pairs?.length || 0} ta)
                </span>
                <button
                  type="button"
                  onClick={handleAddPair}
                  className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Juftlik qo'shish</span>
                </button>
              </div>

              <div className="space-y-2">
                {(activity.pairs || []).map((pair, idx) => (
                  <div key={idx} className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="w-6 text-center font-bold text-slate-400 text-xs">#{idx + 1}</span>
                    <input
                      type="text"
                      value={pair.left}
                      onChange={(e) => handleUpdatePair(idx, 'left', e.target.value)}
                      placeholder="Chap tomon (Masalan: let)"
                      className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                    />
                    <span className="text-slate-400 font-bold">&rarr;</span>
                    <input
                      type="text"
                      value={pair.right}
                      onChange={(e) => handleUpdatePair(idx, 'right', e.target.value)}
                      placeholder="O'ng tomon (Masalan: O'zgaruvchi)"
                      className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeletePair(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentType === 'ORDER_STEPS' && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800">
                  Tartiblanadigan Satrlar ({activity.steps?.length || 0} ta) — To'g'ri tartibda kiriting:
                </span>
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Satr qo'shish</span>
                </button>
              </div>

              <div className="space-y-2">
                {(activity.steps || []).map((step, idx) => (
                  <div key={idx} className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <span className="w-7 text-center font-mono font-bold text-indigo-600 text-xs bg-indigo-50 py-1 rounded">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={step.text}
                      onChange={(e) => handleUpdateStep(idx, e.target.value)}
                      placeholder={`Qadam #${idx + 1} kodi yoki matni...`}
                      className="flex-1 p-2 bg-white border border-slate-200 rounded-lg font-mono text-xs"
                    />
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveStep(idx, 'up')}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      >
                        &uarr;
                      </button>
                      <button
                        type="button"
                        disabled={idx === (activity.steps?.length || 0) - 1}
                        onClick={() => moveStep(idx, 'down')}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      >
                        &darr;
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteStep(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentType === 'FIND_BUG' && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block font-bold text-xs text-slate-700 mb-1">Xatoli Kod Parchasi</label>
                <textarea
                  rows={4}
                  value={activity.bugTask?.code || ''}
                  onChange={(e) => handleUpdateBugTask('code', e.target.value)}
                  placeholder="function misol() { ... }"
                  className="w-full p-3 bg-slate-900 text-emerald-300 font-mono text-xs rounded-xl border border-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-xs text-slate-700 mb-1.5">
                  Variantlar (To'g'ri variantni radiodan tanlang):
                </label>
                <div className="space-y-2">
                  {(activity.bugTask?.options || ['', '', '', '']).map((opt, idx) => (
                    <div key={idx} className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <input
                        type="radio"
                        name="bugCorrectIndex"
                        checked={(activity.bugTask?.correctOptionIndex || 0) === idx}
                        onChange={() => handleUpdateBugTask('correctOptionIndex', idx)}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="font-bold text-xs text-slate-500">{String.fromCharCode(65 + idx)}:</span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const currentOpts = [...(activity.bugTask?.options || ['', '', '', ''])];
                          currentOpts[idx] = e.target.value;
                          handleUpdateBugTask('options', currentOpts);
                        }}
                        placeholder={`Variant ${String.fromCharCode(65 + idx)}...`}
                        className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-xs text-slate-700 mb-1">Xatoning Tushuntirishi (O'quvchiga beriladi)</label>
                <input
                  type="text"
                  value={activity.bugTask?.explanation || ''}
                  onChange={(e) => handleUpdateBugTask('explanation', e.target.value)}
                  placeholder="Xato nima sababdan yuzaga kelganligi haqida..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Preview / Test Play Mode */
        <div className="p-5 bg-slate-50 min-h-[300px] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4">
              <h4 className="font-extrabold text-sm text-indigo-950 mb-1">{activity.title}</h4>
              <p className="text-xs text-indigo-700">{activity.instructions}</p>
            </div>

            {/* Match Pairs Preview */}
            {currentType === 'MATCH_PAIRS' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Left Column */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Tushuncha</span>
                    {(activity.pairs || []).map((pair, lIdx) => {
                      const isSelected = previewGameState.selectedLeftIdx === lIdx;
                      const isMatched = (previewGameState.matchedLeftIndices || []).includes(lIdx);
                      return (
                        <button
                          key={lIdx}
                          type="button"
                          disabled={isMatched}
                          onClick={() => setPreviewGameState({ ...previewGameState, selectedLeftIdx: lIdx })}
                          className={`w-full p-3 rounded-xl border text-left font-bold text-xs transition-all ${
                            isMatched
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 opacity-60'
                              : isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-400'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                          }`}
                        >
                          {pair.left || `Tushuncha #${lIdx + 1}`}
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Ta'rif / Natija</span>
                    {((previewGameState.shuffledRight || []) as any[]).map((rItem, rIdx) => {
                      const isMatched = Object.values(previewGameState.matches || {}).includes(rItem.originalIdx);
                      return (
                        <button
                          key={rIdx}
                          type="button"
                          disabled={isMatched}
                          onClick={() => {
                            if (previewGameState.selectedLeftIdx === null) {
                              setPreviewFeedback("Avval chap tomondagi tushunchani bosing!");
                              return;
                            }
                            const selLeft = previewGameState.selectedLeftIdx;
                            if (selLeft === rItem.originalIdx) {
                              // Correct match!
                              const nextMatched = [...(previewGameState.matchedLeftIndices || []), selLeft];
                              const nextMatches = { ...(previewGameState.matches || {}), [selLeft]: rItem.originalIdx };
                              setPreviewGameState({
                                ...previewGameState,
                                selectedLeftIdx: null,
                                matchedLeftIndices: nextMatched,
                                matches: nextMatches,
                              });
                              if (nextMatched.length === (activity.pairs || []).length) {
                                setPreviewFeedback("🎉 Ajoyib! Barcha juftliklarni to'g'ri topdingiz!");
                              } else {
                                setPreviewFeedback("To'g'ri! Keyingisini tanlang.");
                              }
                            } else {
                              setPreviewFeedback("Noto'g'ri moslashtirish, qayta urinib ko'ring.");
                            }
                          }}
                          className={`w-full p-3 rounded-xl border text-left font-medium text-xs transition-all ${
                            isMatched
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 opacity-60'
                              : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-800'
                          }`}
                        >
                          {rItem.text || `Ta'rif`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Order Steps Preview */}
            {currentType === 'ORDER_STEPS' && (
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Satrlarni surish orqali to'g'ri ketma-ketlikka keltiring:
                </span>
                <div className="space-y-2">
                  {((previewGameState.currentOrder || []) as any[]).map((st, idx) => (
                    <div key={st.id || idx} className="flex items-center space-x-2 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                      <span className="font-mono text-xs font-bold text-slate-400 w-5">{idx + 1}.</span>
                      <span className="flex-1 font-mono text-xs text-slate-800">{st.text}</span>
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => {
                            const cur = [...previewGameState.currentOrder];
                            const tmp = cur[idx];
                            cur[idx] = cur[idx - 1];
                            cur[idx - 1] = tmp;
                            setPreviewGameState({ ...previewGameState, currentOrder: cur });
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs font-bold disabled:opacity-30"
                        >
                          &uarr;
                        </button>
                        <button
                          type="button"
                          disabled={idx === previewGameState.currentOrder.length - 1}
                          onClick={() => {
                            const cur = [...previewGameState.currentOrder];
                            const tmp = cur[idx];
                            cur[idx] = cur[idx + 1];
                            cur[idx + 1] = tmp;
                            setPreviewGameState({ ...previewGameState, currentOrder: cur });
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs font-bold disabled:opacity-30"
                        >
                          &darr;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const steps = previewGameState.currentOrder || [];
                    let correct = true;
                    for (let i = 0; i < steps.length; i++) {
                      if (steps[i].correctOrder !== i + 1) {
                        correct = false;
                        break;
                      }
                    }
                    if (correct) {
                      setPreviewFeedback("🎉 Mukammal! Kod satrlari to'g'ri tartibda joylashtirildi!");
                    } else {
                      setPreviewFeedback("Tartibda xatolik bor. Qayta tekshirib ko'ring.");
                    }
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Tartibni Tekshirish
                </button>
              </div>
            )}

            {/* Find Bug Preview */}
            {currentType === 'FIND_BUG' && (
              <div className="space-y-4">
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#0d1117] p-3 font-mono text-xs text-emerald-300">
                  <pre>{activity.bugTask?.code || '// Kod mavjud emas'}</pre>
                </div>
                <div className="space-y-2">
                  {(activity.bugTask?.options || []).map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const isCorrect = idx === (activity.bugTask?.correctOptionIndex || 0);
                        if (isCorrect) {
                          setPreviewFeedback(`🎉 To'g'ri! ${activity.bugTask?.explanation || ''}`);
                        } else {
                          setPreviewFeedback("Noto'g'ri variant. Yana bir bor kodga e'tibor bering.");
                        }
                      }}
                      className="w-full p-3 rounded-xl border border-slate-200 hover:border-indigo-400 bg-white text-left font-medium text-xs transition-colors flex items-center space-x-2"
                    >
                      <span className="font-bold text-slate-400">{String.fromCharCode(65 + idx)})</span>
                      <span>{opt}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback alert */}
            {previewFeedback && (
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm font-bold text-xs text-indigo-900 flex items-center space-x-2 animate-fadeIn">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{previewFeedback}</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="button"
              onClick={startPreviewGame}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>O'yinni qayta boshlash</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

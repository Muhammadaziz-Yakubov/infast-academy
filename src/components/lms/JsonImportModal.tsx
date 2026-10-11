'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Upload,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Sparkles,
  BookOpen,
  Layers,
  ArrowRight,
  Code2,
  Trash2,
} from 'lucide-react';

interface CourseOption {
  _id: string;
  name: string;
  durationMonths?: number;
}

interface JsonImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: CourseOption[];
  defaultCourseId: string;
  onSuccess: (courseId: string) => void;
}

const SAMPLE_JSON_DATA = {
  courseName: "Frontend Web Dasturlash (Namuna)",
  modules: [
    {
      title: "1-Modul: JavaScript Asoslari",
      order: 1,
      description: "Zamonaviy JavaScript sintaksisi, o'zgaruvchilar va amallar",
      lessons: [
        {
          title: "1-Dars: O'zgaruvchilar va Ma'lumot Turlari",
          order: 1,
          description: "let, const, var va asosiy primitive ma'lumot turlari",
          theoryContent: "## O'zgaruvchilar va Ma'lumot Turlari\n\nJavaScriptda qiymatlarni xotirada saqlash uchun `let`, `const` va `var` ishlatiladi.\n\n### Asosiy qoidalar:\n1. **const** — qiymati o'zgarmas bo'lgan o'zgaruvchilar uchun.\n2. **let** — qiymati keyinchalik o'zgarishi mumkin bo'lgan o'zgaruvchilar uchun.\n\n```javascript\nconst academy = 'InFast Academy';\nlet studentsCount = 25;\nstudentsCount += 1;\n```\n\n### Ma'lumot turlari:\n- **Primitive**: string, number, boolean, null, undefined, symbol, bigint\n- **Reference**: Object, Array, Function",
          testQuestions: [
            {
              round: 1,
              question: "Qaysi kalit so'z qiymati qayta o'zgarmaydigan o'zgaruvchi yaratadi?",
              options: ["var", "let", "const", "def"],
              correctAnswerIndex: 2,
              explanation: "const (constant) bilan e'lon qilingan o'zgaruvchiga qayta qiymat berib bo'lmaydi."
            },
            {
              round: 1,
              question: "typeof 42 ifodasi qanday natija qaytaradi?",
              options: ["string", "number", "boolean", "integer"],
              correctAnswerIndex: 1,
              explanation: "JavaScriptda barcha butun va kasr sonlar 'number' turiga kiradi."
            },
            {
              round: 1,
              question: "Quyidagilardan qaysi biri primitive ma'lumot turi hisoblanadi?",
              options: ["Object", "Array", "String", "Function"],
              correctAnswerIndex: 2,
              explanation: "String primitive tur, qolganlari esa reference (object) turiga kiradi."
            },
            {
              round: 2,
              question: "let va var o'rtasidagi asosiy farq nima?",
              options: [
                "let funksiya sohasiga ega",
                "let blok sohasiga (block scope) ega",
                "var blok sohasiga ega",
                "Farqi yo'q"
              ],
              correctAnswerIndex: 1,
              explanation: "let va const block scoped hisoblanadi, ya'ni {} bloklari ichida cheklangan."
            },
            {
              round: 2,
              question: "O'zgaruvchi e'lon qilinib, lekin unga qiymat berilmasa, uning qiymati nima bo'ladi?",
              options: ["null", "0", "undefined", "NaN"],
              correctAnswerIndex: 2,
              explanation: "Boshlang'ich qiymat berilmagan o'zgaruvchi qiymati undefined bo'ladi."
            },
            {
              round: 2,
              question: "NaN nimani bildiradi?",
              options: ["Not a Number", "Null and None", "New Array Number", "No Action Needed"],
              correctAnswerIndex: 0,
              explanation: "NaN - Not a Number (son emas) ma'nosini anglatadi."
            },
            {
              round: 3,
              question: "Qaysi operator qiymatni va turini birgalikda tekshiradi?",
              options: ["==", "===", "!=", "="],
              correctAnswerIndex: 1,
              explanation: "=== qat'iy tenglik operatori ham qiymatni, ham ma'lumot turini tekshiradi."
            },
            {
              round: 3,
              question: "JavaScriptda massivlar (array) qaysi turga mansub?",
              options: ["Primitive", "Object", "Function", "Symbol"],
              correctAnswerIndex: 1,
              explanation: "Massivlar JavaScriptda maxsus Object turidir."
            },
            {
              round: 3,
              question: "Template literal yozishda qaysi belgidan foydalaniladi?",
              options: ["Ikkitalik qo'shtirnoq \"\"", "Bittalik qo'shtirnoq ''", "Backtick ``", "Qavslar ()"],
              correctAnswerIndex: 2,
              explanation: "Template literal backtick (``) belgilari orqali yoziladi: `${ozgaruvchi}`."
            }
          ],
          practiceTask: {
            title: "O'zgaruvchilar va amallar",
            instructions: "Ikkita son (a = 20 va b = 30) yarating, ularning yig'indisini hisoblab konsolga chiqaring.",
            starterCode: "// Kodni shu yerda yozing\nconst a = 20;\nconst b = 30;\nconst sum = a + b;\nconsole.log(sum);",
            hints: ["console.log() funksiyasidan foydalaning", "Natija 50 bo'lishi kerak"],
            expectedOutput: "50"
          },
          interactiveActivity: {
            type: "MATCH_PAIRS",
            title: "Tushunchalar juftligini toping",
            instructions: "Chap tomondagi kalit so'zni o'ng tomondagi to'g'ri ta'rifi bilan moslashtiring.",
            pairs: [
              { left: "const", right: "O'zgarmas qiymat e'lon qilish" },
              { left: "let", right: "O'zgaruvchan qiymat e'lon qilish" },
              { left: "typeof", right: "Ma'lumot turini aniqlash" },
              { left: "console.log", right: "Natijani konsolga chiqarish" }
            ]
          },
          xpReward: 50,
          xcoinReward: 10
        }
      ]
    }
  ]
};

export default function JsonImportModal({
  isOpen,
  onClose,
  courses,
  defaultCourseId,
  onSuccess,
}: JsonImportModalProps) {
  const [selectedCourseId, setSelectedCourseId] = useState(defaultCourseId || (courses[0]?._id || ''));
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [inputTab, setInputTab] = useState<'file' | 'text'>('file');
  const [jsonString, setJsonString] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSamplePreview, setShowSamplePreview] = useState(false);
  const [copiedSample, setCopiedSample] = useState(false);

  // Parse and preview analysis
  const parseResult = useMemo(() => {
    if (!jsonString.trim()) {
      return { isValid: false, error: null, modulesCount: 0, lessonsCount: 0 };
    }
    try {
      const parsed = JSON.parse(jsonString);
      const modulesList = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.modules) ? parsed.modules : []);
      if (modulesList.length === 0) {
        return { isValid: false, error: "JSON formatida modullar ('modules') topilmadi", modulesCount: 0, lessonsCount: 0 };
      }
      let lessonsCount = 0;
      for (const m of modulesList) {
        if (Array.isArray(m.lessons)) {
          lessonsCount += m.lessons.length;
        }
      }
      return {
        isValid: true,
        error: null,
        modulesCount: modulesList.length,
        lessonsCount,
      };
    } catch (e: any) {
      return {
        isValid: false,
        error: e.message,
        modulesCount: 0,
        lessonsCount: 0,
      };
    }
  }, [jsonString]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonString(content || '');
    };
    reader.readAsText(file);
  };

  const handleCopySample = () => {
    navigator.clipboard.writeText(JSON.stringify(SAMPLE_JSON_DATA, null, 2));
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2000);
  };

  const handleDownloadSample = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(SAMPLE_JSON_DATA, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "infast-lms-namuna.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleLoadSampleIntoEditor = () => {
    setJsonString(JSON.stringify(SAMPLE_JSON_DATA, null, 2));
    setFileName('infast-lms-namuna.json');
    setInputTab('text');
  };

  const handleSubmit = async () => {
    if (!selectedCourseId) {
      alert("Iltimos, avval kursni tanlang!");
      return;
    }
    if (!parseResult.isValid) {
      alert(parseResult.error || "JSON fayli yaroqsiz!");
      return;
    }

    if (
      importMode === 'replace' &&
      !confirm("Diqqat! 'Qaytatdan yuklash' rejimida ushbu kursdagi barcha mavjud modullar va darslar o'chiriladi. Rozimisiz?")
    ) {
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/courses/${selectedCourseId}/import-json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: importMode,
          rawData: jsonString,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message || "Muvaffaqiyatli yuklandi!");
        onSuccess(selectedCourseId);
        onClose();
      } else {
        alert(data.error || "Yuklashda xatolik yuz berdi");
      }
    } catch (err: any) {
      alert(err.message || "Server bilan bog'lanishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-infast-50 text-infast-600 flex items-center justify-center shadow-sm border border-infast-100">
              <Upload className="w-5 h-5 text-infast-600" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                LMS Modul va Darslarni JSON Orqali Yuklash
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Kurs o'quv rejasini (nazariya, testlar, amaliyot) JSON fayl orqali bir martada yuklang
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Step 1: Select Course */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                1. Kursni tanlang <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-infast-500"
              >
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.durationMonths ? `(${c.durationMonths} oy)` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Import Mode */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                2. Yuklash uslubi
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setImportMode('append')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    importMode === 'append'
                      ? 'bg-white text-infast-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ➕ Qo'shish (Append)
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode('replace')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    importMode === 'replace'
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🔄 Qaytadan yuklash (Replace)
                </button>
              </div>
            </div>
          </div>

          {/* Quick Notice Banner */}
          <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl text-xs text-amber-900">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                JSON formatini bilmaysizmi? Quyidagi namunani ko'ring, nusxalang yoki tayyor faylni yuklab oling!
              </span>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
              <button
                type="button"
                onClick={handleLoadSampleIntoEditor}
                className="px-2.5 py-1.5 bg-white border border-amber-300 text-amber-800 rounded-xl font-bold hover:bg-amber-100 transition-colors shadow-xs"
              >
                Namunani kiritish
              </button>
              <button
                type="button"
                onClick={handleDownloadSample}
                className="px-2.5 py-1.5 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors shadow-xs flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Namuna .json</span>
              </button>
            </div>
          </div>

          {/* Step 3: Input Tabs (File vs Text) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  3. JSON Ma'lumotlarni kiritish:
                </span>
                <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setInputTab('file')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      inputTab === 'file' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Fayl yuklash (.json)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputTab('text')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      inputTab === 'text' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Matn (JSON Text)
                  </button>
                </div>
              </div>

              {/* Status Indicator */}
              {jsonString && (
                <div>
                  {parseResult.isValid ? (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-green-100 text-green-700 text-xs font-extrabold rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        {parseResult.modulesCount} ta modul, {parseResult.lessonsCount} ta dars aniqlandi
                      </span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-red-100 text-red-700 text-xs font-extrabold rounded-full">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Xatolik: {parseResult.error}</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {inputTab === 'file' ? (
              <label className="border-2 border-dashed border-slate-200 hover:border-infast-400 bg-slate-50/50 hover:bg-infast-50/30 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all">
                <FileCode className="w-10 h-10 text-slate-400 mb-2" />
                <span className="text-sm font-bold text-slate-700">
                  {fileName ? fileName : "JSON faylni tanlang yoki bu yerga tashlang"}
                </span>
                <span className="text-xs text-slate-400 mt-1">Faqat .json kengaytmali fayllar</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative">
                <textarea
                  rows={10}
                  value={jsonString}
                  onChange={(e) => setJsonString(e.target.value)}
                  placeholder={`{\n  "modules": [\n    {\n      "title": "1-Modul: ...",\n      "lessons": [...]\n    }\n  ]\n}`}
                  className="w-full p-4 font-mono text-xs bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-infast-500"
                />
                {jsonString && (
                  <button
                    type="button"
                    onClick={() => {
                      setJsonString('');
                      setFileName('');
                    }}
                    className="absolute top-3 right-3 p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs"
                    title="Tozalash"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sample JSON Accordion / Documentation */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/40">
            <div
              onClick={() => setShowSamplePreview(!showSamplePreview)}
              className="p-4 flex items-center justify-between cursor-pointer select-none bg-slate-100/60 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-bold text-slate-800">
                  Namuna JSON strukturasi (Ko'rish & O'rganish)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-semibold text-slate-500">
                  {showSamplePreview ? "Yopish ▲" : "Ochish ▼"}
                </span>
              </div>
            </div>

            {showSamplePreview && (
              <div className="p-4 space-y-3 bg-white border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    Ushbu JSON strukturasi ichida modullar, darslar, 3-raundli testlar, amaliy topshiriq va interaktiv mashg'ulotlar qamrab olingan:
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySample}
                    className="flex items-center space-x-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedSample ? "Nusxalandi! ✓" : "Nusxalash"}</span>
                  </button>
                </div>

                <pre className="max-h-60 overflow-y-auto p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] leading-relaxed">
                  {JSON.stringify(SAMPLE_JSON_DATA, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors"
          >
            Bekor qilish
          </button>

          <button
            type="button"
            disabled={loading || !parseResult.isValid}
            onClick={handleSubmit}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md flex items-center space-x-2 transition-all ${
              loading || !parseResult.isValid
                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                : 'bg-infast-500 hover:bg-infast-600 shadow-infast-500/25'
            }`}
          >
            {loading ? (
              <span>Yuklanmoqda...</span>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>
                  {parseResult.isValid
                    ? `${parseResult.modulesCount} ta modulni bazaga yuklash`
                    : "JSON Yuklash"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

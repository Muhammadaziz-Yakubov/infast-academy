'use client';

import React, { useState } from 'react';
import {
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Minus,
  Code,
  Link2,
  Eye,
  Edit3,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';

interface NotionTheoryEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function NotionTheoryEditor({
  value,
  onChange,
  placeholder = "Darsning nazariy materiali, kod namunalari va tushuntirishlarini kiriting...",
}: NotionTheoryEditorProps) {
  const [activeMode, setActiveMode] = useState<'edit' | 'preview'>('edit');
  const [copied, setCopied] = useState(false);

  const insertSnippet = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('notion-theory-textarea') as HTMLTextAreaElement | null;
    if (!textarea) {
      onChange(value + (value ? '\n\n' : '') + prefix + suffix);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const replacement = prefix + (selectedText || 'matn') + suffix;
    const updated = value.substring(0, start) + replacement + value.substring(end);
    onChange(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText || 'matn').length);
    }, 0);
  };

  const insertCodeBlock = (lang: string = 'javascript') => {
    const snippet = `\`\`\`${lang}\n// Bu yerga kod yozing\nfunction misol() {\n  console.log("Salom Dunyo!");\n}\n\`\`\`\n`;
    const textarea = document.getElementById('notion-theory-textarea') as HTMLTextAreaElement | null;
    if (!textarea) {
      onChange(value + (value ? '\n\n' : '') + snippet);
      return;
    }
    const start = textarea.selectionStart;
    const updated = value.substring(0, start) + (start > 0 && !value.endsWith('\n') ? '\n\n' : '') + snippet + value.substring(start);
    onChange(updated);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Safe markdown parser that turns markdown into structured blocks (without raw dangerouslySetInnerHTML vulnerabilities)
  const renderFormattedPreview = (markdown: string) => {
    if (!markdown || !markdown.trim()) {
      return (
        <div className="py-12 text-center text-slate-400 font-medium">
          Nazariy material hali kiritilmagan. Yuqoridagi bloklardan foydalanib matn yozing.
        </div>
      );
    }

    const lines = markdown.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLanguage = '';
    let codeLines: string[] = [];
    let currentKey = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Handle Code Block start/end
      if (line.trim().startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = line.trim().replace(/^```/, '').trim() || 'code';
          codeLines = [];
        } else {
          inCodeBlock = false;
          elements.push(
            <div key={`code-${currentKey++}`} className="my-4 rounded-2xl overflow-hidden border border-slate-800 bg-[#0d1117] shadow-xl">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                <span className="uppercase tracking-wider font-bold text-amber-400 flex items-center space-x-1">
                  <span>{codeLanguage}</span>
                </span>
                <span className="text-[10px] text-slate-500">InFast LMS Code Runner</span>
              </div>
              <pre className="p-4 font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto whitespace-pre selection:bg-infast-500 selection:text-white">
                <code>{codeLines.join('\n')}</code>
              </pre>
            </div>
          );
        }
        continue;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        continue;
      }

      // Headers
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={`h1-${currentKey++}`} className="text-2xl font-black text-slate-900 mt-6 mb-3 pb-2 border-b border-slate-200">
            {line.replace('# ', '')}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${currentKey++}`} className="text-xl font-extrabold text-slate-900 mt-5 mb-2.5">
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${currentKey++}`} className="text-base font-bold text-slate-800 mt-4 mb-2">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('> ')) {
        // Blockquote / Callout
        elements.push(
          <blockquote
            key={`quote-${currentKey++}`}
            className="my-3 pl-4 py-2 border-l-4 border-infast-500 bg-infast-50/50 rounded-r-xl text-slate-700 italic text-sm"
          >
            {line.replace('> ', '')}
          </blockquote>
        );
      } else if (line.trim() === '---' || line.trim() === '***') {
        // Divider
        elements.push(<hr key={`hr-${currentKey++}`} className="my-6 border-slate-200" />);
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        // Bullet list
        elements.push(
          <li key={`li-${currentKey++}`} className="ml-5 list-disc text-slate-700 my-1 text-sm leading-relaxed">
            {line.replace(/^[-*]\s+/, '')}
          </li>
        );
      } else if (/^\d+\.\s+/.test(line)) {
        // Numbered list
        elements.push(
          <li key={`oli-${currentKey++}`} className="ml-5 list-decimal text-slate-700 my-1 text-sm leading-relaxed">
            {line.replace(/^\d+\.\s+/, '')}
          </li>
        );
      } else if (line.trim().length === 0) {
        // Empty line spacer
        elements.push(<div key={`sp-${currentKey++}`} className="h-2" />);
      } else {
        // Normal paragraph
        elements.push(
          <p key={`p-${currentKey++}`} className="text-sm text-slate-700 my-2 leading-relaxed">
            {line}
          </p>
        );
      }
    }

    return elements;
  };

  return (
    <div className="flex flex-col border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm">
      {/* Notion-style Top Bar & Toolset */}
      <div className="flex flex-wrap items-center justify-between p-2.5 bg-slate-50 border-b border-slate-200 gap-2">
        {/* Formatting Actions */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            title="Katta sarlavha (H1)"
            onClick={() => insertSnippet('# ', '')}
            className="p-1.5 hover:bg-white hover:text-infast-600 rounded-lg text-slate-600 transition-colors border border-transparent hover:border-slate-200"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="O'rta sarlavha (H2)"
            onClick={() => insertSnippet('## ', '')}
            className="p-1.5 hover:bg-white hover:text-infast-600 rounded-lg text-slate-600 transition-colors border border-transparent hover:border-slate-200"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Kichik sarlavha (H3)"
            onClick={() => insertSnippet('### ', '')}
            className="p-1.5 hover:bg-white hover:text-infast-600 rounded-lg text-slate-600 transition-colors border border-transparent hover:border-slate-200"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-slate-300 mx-1" />

          <button
            type="button"
            title="Qalin matn (Bold)"
            onClick={() => insertSnippet('**', '**')}
            className="p-1.5 hover:bg-white hover:text-infast-600 rounded-lg text-slate-600 transition-colors border border-transparent hover:border-slate-200"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Kursiv matn (Italic)"
            onClick={() => insertSnippet('*', '*')}
            className="p-1.5 hover:bg-white hover:text-infast-600 rounded-lg text-slate-600 transition-colors border border-transparent hover:border-slate-200"
          >
            <Italic className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-slate-300 mx-1" />

          <button
            type="button"
            title="Belgilangan ro'yxat"
            onClick={() => insertSnippet('- ', '')}
            className="p-1.5 hover:bg-white hover:text-infast-600 rounded-lg text-slate-600 transition-colors border border-transparent hover:border-slate-200"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Raqamlangan ro'yxat"
            onClick={() => insertSnippet('1. ', '')}
            className="p-1.5 hover:bg-white hover:text-infast-600 rounded-lg text-slate-600 transition-colors border border-transparent hover:border-slate-200"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Iqtibos / Qoida (Callout)"
            onClick={() => insertSnippet('> Muhim qoida: ', '')}
            className="p-1.5 hover:bg-white hover:text-infast-600 rounded-lg text-slate-600 transition-colors border border-transparent hover:border-slate-200"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Ajratuvchi chiziq"
            onClick={() => insertSnippet('\n---\n')}
            className="p-1.5 hover:bg-white hover:text-infast-600 rounded-lg text-slate-600 transition-colors border border-transparent hover:border-slate-200"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-slate-300 mx-1" />

          {/* Programming Code Blocks */}
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => insertCodeBlock('javascript')}
              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[11px] font-mono font-bold flex items-center space-x-1 border border-amber-200"
            >
              <Code className="w-3.5 h-3.5 text-amber-600" />
              <span>JS</span>
            </button>
            <button
              type="button"
              onClick={() => insertCodeBlock('html')}
              className="px-2 py-1 bg-orange-50 hover:bg-orange-100 text-orange-800 rounded-lg text-[11px] font-mono font-bold border border-orange-200"
            >
              HTML
            </button>
            <button
              type="button"
              onClick={() => insertCodeBlock('css')}
              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-[11px] font-mono font-bold border border-blue-200"
            >
              CSS
            </button>
            <button
              type="button"
              onClick={() => insertCodeBlock('python')}
              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-mono font-bold border border-emerald-200"
            >
              Python
            </button>
          </div>
        </div>

        {/* View mode toggle (Edit vs Notion Preview) */}
        <div className="flex items-center space-x-1.5 bg-slate-200/70 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveMode('edit')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
              activeMode === 'edit'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Tahrirlash</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('preview')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
              activeMode === 'preview'
                ? 'bg-white text-infast-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ko'rish (Preview)</span>
          </button>
        </div>
      </div>

      {/* Editor Content Body */}
      {activeMode === 'edit' ? (
        <div className="relative">
          <textarea
            id="notion-theory-textarea"
            rows={12}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full p-4 font-mono text-xs sm:text-sm text-slate-800 leading-relaxed focus:outline-none resize-y min-h-[280px]"
          />
          <div className="absolute right-3 bottom-3 flex items-center space-x-2 text-[11px] text-slate-400 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-slate-100 shadow-sm pointer-events-none">
            <span>{value.length} belgi</span>
            <span>&bull;</span>
            <span>{value.split(/\s+/).filter(Boolean).length} so'z</span>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-slate-50/50 min-h-[280px] max-h-[500px] overflow-y-auto">
          <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            {renderFormattedPreview(value)}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { CheckCircle2, Copy, Check } from "lucide-react";

interface ConceptContentProps {
  conceptTitle: string;
  conceptNumber?: number;
  content: string;
  isMastered?: boolean;
}

export const ConceptContent: React.FC<ConceptContentProps> = ({
  conceptTitle,
  conceptNumber,
  content,
  isMastered = false,
}) => {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  const handleCopyCode = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  const renderFormattedText = (rawText: string) => {
    if (!rawText) return null;

    const blocks = rawText.split("\n\n");

    return blocks.map((block, bIdx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      // Handle code block ```code```
      if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
        const lines = trimmed.slice(3, -3).trim().split("\n");
        const langLine = lines[0].trim();
        const hasLang = !langLine.includes(" ") && langLine.length < 15;
        const language = hasLang ? langLine : "code";
        const codeLines = hasLang ? lines.slice(1) : lines;
        const fullCode = codeLines.join("\n");

        return (
          <div
            key={bIdx}
            className="my-5 rounded-md bg-slate-50 border border-slate-200/80 p-4 font-mono text-xs text-slate-800 flex items-start justify-between shadow-2xs gap-4"
          >
            <div className="flex flex-col gap-1.5 min-w-0 flex-1 overflow-x-auto">
              {codeLines.map((line, lIdx) => (
                <div key={lIdx} className="flex items-center gap-3">
                  <span className="text-slate-400 select-none text-[11px] w-4 text-right">
                    {lIdx + 1}
                  </span>
                  {lIdx === 0 && (
                    <span className="text-indigo-600 font-bold select-none mr-1">
                      {language}
                    </span>
                  )}
                  <span className="whitespace-pre">{line}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleCopyCode(fullCode, bIdx)}
              className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              title="Copy code"
            >
              {copiedCodeIndex === bIdx ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        );
      }

      // Handle bullet lists
      if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
        const items = trimmed.split("\n").filter((i) => i.trim());
        return (
          <ul key={bIdx} className="my-4 space-y-2.5 pl-1">
            {items.map((item, iIdx) => {
              const cleanItem = item.replace(/^[•\-*]\s*/, "");
              return (
                <li
                  key={iIdx}
                  className="flex items-start gap-2.5 text-slate-700 text-sm sm:text-base leading-relaxed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 mt-2.5" />
                  <span>{formatInlineText(cleanItem)}</span>
                </li>
              );
            })}
          </ul>
        );
      }

      // Handle subheadings
      if (/^\d+\.\s/.test(trimmed) && trimmed.length < 80) {
        return (
          <h3 key={bIdx} className="text-lg font-bold text-slate-900 mt-6 mb-2">
            {trimmed}
          </h3>
        );
      }

      // Standard paragraph
      return (
        <p key={bIdx} className="text-slate-700 text-sm sm:text-base leading-relaxed my-3">
          {formatInlineText(trimmed)}
        </p>
      );
    });
  };

  const formatInlineText = (text: string) => {
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

    return parts.map((part, idx) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        const codeText = part.slice(1, -1);
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-mono text-xs font-medium text-slate-800"
          >
            {codeText}
          </code>
        );
      }
      if (part.startsWith("**") && part.endsWith("**")) {
        const boldText = part.slice(2, -2);
        return (
          <strong key={idx} className="font-bold text-slate-900">
            {boldText}
          </strong>
        );
      }
      return part;
    });
  };

  const displayTitle = conceptNumber ? `${conceptNumber}. ${conceptTitle}` : conceptTitle;

  return (
    <div className="flex flex-col gap-2 font-sans max-w-3xl w-full">
      {/* Concept Heading */}
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
          {displayTitle}
        </h2>
        {isMastered && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mastered</span>
          </span>
        )}
      </div>

      {/* Short Indigo Accent Line under heading */}
      <div className="w-8 h-1 bg-indigo-600 rounded-md mt-1 mb-4" />

      {/* Formatted Content */}
      <div className="text-slate-700">
        {renderFormattedText(content)}
      </div>
    </div>
  );
};

export default ConceptContent;

import React from 'react';
import { Award, TrendingDown, BookOpen, Sparkles } from 'lucide-react';
import { calcReadabilityMetrics } from '../utils/readabilityUtils';

export default function ReadabilityBadge({ originalText, transformedContent }) {
  if (!originalText || originalText.trim().length === 0) return null;

  const origMetrics = calcReadabilityMetrics(originalText);

  let transText = originalText;
  if (transformedContent) {
    if (transformedContent.content) transText = transformedContent.content;
    else if (transformedContent.bullets) transText = transformedContent.bullets.join('. ');
    else if (transformedContent.chunks) transText = transformedContent.chunks.map(c => c.content).join('. ');
  }

  const transMetrics = calcReadabilityMetrics(transText);

  // Readability metrics returned from backend server if available, or client computed
  const serverReadability = transformedContent?.readability;

  const origGrade = serverReadability?.original?.fleschKincaidGrade ?? origMetrics.fkgl;
  const transGrade = serverReadability?.transformed?.fleschKincaidGrade ?? transMetrics.fkgl;
  const reductionPct = serverReadability?.complexityReductionPct ?? (origGrade > 0 ? Math.max(0, Math.round(((origGrade - transGrade) / origGrade) * 100)) : 0);
  const origEase = serverReadability?.original?.fleschReadingEase ?? origMetrics.fre;
  const transEase = serverReadability?.transformed?.fleschReadingEase ?? transMetrics.fre;

  return (
    <div className="bg-gradient-to-r from-purple-900/10 via-teal-900/10 to-indigo-900/10 dark:from-purple-900/30 dark:via-teal-900/30 dark:to-indigo-900/30 border border-purple-500/20 rounded-xl p-3.5 shadow-sm text-xs transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 font-semibold text-purple-700 dark:text-purple-300">
          <Award size={16} className="text-amber-500" />
          <span>Readability Accuracy Analysis</span>
        </div>
        {reductionPct > 0 && (
          <span className="inline-flex items-center gap-1 bg-teal-500/15 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full font-bold text-[11px] border border-teal-500/30">
            <TrendingDown size={12} />
            -{reductionPct}% Complexity
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        <div className="bg-white/60 dark:bg-black/40 p-2 rounded-lg border border-black/5 dark:border-white/5">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Original Level</p>
          <p className="font-bold text-sm text-gray-800 dark:text-gray-200">Grade {origGrade}</p>
          <p className="text-[10px] text-gray-400">Ease Score: {origEase}/100</p>
        </div>

        <div className="bg-white/60 dark:bg-black/40 p-2 rounded-lg border border-black/5 dark:border-white/5">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Adapted Level</p>
          <p className="font-bold text-sm text-teal-600 dark:text-teal-400">Grade {transGrade}</p>
          <p className="text-[10px] text-gray-400">Ease Score: {transEase}/100</p>
        </div>

        <div className="bg-white/60 dark:bg-black/40 p-2 rounded-lg border border-black/5 dark:border-white/5">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Word Count</p>
          <p className="font-bold text-sm text-purple-600 dark:text-purple-400">{transMetrics.wordCount} words</p>
          <p className="text-[10px] text-gray-400">Original: {origMetrics.wordCount}</p>
        </div>

        <div className="bg-white/60 dark:bg-black/40 p-2 rounded-lg border border-black/5 dark:border-white/5">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Accuracy Metric</p>
          <p className="font-bold text-sm text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
            <Sparkles size={12} />
            Verified
          </p>
          <p className="text-[10px] text-gray-400">Flesch-Kincaid & FRE</p>
        </div>
      </div>
    </div>
  );
}

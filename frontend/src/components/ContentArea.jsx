import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../context/store';
import { applyHighlights, cx } from '../utils/helpers';
import { bionicFormat } from '../utils/bionicFormatter';
import ReadabilityBadge from './ReadabilityBadge';

export default function ContentArea({ onParaClick, onWordDoubleClick }) {
  const {
    originalText, transformedContent, transformType,
    preferences, focusRulerLine, setFocusRulerLine,
  } = useAppStore();

  const containerRef = useRef(null);

  // Arrow key focus ruler navigation
  useEffect(() => {
    if (!preferences.focusRulerEnabled) return;
    function onKey(e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusRulerLine(n => n + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusRulerLine(n => Math.max(0, n - 1));
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [preferences.focusRulerEnabled, setFocusRulerLine]);

  // Handle double click for dictionary lookup
  function handleDoubleClick(e) {
    const selection = window.getSelection()?.toString().trim();
    if (selection && selection.length > 1) {
      onWordDoubleClick?.(selection);
    }
  }

  const profileClass = cx(
    preferences.profile === 'dyslexia' && 'dyslexia-mode',
    preferences.profile === 'adhd'     && 'adhd-mode',
  );

  // Sensory overlay colors
  const sensoryStyles = {
    peach: 'bg-[#fff4e6] text-[#2d221e]',
    softBlue: 'bg-[#eef6ff] text-[#1c2838]',
    mint: 'bg-[#eefbf4] text-[#1a3326]',
    solarized: 'bg-[#fdf6e3] text-[#657b83]',
  };
  const sensoryClass = preferences.sensoryTint ? sensoryStyles[preferences.sensoryTint] || '' : '';

  const fontSize = preferences.fontSize || 15;
  const paraStyle = { fontSize: `${fontSize}px`, lineHeight: preferences.profile === 'dyslexia' ? 2.1 : 1.7 };

  function paraClass(idx) {
    if (!preferences.focusRulerEnabled) return 'mb-5 text-gray-800 dark:text-gray-200 cursor-pointer select-text';
    return cx(
      'mb-5 text-gray-800 dark:text-gray-200 transition-all duration-200 cursor-pointer select-text',
      idx === focusRulerLine ? 'para-focused p-2 rounded-xl bg-purple-500/10 border-l-4 border-purple-500 shadow-sm' : 'para-dimmed opacity-40 blur-[0.3px]'
    );
  }

  function renderParagraph(pText, idx, extraHtml = null) {
    if (extraHtml) {
      return (
        <p
          key={idx}
          style={paraStyle}
          className={paraClass(idx)}
          dangerouslySetInnerHTML={{ __html: extraHtml }}
          onClick={() => { setFocusRulerLine(idx); onParaClick?.(pText); }}
        />
      );
    }

    if (preferences.bionicReadingEnabled) {
      return (
        <p
          key={idx}
          style={paraStyle}
          className={paraClass(idx)}
          dangerouslySetInnerHTML={{ __html: bionicFormat(pText) }}
          onClick={() => { setFocusRulerLine(idx); onParaClick?.(pText); }}
        />
      );
    }

    return (
      <p
        key={idx}
        style={paraStyle}
        className={paraClass(idx)}
        onClick={() => { setFocusRulerLine(idx); onParaClick?.(pText); }}
      >
        {pText}
      </p>
    );
  }

  return (
    <div
      ref={containerRef}
      onDoubleClick={handleDoubleClick}
      className={cx('p-6 min-h-[350px] transition-all rounded-2xl', profileClass, sensoryClass)}
    >
      {/* Accuracy Readability Metric Badge */}
      <div className="mb-5">
        <ReadabilityBadge originalText={originalText} transformedContent={transformedContent} />
      </div>

      {/* Raw / default text */}
      {(!transformedContent || transformType === 'raw') && (
        <div>
          {originalText.split(/\n\n+/).filter(Boolean).length === 0 ? (
            <div className="py-12 text-center text-gray-400 dark:text-gray-500 text-sm italic">
              Paste or upload your academic text above to transform it into a neuro-friendly learning experience.
            </div>
          ) : (
            originalText.split(/\n\n+/).filter(Boolean).map((p, i) => renderParagraph(p, i))
          )}
        </div>
      )}

      {/* Summary / Simplified / Adapted */}
      {['summarize', 'simplify', 'adapted'].includes(transformType) && transformedContent && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2.5 py-1 rounded-md border border-purple-200 dark:border-purple-800">
              {transformType === 'summarize' ? 'AI Summary' : transformType === 'simplify' ? 'Simplified Passage' : 'Adapted Level'}
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700 font-semibold capitalize">
              Reading Level: {transformedContent.level || 'medium'}
            </span>
          </div>
          {(transformedContent.content || '').split(/\n\n+/).filter(Boolean).map((p, i) => renderParagraph(p, i))}
        </div>
      )}

      {/* Bullets */}
      {transformType === 'bullets' && transformedContent && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-4">
            Key Point Bullet Summary ({transformedContent.level || 'medium'} level)
          </p>
          <ul className="space-y-4">
            {(transformedContent.bullets || []).map((b, i) => (
              <li key={i} className="flex gap-3 items-start cursor-pointer" onClick={() => setFocusRulerLine(i)}>
                <span className="mt-2 w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
                <div className="flex-1">
                  {renderParagraph(b, i)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Chunks */}
      {transformType === 'chunk' && transformedContent && (
        <div className="space-y-6">
          <p className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Chunked Section Breakdown ({transformedContent.level || 'medium'} level)
          </p>
          {(transformedContent.chunks || []).map((c, i) => (
            <div
              key={i}
              className={cx(
                'border-l-4 pl-4 py-2 transition-all duration-200 rounded-r-xl bg-purple-50/40 dark:bg-purple-950/20',
                i % 2 === 0 ? 'border-purple-500' : 'border-teal-500',
                preferences.focusRulerEnabled && i !== focusRulerLine && 'opacity-40 blur-[0.2px]'
              )}
              onClick={() => setFocusRulerLine(i)}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 inline-block mb-2">
                {c.title || `Section ${i + 1}`}
              </span>
              {renderParagraph(c.content, i)}
            </div>
          ))}
        </div>
      )}

      {/* Keywords & Actions */}
      {transformType === 'keywords' && transformedContent && (
        <div>
          <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
            <span className="text-[11px] font-bold text-gray-400 uppercase w-full mb-1">Extracted Key Terms & Action Items</span>
            {(transformedContent.keywords || []).map(k => (
              <span key={k} className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 font-semibold text-xs border border-amber-300/40">
                🏷️ {k}
              </span>
            ))}
            {(transformedContent.actions || []).map(a => (
              <span key={a} className="px-2.5 py-1 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200 font-semibold text-xs border border-teal-300/40">
                ⚡ {a}
              </span>
            ))}
          </div>

          {originalText.split(/\n\n+/).filter(Boolean).map((p, i) => {
            const highlightedHtml = applyHighlights(p, transformedContent.keywords, transformedContent.actions);
            return renderParagraph(p, i, highlightedHtml);
          })}
        </div>
      )}
    </div>
  );
}

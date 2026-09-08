import React, { useState, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useAppStore } from '../context/store';
import { useTTS } from '../hooks/useSpeech';
import { useSpeechRecognition } from '../hooks/useSpeech';
import { transformAPI } from '../services/api';
import { cx } from '../utils/helpers';
import toast from 'react-hot-toast';

const COMMANDS = [
  { cmd: 'summarize',  desc: 'Condense text' },
  { cmd: 'simplify',   desc: 'Easier language' },
  { cmd: 'read',       desc: 'Read aloud' },
  { cmd: 'chunk',      desc: 'Break into parts' },
  { cmd: 'next',       desc: 'Next level' },
  { cmd: 'pause',      desc: 'Stop reading' },
  { cmd: 'easy',       desc: 'Easy level' },
  { cmd: 'advanced',   desc: 'Advanced level' },
];

export default function VoicePanel({ onCommand }) {
  const { originalText, ttsActive, micActive, lastVoiceCommand, setTtsActive } = useAppStore();
  const [log, setLog] = useState('Tap mic or type a command below…');
  const { speak, stop: stopTTS } = useTTS();

  const handleVoiceResult = useCallback(async (transcript) => {
    setLog(`Heard: "${transcript}"`);
    try {
      const { data } = await transformAPI.voiceCommand(originalText.slice(0, 800), transcript);
      setLog(`Intent: ${data.intent} — ${data.response}`);
      toast(data.response, { icon: '🎙️' });
      onCommand?.(data.intent);
    } catch {
      // Fallback local matching
      const cmd = matchCommand(transcript);
      if (cmd) {
        setLog(`Command: ${cmd}`);
        onCommand?.(cmd);
      } else {
        setLog(`Unknown command: "${transcript}"`);
      }
    }
  }, [originalText, onCommand]);

  const { start: startMic, stop: stopMic } = useSpeechRecognition({
    onResult: handleVoiceResult,
    onEnd: () => setLog(prev => prev.includes('Heard:') ? prev : 'Listening stopped.'),
  });

  function matchCommand(text) {
    const t = text.toLowerCase();
    if (t.includes('summar'))  return 'summarize';
    if (t.includes('simpl'))   return 'simplify';
    if (t.includes('bullet') || t.includes('list')) return 'bullets';
    if (t.includes('chunk'))   return 'chunk';
    if (t.includes('keyword')) return 'keywords';
    if (t.includes('read') || t.includes('aloud')) return 'read';
    if (t.includes('pause') || t.includes('stop')) return 'pause';
    if (t.includes('next'))    return 'next';
    if (t.includes('easy'))    return 'easy';
    if (t.includes('medium'))  return 'medium';
    if (t.includes('advanced')) return 'advanced';
    return null;
  }

  function toggleMic() {
    if (micActive) { stopMic(); setLog('Microphone off.'); }
    else { startMic(); setLog('Listening…'); }
  }

  function toggleTTS() {
    if (ttsActive) { stopTTS(); }
    else {
      const text = originalText.slice(0, 1200);
      if (!text) { toast.error('No text to read.'); return; }
      speak(text);
    }
  }

  return (
    <div className="card flex flex-col gap-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Voice assistant</p>

      {/* Mic button */}
      <button
        onClick={toggleMic}
        className={cx(
          'flex items-center gap-2 w-full px-3 py-2.5 rounded-lg border text-sm font-medium transition-all',
          micActive
            ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700 mic-pulse'
            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-white/5 dark:text-gray-300 dark:border-white/10'
        )}
      >
        <span className={cx(
          'w-2 h-2 rounded-full flex-shrink-0',
          micActive ? 'bg-red-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'
        )} />
        {micActive ? 'Listening…' : 'Tap to speak'}
        {micActive ? <MicOff size={14} className="ml-auto" /> : <Mic size={14} className="ml-auto" />}
      </button>

      {/* TTS button */}
      <button
        onClick={toggleTTS}
        className={cx(
          'flex items-center gap-2 w-full px-3 py-2.5 rounded-lg border text-sm font-medium transition-all',
          ttsActive
            ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700'
            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-white/5 dark:text-gray-300 dark:border-white/10'
        )}
      >
        {ttsActive ? <VolumeX size={14} /> : <Volume2 size={14} />}
        {ttsActive ? 'Stop reading' : 'Read aloud'}
      </button>

      {/* Log */}
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 rounded-lg p-2.5 min-h-10 leading-relaxed">
        {log}
        {lastVoiceCommand && (
          <div className="mt-1 text-gray-400 dark:text-gray-500 italic">
            Last: "{lastVoiceCommand}"
          </div>
        )}
      </div>

      {/* Command reference */}
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400 mb-2">Commands</p>
        <div className="grid grid-cols-2 gap-1">
          {COMMANDS.map(({ cmd, desc }) => (
            <div key={cmd} className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 rounded px-1.5 py-0.5">
                {cmd}
              </span>
              <span className="text-[10px] text-gray-400">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

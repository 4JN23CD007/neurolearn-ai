import { useRef, useCallback } from 'react';
import { useAppStore } from '../context/store';
import toast from 'react-hot-toast';

// ── Text-to-Speech ────────────────────────────────────────────────────────────
export function useTTS() {
  const { preferences, setTtsActive } = useAppStore();
  const utteranceRef = useRef(null);

  const speak = useCallback((text) => {
    if (!('speechSynthesis' in window)) {
      toast.error('Text-to-speech is not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate  = preferences.ttsSpeed || 1.0;
    u.pitch = 1.0;
    u.lang  = 'en-US';
    u.onstart = () => setTtsActive(true);
    u.onend   = () => setTtsActive(false);
    u.onerror = () => setTtsActive(false);
    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
  }, [preferences.ttsSpeed, setTtsActive]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setTtsActive(false);
  }, [setTtsActive]);

  return { speak, stop };
}

// ── Speech Recognition (Microphone → Text) ────────────────────────────────────
export function useSpeechRecognition({ onResult, onEnd } = {}) {
  const { setMicActive, setLastVoiceCommand } = useAppStore();
  const recogRef = useRef(null);

  const start = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error('Speech recognition is not supported in this browser.');
      return;
    }

    const recog = new SpeechRecognition();
    recog.lang          = 'en-US';
    recog.continuous    = false;
    recog.interimResults = false;

    recog.onstart  = () => setMicActive(true);
    recog.onend    = () => { setMicActive(false); onEnd?.(); };
    recog.onerror  = () => { setMicActive(false); toast.error('Microphone error.'); };

    recog.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map(r => r[0].transcript)
        .join(' ')
        .trim()
        .toLowerCase();
      setLastVoiceCommand(transcript);
      onResult?.(transcript);
    };

    recogRef.current = recog;
    recog.start();
  }, [setMicActive, setLastVoiceCommand, onResult, onEnd]);

  const stop = useCallback(() => {
    recogRef.current?.stop();
    setMicActive(false);
  }, [setMicActive]);

  return { start, stop };
}

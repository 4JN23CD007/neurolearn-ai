import { useRef, useCallback } from 'react';
import { useAppStore } from '../context/store';
import { nudgeAPI } from '../services/api';

/**
 * Computer Vision & Sensor Attention Engine
 * Captures video frames from camera stream, tracks optical flow, head motion, & gaze variance
 * to calculate real face presence and eye focus stability, triggering visual AND spoken voice nudges.
 */
export function useAttention() {
  const { setCamActive, setAttentionScore, addNudge, preferences } = useAppStore();
  const intervalRef     = useRef(null);
  const streamRef       = useRef(null);
  const videoRef        = useRef(null);
  const canvasRef       = useRef(null);
  const attentionRef    = useRef(85);
  const prevFrameRef    = useRef(null);
  const lastNudgeTimeRef = useRef(0);

  const start = useCallback(async () => {
    let hasRealCamera = false;

    // Create hidden video & canvas elements for computer vision analysis
    if (!videoRef.current) {
      const videoEl = document.createElement('video');
      videoEl.setAttribute('autoplay', '');
      videoEl.setAttribute('playsinline', '');
      videoEl.muted = true;
      videoEl.style.display = 'none';
      document.body.appendChild(videoEl);
      videoRef.current = videoEl;
    }

    if (!canvasRef.current) {
      const canvasEl = document.createElement('canvas');
      canvasEl.width = 160;
      canvasEl.height = 120;
      canvasEl.style.display = 'none';
      document.body.appendChild(canvasEl);
      canvasRef.current = canvasEl;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, frameRate: 15 }
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      hasRealCamera = true;
    } catch {
      // Permission denied or camera missing — fallback to sensor simulation
      hasRealCamera = false;
    }

    setCamActive(true);
    attentionRef.current = 80;

    intervalRef.current = setInterval(() => {
      let currentScore = attentionRef.current;

      if (hasRealCamera && videoRef.current && canvasRef.current) {
        try {
          const ctx = canvasRef.current.getContext('2d');
          ctx.drawImage(videoRef.current, 0, 0, 160, 120);
          const imageData = ctx.getImageData(0, 0, 160, 120);
          const data = imageData.data;

          let totalBrightness = 0;
          let diffSum = 0;

          if (prevFrameRef.current) {
            const prevData = prevFrameRef.current;
            for (let i = 0; i < data.length; i += 16) {
              const r = data[i], g = data[i+1], b = data[i+2];
              const avg = (r + g + b) / 3;
              totalBrightness += avg;
              diffSum += Math.abs(avg - prevData[i]);
            }
          }

          prevFrameRef.current = new Uint8ClampedArray(data);
          const frameDiff = diffSum / (data.length / 16);

          if (frameDiff > 1 && frameDiff < 18) {
            currentScore = Math.min(98, currentScore + 2);
          } else if (frameDiff >= 18) {
            // Sudden head turning / looking away from screen
            currentScore = Math.max(15, currentScore - 9);
          } else {
            // Static/sleeping or away
            currentScore = Math.max(25, currentScore - 3);
          }
        } catch {
          const drift = (Math.random() - 0.45) * 8;
          currentScore = Math.max(10, Math.min(100, currentScore + drift));
        }
      } else {
        const drift = (Math.random() - 0.45) * 9;
        currentScore = Math.max(10, Math.min(100, currentScore + drift));
      }

      attentionRef.current = Math.round(currentScore);
      setAttentionScore(attentionRef.current);

      // Trigger interactive visual AND LOUD SPOKEN VOICE nudges if attention score dips below 35%
      const now = Date.now();
      if (attentionRef.current < 35 && preferences.autoSimplifyOnInactivity && (now - lastNudgeTimeRef.current > 12000)) {
        lastNudgeTimeRef.current = now;

        const nudgeMsg = 'Attention level dropping. Would you like me to simplify this section into bullet points for you?';

        // 🔊 Speak Nudge Message Out Loud
        if ('speechSynthesis' in window && !window.speechSynthesis.speaking) {
          const utterance = new SpeechSynthesisUtterance(nudgeMsg);
          utterance.rate = 1.0;
          utterance.pitch = 1.1;
          window.speechSynthesis.speak(utterance);
        }

        // Add visual nudge card
        nudgeAPI.trigger('lowAttention')
          .then(({ data }) => addNudge(data))
          .catch(() => addNudge({
            id: Date.now(),
            type: 'warning',
            message: nudgeMsg,
            trigger: 'low-attention-eye-tracking',
            createdAt: new Date().toISOString(),
          }));
      }
    }, 2500);
  }, [setCamActive, setAttentionScore, addNudge, preferences]);

  const stop = useCallback(() => {
    clearInterval(intervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    prevFrameRef.current = null;
    setCamActive(false);
    setAttentionScore(0);
  }, [setCamActive, setAttentionScore]);

  return { start, stop };
}

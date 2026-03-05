"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Square, Trash2 } from "lucide-react";

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  onRemove?: () => void;
  hasRecording?: boolean;
}

const MAX_SECONDS = 10;

export function AudioRecorder({ onRecordingComplete, onRemove, hasRecording }: AudioRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecording(false);
    setSeconds(0);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        onRecordingComplete(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      setSeconds(0);

      let elapsed = 0;
      timerRef.current = setInterval(() => {
        elapsed++;
        setSeconds(elapsed);
        if (elapsed >= MAX_SECONDS) {
          stopRecording();
        }
      }, 1000);
    } catch {
      // Mic permission denied or unavailable
    }
  }

  const progress = (seconds / MAX_SECONDS) * 100;

  if (hasRecording && !recording) {
    return (
      <div className="flex items-center gap-3 bg-[#6B8F71]/5 rounded-xl px-4 py-3">
        <div className="w-8 h-8 rounded-full bg-[#6B8F71]/10 flex items-center justify-center">
          <Mic className="w-4 h-4 text-[#6B8F71]" />
        </div>
        <span className="text-sm text-[#6B8F71] font-medium flex-1">Voice memo attached</span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 text-[#94A3B8] hover:text-red-500 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      {recording ? (
        <div className="flex items-center gap-3 bg-red-50 rounded-xl px-4 py-3">
          <div className="relative w-8 h-8">
            <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="14" fill="none" stroke="#E2E8F0" strokeWidth="2" />
              <circle
                cx="16" cy="16" r="14" fill="none" stroke="#EF4444" strokeWidth="2"
                strokeDasharray={`${2 * Math.PI * 14}`}
                strokeDashoffset={`${2 * Math.PI * 14 * (1 - progress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000 linear"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-red-500">
              {MAX_SECONDS - seconds}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-medium text-red-600">Recording...</span>
            </div>
          </div>
          <button
            type="button"
            onClick={stopRecording}
            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={startRecording}
          className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#6B8F71] transition-colors px-3 py-2 rounded-xl hover:bg-[#6B8F71]/5"
        >
          <Mic className="w-4 h-4" />
          Record voice memo (10s max)
        </button>
      )}
    </div>
  );
}

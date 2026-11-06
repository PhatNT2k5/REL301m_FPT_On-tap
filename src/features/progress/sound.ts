/** Small synthesized sound cues (Web Audio), so no audio files are needed. */

export type Cue = "correct" | "wrong" | "complete";

interface Note {
  freq: number;
  start: number; // seconds after now
  length: number;
  type: OscillatorType;
  volume: number;
}

const CUES: Record<Cue, Note[]> = {
  correct: [
    { freq: 659.25, start: 0, length: 0.12, type: "sine", volume: 0.22 },
    { freq: 880, start: 0.09, length: 0.2, type: "sine", volume: 0.22 },
  ],
  wrong: [
    { freq: 196, start: 0, length: 0.16, type: "triangle", volume: 0.3 },
    { freq: 146.83, start: 0.13, length: 0.28, type: "triangle", volume: 0.3 },
  ],
  complete: [
    { freq: 523.25, start: 0, length: 0.14, type: "sine", volume: 0.22 },
    { freq: 659.25, start: 0.12, length: 0.14, type: "sine", volume: 0.22 },
    { freq: 783.99, start: 0.24, length: 0.14, type: "sine", volume: 0.22 },
    { freq: 1046.5, start: 0.36, length: 0.4, type: "sine", volume: 0.24 },
  ],
};

let context: AudioContext | null = null;

const getContext = (): AudioContext | null => {
  try {
    if (!context) {
      const Ctor =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      context = new Ctor();
    }
    if (context.state === "suspended") void context.resume();
    return context;
  } catch {
    return null; // audio blocked or unsupported: the app keeps working silently
  }
};

export const playCue = (cue: Cue): void => {
  const audio = getContext();
  if (!audio) return;
  const now = audio.currentTime;
  for (const note of CUES[cue]) {
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    const begin = now + note.start;
    const end = begin + note.length;
    oscillator.type = note.type;
    oscillator.frequency.setValueAtTime(note.freq, begin);
    gain.gain.setValueAtTime(0.0001, begin);
    gain.gain.exponentialRampToValueAtTime(note.volume, begin + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start(begin);
    oscillator.stop(end + 0.02);
  }
};

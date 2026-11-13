import type { CheckInTone } from './checkInLabels';

interface ToneSpec {
   frequency: number;
   durationSeconds: number;
}

const TONE_SPECS: Record<CheckInTone, ToneSpec> = {
   success: { frequency: 880, durationSeconds: 0.12 },
   warning: { frequency: 440, durationSeconds: 0.22 },
   danger: { frequency: 200, durationSeconds: 0.4 },
};

export function playResultTone(checkInTone: CheckInTone): void {
   try {
      const audioContext: AudioContext = new AudioContext();
      const oscillatorNode: OscillatorNode = audioContext.createOscillator();
      const gainNode: GainNode = audioContext.createGain();
      const toneSpec: ToneSpec = TONE_SPECS[checkInTone];
      oscillatorNode.frequency.value = toneSpec.frequency;
      gainNode.gain.value = 0.15;
      oscillatorNode.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillatorNode.start();
      oscillatorNode.stop(audioContext.currentTime + toneSpec.durationSeconds);
      oscillatorNode.onended = (): void => {
         void audioContext.close();
      };
   } catch {
      return;
   }
}

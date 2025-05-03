import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SpeechService {
  // After — uses an actual runtime feature check
  private synth: SpeechSynthesis | null = 'speechSynthesis' in window ? window.speechSynthesis : null;

  /**
   * Speak the given text. You can optionally adjust rate (0.1–10) and pitch (0–2).
   */
  speak(text: string, options: { rate?: number; pitch?: number; lang?: string } = {}): void {
    if (!this.synth) {
      console.warn('SpeechSynthesis not supported in this browser.');
      return;
    }
    // Cancel any ongoing speech
    this.synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);

    // Apply options if provided
    if (options.rate !== undefined) {
      utter.rate = options.rate;
    }
    if (options.pitch !== undefined) {
      utter.pitch = options.pitch;
    }
    if (options.lang) {
      utter.lang = options.lang;
    }

    this.synth.speak(utter);
  }

  /** Immediately stop any ongoing speech. */
  stop(): void {
    this.synth?.cancel();
  }
}

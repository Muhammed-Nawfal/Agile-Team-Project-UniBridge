import { Injectable } from '@angular/core';
import { AccessibilityService } from '../Accessibility/accessibility.service';

@Injectable({ providedIn: 'root' })
export class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private preferredVoice: SpeechSynthesisVoice | null = null;

  constructor(private a11yService: AccessibilityService) {
    // Initialize speech synthesis if available
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;

      // Load voices
      if ('getVoices' in this.synth) {
        this.voices = this.synth.getVoices();
      }

      // If voices are not loaded yet, wait for them
      if (this.voices.length === 0) {
        window.speechSynthesis.addEventListener('voiceschanged', () => {
          this.voices = this.synth?.getVoices() ?? [];
          this.selectPreferredVoice();
        });
      } else {
        this.selectPreferredVoice();
      }
    }
  }

  speak(text: string): void {
    // Only speak if screen reader is enabled
    if (!this.a11yService.isScreenReaderEnabled() || !this.synth) {
      return;
    }

    // Stop any previous speech
    this.synth.cancel();

    // Create and configure utterance
    const utterance = new SpeechSynthesisUtterance(text);

    // Use preferred voice if available
    if (this.preferredVoice) {
      utterance.voice = this.preferredVoice;
    }

    // Speak the text
    this.synth.speak(utterance);
  }

  private selectPreferredVoice(): void {
    if (!this.voices.length) return;

    // Try to find an English voice
    this.preferredVoice =
      this.voices.find(v => v.lang.toLowerCase().includes('en-us') || v.lang.toLowerCase().includes('en-gb')) ?? this.voices[0];
  }
}

// src/main/webapp/app/shared/a11y/screen-reader.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ScreenReaderService {
  // Public property
  public readonly active$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  // Private properties
  private readonly STORAGE_KEY = 'unibridge:a11y-screen-reader';
  private announcer: HTMLElement | null = null;

  constructor() {
    // Load initial state
    this.loadState();

    // Create screen reader announcer element
    this.createAnnouncer();
  }

  /**
   * Announce a message to screen readers
   * @param message The message to announce
   * @param priority 'polite' or 'assertive'
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.active$.value || !this.announcer) {
      return;
    }

    // Update aria-live attribute
    this.announcer.setAttribute('aria-live', priority);

    // Set content (this triggers screen readers to read it)
    this.announcer.textContent = '';

    // Force a DOM reflow without using disallowed expressions
    this.forceReflow(this.announcer);

    // Set the text
    this.announcer.textContent = message;

    // Clear the announcer after a delay
    setTimeout(() => {
      if (this.announcer) {
        this.announcer.textContent = '';
      }
    }, 3000);
  }

  /**
   * Toggle screen reader on/off
   * @param active Force to specific state (optional)
   */
  toggle(active?: boolean): void {
    // Fix this line to use nullish coalescing
    const newState = active ?? !this.active$.value;
    this.active$.next(newState);

    // Save to localStorage
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newState));
    } catch {
      // Ignore storage errors
    }

    if (newState) {
      this.announce('Screen reader mode activated', 'assertive');
    }
  }

  /**
   * Helper method to force reflow without using disallowed expressions
   */
  private forceReflow(element: HTMLElement): void {
    // This reads the offsetWidth property but doesn't use the value
    // to avoid the no-unused-expressions rule
    const reflow = element.offsetWidth;
  }

  /**
   * Load saved state from localStorage
   */
  private loadState(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored !== null) {
        this.active$.next(JSON.parse(stored) === true);
      }
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Create the announcer element for screen readers
   */
  private createAnnouncer(): void {
    if (typeof document === 'undefined') {
      return; // SSR check
    }

    this.announcer = document.getElementById('sr-announcer');

    if (!this.announcer) {
      this.announcer = document.createElement('div');
      this.announcer.setAttribute('id', 'sr-announcer');
      this.announcer.setAttribute('aria-live', 'polite');
      this.announcer.setAttribute('aria-atomic', 'true');
      this.announcer.classList.add('sr-only');
      document.body.appendChild(this.announcer);
    }
  }
}

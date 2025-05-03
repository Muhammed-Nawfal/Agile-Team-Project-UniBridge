// src/main/webapp/app/core/accessibility.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AccessibilityService {
  private readonly STORAGE_KEY = 'unibridge:a11y-enabled';

  // Seed from localStorage on startup
  private enabled$ = new BehaviorSubject<boolean>(this.loadInitial());

  // Export as observable
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public readonly isEnabled$ = this.enabled$.asObservable();

  /** synchronous getter for template and code */
  isEnabled(): boolean {
    return this.enabled$.value;
  }

  /** toggle and persist */
  setEnabled(on: boolean): void {
    this.enabled$.next(on);
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(on));
    } catch {
      // ignore storage errors
    }
  }

  /** read from storage once at service instantiation */
  private loadInitial(): boolean {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored !== null ? JSON.parse(stored) === true : false;
    } catch {
      return false;
    }
  }
}

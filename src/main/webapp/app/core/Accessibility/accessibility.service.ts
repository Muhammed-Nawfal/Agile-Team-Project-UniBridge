import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AccessibilityService {
  private readonly STORAGE_KEY = 'unibridge:a11y-enabled';
  private enabled$ = new BehaviorSubject(false);
  // eslint-disable-next-line @typescript-eslint/member-ordering
  isEnabled$ = this.enabled$.asObservable();

  isEnabled(): boolean {
    return this.enabled$.value;
  }

  setEnabled(on: boolean): void {
    this.enabled$.next(on);
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(on));
    } catch {
      // if storage is full/disabled for some reason, silently ignore
    }
  }

  private loadInitial(): boolean {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored !== null ? JSON.parse(stored) === true : false;
    } catch {
      return false;
    }
  }
}

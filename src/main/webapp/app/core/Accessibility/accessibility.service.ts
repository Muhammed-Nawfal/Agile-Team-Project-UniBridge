// src/main/webapp/app/core/accessibility.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AccessibilitySettings {
  enabled: boolean;
  fontSize: string;
  contrast: string;
  theme: string;
  screenReaderActive: boolean; // Added screen reader setting
}

@Injectable({ providedIn: 'root' })
export class AccessibilityService {
  // Public properties first (no private fields before these)
  public readonly isEnabled$ = new BehaviorSubject<boolean>(false); // Initialize with default value first
  public readonly settings: Observable<AccessibilitySettings>; // Declare without initializing

  // Private properties after all public properties
  private readonly STORAGE_KEY_PREFIX = 'unibridge:a11y-';
  private readonly STORAGE_KEY_ENABLED = `${this.STORAGE_KEY_PREFIX}enabled`;
  private readonly STORAGE_KEY_FONT_SIZE = `${this.STORAGE_KEY_PREFIX}font-size`;
  private readonly STORAGE_KEY_CONTRAST = `${this.STORAGE_KEY_PREFIX}contrast`;
  private readonly STORAGE_KEY_THEME = `${this.STORAGE_KEY_PREFIX}theme`;
  private readonly STORAGE_KEY_SCREEN_READER = `${this.STORAGE_KEY_PREFIX}screen-reader`; // Added for screen reader

  private readonly defaultSettings: AccessibilitySettings = {
    enabled: false,
    fontSize: 'medium',
    contrast: 'normal',
    theme: 'light',
    screenReaderActive: false, // Default to false
  };

  private readonly settingsSubject: BehaviorSubject<AccessibilitySettings>;

  constructor() {
    // Initialize private fields that depend on methods
    const initialSettings = this.loadInitialSettings();
    this.settingsSubject = new BehaviorSubject<AccessibilitySettings>(initialSettings);

    // Initialize public field that depends on private field
    this.settings = this.settingsSubject.asObservable();

    // Initialize isEnabled$ with the actual value
    this.isEnabled$.next(this.loadEnabled());

    // Apply settings on service initialization
    this.applySettings(this.settingsSubject.getValue());

    // Update isEnabled$ when settings change
    this.settingsSubject.subscribe(settings => {
      this.isEnabled$.next(settings.enabled);
    });
  }

  /** synchronous getter for template and code */
  isEnabled(): boolean {
    return this.settingsSubject.getValue().enabled;
  }

  /** Check if screen reader is enabled */
  isScreenReaderEnabled(): boolean {
    const settings = this.settingsSubject.getValue();
    return settings.enabled && settings.screenReaderActive;
  }

  /** toggle and persist accessibility mode */
  setEnabled(on: boolean): void {
    const currentSettings = this.settingsSubject.getValue();
    const newSettings = { ...currentSettings, enabled: on };
    this.settingsSubject.next(newSettings);

    try {
      localStorage.setItem(this.STORAGE_KEY_ENABLED, JSON.stringify(on));
    } catch {
      // ignore storage errors
    }

    this.applySettings(newSettings);
  }

  /** Change font size and persist */
  setFontSize(size: string): void {
    if (!['small', 'medium', 'large', 'x-large'].includes(size)) {
      return;
    }

    const currentSettings = this.settingsSubject.getValue();
    const newSettings = { ...currentSettings, fontSize: size };
    this.settingsSubject.next(newSettings);

    try {
      localStorage.setItem(this.STORAGE_KEY_FONT_SIZE, size);
    } catch {
      // ignore storage errors
    }

    this.applySettings(newSettings);
  }

  /** Toggle contrast between normal and high */
  toggleContrast(): void {
    const currentSettings = this.settingsSubject.getValue();
    const newContrast = currentSettings.contrast === 'normal' ? 'high' : 'normal';
    const newSettings = { ...currentSettings, contrast: newContrast };
    this.settingsSubject.next(newSettings);

    try {
      localStorage.setItem(this.STORAGE_KEY_CONTRAST, newContrast);
    } catch {
      // ignore storage errors
    }

    this.applySettings(newSettings);
  }

  /** Toggle theme between light and dark */
  toggleTheme(): void {
    const currentSettings = this.settingsSubject.getValue();
    const newTheme = currentSettings.theme === 'light' ? 'dark' : 'light';
    const newSettings = { ...currentSettings, theme: newTheme };
    this.settingsSubject.next(newSettings);

    try {
      localStorage.setItem(this.STORAGE_KEY_THEME, newTheme);
    } catch {
      // ignore storage errors
    }

    this.applySettings(newSettings);
  }

  /** Toggle screen reader and persist */
  toggleScreenReader(): void {
    const currentSettings = this.settingsSubject.getValue();
    const newScreenReaderActive = !currentSettings.screenReaderActive;
    const newSettings = { ...currentSettings, screenReaderActive: newScreenReaderActive };
    this.settingsSubject.next(newSettings);

    try {
      localStorage.setItem(this.STORAGE_KEY_SCREEN_READER, JSON.stringify(newScreenReaderActive));
    } catch {
      // ignore storage errors
    }

    this.applySettings(newSettings);
  }

  /** Reset all settings to defaults */
  resetToDefaults(): void {
    this.settingsSubject.next(this.defaultSettings);

    try {
      localStorage.setItem(this.STORAGE_KEY_ENABLED, JSON.stringify(this.defaultSettings.enabled));
      localStorage.setItem(this.STORAGE_KEY_FONT_SIZE, this.defaultSettings.fontSize);
      localStorage.setItem(this.STORAGE_KEY_CONTRAST, this.defaultSettings.contrast);
      localStorage.setItem(this.STORAGE_KEY_THEME, this.defaultSettings.theme);
      localStorage.setItem(this.STORAGE_KEY_SCREEN_READER, JSON.stringify(this.defaultSettings.screenReaderActive));
    } catch {
      // ignore storage errors
    }

    this.applySettings(this.defaultSettings);
  }

  /** Apply current settings to the DOM */
  private applySettings(settings: AccessibilitySettings): void {
    if (!settings.enabled) {
      // Clear all accessibility classes if disabled
      document.documentElement.removeAttribute('data-font-size');
      document.documentElement.removeAttribute('data-contrast');
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.removeAttribute('data-screen-reader'); // Add screen reader attribute
      document.documentElement.classList.remove('high-contrast', 'dark-theme');
      document.documentElement.style.removeProperty('--font-size-multiplier');
      return;
    }

    // Apply font size
    document.documentElement.setAttribute('data-font-size', settings.fontSize);
    const fontSizeMap: Record<string, string> = {
      small: '0.9',
      medium: '1.0',
      large: '1.15',
      'x-large': '1.3',
    };
    document.documentElement.style.setProperty('--font-size-multiplier', fontSizeMap[settings.fontSize] ?? '1.0');

    // Apply contrast
    document.documentElement.setAttribute('data-contrast', settings.contrast);
    if (settings.contrast === 'high') {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    // Apply theme
    document.documentElement.setAttribute('data-theme', settings.theme);
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }

    // Apply screen reader setting
    document.documentElement.setAttribute('data-screen-reader', String(settings.screenReaderActive));
  }

  /** read accessibility enabled state from storage */
  private loadEnabled(): boolean {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_ENABLED);
      return stored !== null ? JSON.parse(stored) === true : this.defaultSettings.enabled;
    } catch {
      return this.defaultSettings.enabled;
    }
  }

  /** read all settings from storage */
  private loadInitialSettings(): AccessibilitySettings {
    try {
      const settings = { ...this.defaultSettings };

      const enabledStored = localStorage.getItem(this.STORAGE_KEY_ENABLED);
      if (enabledStored !== null) {
        settings.enabled = JSON.parse(enabledStored) === true;
      }

      const fontSizeStored = localStorage.getItem(this.STORAGE_KEY_FONT_SIZE);
      if (fontSizeStored !== null && ['small', 'medium', 'large', 'x-large'].includes(fontSizeStored)) {
        settings.fontSize = fontSizeStored;
      }

      const contrastStored = localStorage.getItem(this.STORAGE_KEY_CONTRAST);
      if (contrastStored !== null && ['normal', 'high'].includes(contrastStored)) {
        settings.contrast = contrastStored;
      }

      const themeStored = localStorage.getItem(this.STORAGE_KEY_THEME);
      if (themeStored !== null && ['light', 'dark'].includes(themeStored)) {
        settings.theme = themeStored;
      }

      const screenReaderStored = localStorage.getItem(this.STORAGE_KEY_SCREEN_READER);
      if (screenReaderStored !== null) {
        settings.screenReaderActive = JSON.parse(screenReaderStored) === true;
      }

      return settings;
    } catch {
      return this.defaultSettings;
    }
  }
}

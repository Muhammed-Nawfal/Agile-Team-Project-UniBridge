// src/main/webapp/app/shared/accessibility/accessibility.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUniversalAccess, faTextHeight, faAdjust, faMoon, faSun, faHeadphones } from '@fortawesome/free-solid-svg-icons';
import { AccessibilityService } from '../../core/Accessibility/accessibility.service';

@Component({
  selector: 'jhi-accessibility',
  templateUrl: './accessibility.component.html',
  styleUrls: ['./accessibility.component.scss'],
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
})
export class AccessibilityComponent implements OnInit {
  // Icons
  faUniversalAccess = faUniversalAccess;
  faTextHeight = faTextHeight;
  faAdjust = faAdjust;
  faMoon = faMoon;
  faSun = faSun;
  faHeadphones = faHeadphones; // Add headphones icon for screen reader

  // State variables
  isMenuOpen = false;
  accessibilityEnabled = false;
  fontSize = 'medium';
  contrast = 'normal';
  theme = 'light';
  screenReaderActive = false; // Add screen reader state

  constructor(private accessibilityService: AccessibilityService) {}

  ngOnInit(): void {
    // Subscribe to accessibility state
    this.accessibilityService.settings.subscribe(settings => {
      this.accessibilityEnabled = settings.enabled;
      this.fontSize = settings.fontSize;
      this.contrast = settings.contrast;
      this.theme = settings.theme;
      this.screenReaderActive = settings.screenReaderActive; // Set screen reader state
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleAccessibility(): void {
    this.accessibilityService.setEnabled(!this.accessibilityEnabled);
  }

  changeFontSize(size: string): void {
    this.accessibilityService.setFontSize(size);
  }

  toggleContrast(): void {
    this.accessibilityService.toggleContrast();
  }

  toggleTheme(): void {
    this.accessibilityService.toggleTheme();
  }

  // Add this method to your class
  toggleScreenReader(): void {
    this.accessibilityService.toggleScreenReader();
  }

  resetToDefaults(): void {
    this.accessibilityService.resetToDefaults();
  }
}

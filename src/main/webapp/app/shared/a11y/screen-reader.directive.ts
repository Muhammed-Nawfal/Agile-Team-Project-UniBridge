// src/main/webapp/app/shared/a11y/screen-reader.directive.ts
import { Directive, ElementRef, Input, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { ScreenReaderService } from '/screen-reader.service.ts';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[jhiScreenReader]',
  standalone: true,
})
export class ScreenReaderDirective implements AfterViewInit, OnDestroy {
  @Input() srDescription = ''; // Custom description
  @Input() srAction = ''; // Action when interacted with
  @Input() srLabel = ''; // Label for the element
  @Input() srAnnounceOnHover = false; // Whether to announce on hover
  @Input() srAnnounceOnFocus = true; // Whether to announce on focus

  private active = false;
  private subscription: Subscription | null = null;

  constructor(
    private el: ElementRef,
    private screenReaderService: ScreenReaderService,
  ) {}

  ngAfterViewInit(): void {
    // Subscribe to screen reader state changes
    this.subscription = this.screenReaderService.active$.subscribe(active => {
      this.active = active;
      this.updateAriaAttributes();
    });

    // Initial setup
    this.updateAriaAttributes();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (this.active && this.srAnnounceOnHover) {
      this.announce();
    }
  }

  @HostListener('focus')
  onFocus(): void {
    if (this.active && this.srAnnounceOnFocus) {
      this.announce();
    }
  }

  private updateAriaAttributes(): void {
    const el = this.el.nativeElement;

    // Add basic ARIA attributes based on inputs
    if (this.srLabel) {
      el.setAttribute('aria-label', this.srLabel);
    }

    if (this.srDescription) {
      // Create or update description element
      let descId = el.getAttribute('aria-describedby');
      let descEl;

      if (!descId) {
        descId = `desc-${this.generateId()}`;
        el.setAttribute('aria-describedby', descId);
        descEl = document.createElement('div');
        descEl.id = descId;
        descEl.classList.add('sr-only');
        el.parentNode?.appendChild(descEl);
      } else {
        descEl = document.getElementById(descId);
      }

      if (descEl) {
        descEl.textContent = this.srDescription;
      }
    }
  }

  private announce(): void {
    const message = this.buildAnnouncement();
    if (message) {
      this.screenReaderService.announce(message);
    }
  }

  private buildAnnouncement(): string {
    const parts: string[] = [];

    if (this.srLabel) {
      parts.push(this.srLabel);
    } else {
      // Try to use existing accessible name
      const el = this.el.nativeElement;
      const text = el.textContent?.trim();
      const ariaLabel = el.getAttribute('aria-label');
      const labelledBy = el.getAttribute('aria-labelledby');
      let labelText = '';

      if (ariaLabel) {
        labelText = ariaLabel;
      } else if (labelledBy) {
        const labelEl = document.getElementById(labelledBy);
        if (labelEl) {
          labelText = labelEl.textContent?.trim() ?? '';
        }
      } else if (text) {
        labelText = text;
      }

      if (labelText) {
        parts.push(labelText);
      }
    }

    if (this.srDescription) {
      parts.push(this.srDescription);
    }

    if (this.srAction) {
      parts.push(this.srAction);
    }

    return parts.join('. ');
  }

  private generateId(): string {
    return `sr-${Math.random().toString(36).substring(2, 9)}`;
  }
}

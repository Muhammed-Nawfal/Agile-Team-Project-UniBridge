import { Directive, OnInit, OnDestroy, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subscription } from 'rxjs';
import { AccessibilityService } from 'app/core/Accessibility/accessibility.service';
import { SpeechService } from 'app/core/speech/speech.service';

@Directive({
  selector: '[jhiGlobalAccessibility]',
  standalone: true,
})
export class GlobalAccessibilityDirective implements OnInit, OnDestroy {
  private mutationObserver: MutationObserver | null = null;
  private subscription: Subscription | null = null;
  private screenReaderEnabled = false;

  constructor(
    private renderer: Renderer2,
    private a11yService: AccessibilityService,
    private speechService: SpeechService,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  ngOnInit(): void {
    // Subscribe to accessibility settings
    this.subscription = this.a11yService.settings.subscribe(settings => {
      const wasEnabled = this.screenReaderEnabled;
      this.screenReaderEnabled = settings.enabled && settings.screenReaderActive;

      // Start or stop observing DOM changes based on screen reader state
      if (!wasEnabled && this.screenReaderEnabled) {
        this.startObserving();
        // Apply to existing elements
        this.applyAccessibilityToExistingElements();
      } else if (wasEnabled && !this.screenReaderEnabled) {
        this.stopObserving();
      }
    });
  }

  ngOnDestroy(): void {
    this.stopObserving();

    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  private startObserving(): void {
    if (this.mutationObserver) {
      return;
    }

    // Create an observer to watch for new elements
    this.mutationObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.processElement(node as HTMLElement);
            }
          });
        }
      });
    });

    // Start observing the entire document
    this.mutationObserver.observe(this.document.body, {
      childList: true,
      subtree: true,
    });
  }

  private stopObserving(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
  }

  private applyAccessibilityToExistingElements(): void {
    // Apply to interactive elements
    const interactiveElements = this.document.querySelectorAll(
      'button, a, input, select, textarea, [role="button"], [role="link"], [tabindex="0"]',
    );

    interactiveElements.forEach(el => {
      this.setupAccessibilityListeners(el as HTMLElement);
    });
  }

  private processElement(element: HTMLElement): void {
    // Process the element itself
    if (this.isInteractiveElement(element)) {
      this.setupAccessibilityListeners(element);
    }

    // Process children recursively
    const children = element.querySelectorAll('button, a, input, select, textarea, [role="button"], [role="link"], [tabindex="0"]');

    children.forEach(child => {
      this.setupAccessibilityListeners(child as HTMLElement);
    });
  }

  private isInteractiveElement(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase();
    const hasTabIndex = element.hasAttribute('tabindex');
    const role = element.getAttribute('role');

    return (
      tagName === 'button' ||
      tagName === 'a' ||
      tagName === 'input' ||
      tagName === 'select' ||
      tagName === 'textarea' ||
      role === 'button' ||
      role === 'link' ||
      (hasTabIndex && element.getAttribute('tabindex') !== '-1')
    );
  }

  private setupAccessibilityListeners(element: HTMLElement): void {
    // Skip if already processed
    if (element.hasAttribute('data-a11y-processed')) {
      return;
    }

    const tagName = element.tagName.toLowerCase();

    // Add focus listener
    this.renderer.listen(element, 'focus', () => {
      if (!this.screenReaderEnabled) return;

      const label = this.getAccessibleName(element);
      if (label) {
        this.speechService.speak(label);
      }
    });

    // Add hover listener
    this.renderer.listen(element, 'mouseenter', () => {
      if (!this.screenReaderEnabled) return;

      // Only announce on hover for interactive elements
      if (tagName === 'button' || tagName === 'a' || element.getAttribute('role') === 'button' || element.getAttribute('role') === 'link') {
        const label = this.getAccessibleName(element);
        if (label) {
          this.speechService.speak(label);
        }
      }
    });

    // Special handling for select elements
    if (tagName === 'select') {
      this.renderer.listen(element, 'change', () => {
        if (!this.screenReaderEnabled) return;

        const select = element as HTMLSelectElement;
        const selectedOption = select.options[select.selectedIndex];
        const optionText = selectedOption.text.trim();
        if (optionText) {
          this.speechService.speak(optionText);
        }
      });

      // Handle keyboard navigation in select
      this.renderer.listen(element, 'keyup', (event: KeyboardEvent) => {
        if (!this.screenReaderEnabled) return;

        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
          const select = element as HTMLSelectElement;
          const selectedOption = select.options[select.selectedIndex];
          const optionText = selectedOption.text.trim();
          this.speechService.speak(optionText);
        }
      });
    }

    // Mark as processed
    this.renderer.setAttribute(element, 'data-a11y-processed', 'true');
  }

  private getAccessibleName(element: HTMLElement): string {
    let label = '';

    // Check for label
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName) && element.id) {
      const labelElement = this.document.querySelector(`label[for="${element.id}"]`);
      // Fix for line 161: Direct assignment from an optional chain
      label = labelElement?.textContent?.trim() ?? '';
    }

    // Check aria-label or title
    if (!label) {
      // Fix for line 176: Direct assignment without checking
      label = element.getAttribute('aria-label') ?? element.getAttribute('title') ?? '';
    }

    // Check visible text - Fix for line 196: Use optional chain
    if (!label) {
      label = element.textContent?.trim() ?? '';
    }

    return label;
  }

  private forceReflow(element: HTMLElement): void {
    // This reads the property but doesn't use the value
    const reflow = element.offsetWidth;
  }
}

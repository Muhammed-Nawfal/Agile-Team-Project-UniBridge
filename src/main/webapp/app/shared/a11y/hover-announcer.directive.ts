import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AccessibilityService } from 'app/core/Accessibility/accessibility.service';
import { SpeechService } from 'app/core/speech/speech.service';

@Directive({
  selector: '[jhiHoverAnnouncer]',
})
export class HoverAnnouncerDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private lastTarget: EventTarget | null = null;

  constructor(
    private hostEl: ElementRef<HTMLElement>,
    private a11y: AccessibilityService,
    private tts: SpeechService,
  ) {}

  ngOnInit(): void {
    fromEvent<MouseEvent>(this.hostEl.nativeElement, 'mouseover')
      .pipe(
        filter(() => this.a11y.isEnabled()),
        takeUntil(this.destroy$),
      )
      .subscribe(evt => {
        const tgt = evt.target as HTMLElement;

        // only announce once per element
        if (tgt === this.lastTarget) return;
        this.lastTarget = tgt;

        // never announce the host wrapper itself
        if (tgt === this.hostEl.nativeElement) return;

        // only interactive elements
        if (!tgt.matches('button, a, [role="button"], [role="link"], input, select, textarea, [tabindex]')) {
          return;
        }

        let label = '';

        // 1) if it's a form control with an ID, read its <label for="…">
        if (['INPUT', 'SELECT', 'TEXTAREA'].includes(tgt.tagName) && tgt.id) {
          const doc = this.hostEl.nativeElement.ownerDocument;
          const lbl = doc.querySelector(`label[for="${tgt.id}"]`);
          if (lbl) {
            label = (lbl.textContent ?? '').trim();
          }
        }

        // 2) fallback to aria-label or title
        if (!label) {
          label = tgt.getAttribute('aria-label') ?? tgt.getAttribute('title') ?? '';
        }

        // 3) lastly use visible text (e.g. button text)
        if (!label) {
          label = (tgt.innerText || '').trim();
        }

        if (label) {
          this.tts.speak(label);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

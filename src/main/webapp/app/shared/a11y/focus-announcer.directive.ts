import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AccessibilityService } from 'app/core/Accessibility/accessibility.service';
import { SpeechService } from 'app/core/speech/speech.service';

@Directive({ selector: '[jhiFocusAnnouncer]' })
export class FocusAnnouncerDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private hostEl: ElementRef<HTMLElement>,
    private a11y: AccessibilityService,
    private tts: SpeechService,
  ) {}

  ngOnInit(): void {
    fromEvent<FocusEvent>(this.hostEl.nativeElement, 'focusin')
      .pipe(
        filter(() => this.a11y.isEnabled()),
        takeUntil(this.destroy$),
      )
      .subscribe(evt => {
        const tgt = evt.target as HTMLElement;

        let label = '';

        // 1) If this is a form control with an ID, look for its <label for="…">
        if (['INPUT', 'SELECT', 'TEXTAREA'].includes(tgt.tagName) && tgt.id) {
          const lbl = this.hostEl.nativeElement.querySelector(`label[for="${tgt.id}"]`);
          if (lbl) {
            label = (lbl.textContent ?? '').trim();
          }
        }

        // 2) Fallback to aria-label or title
        if (!label) {
          label = tgt.getAttribute('aria-label') ?? tgt.getAttribute('title') ?? '';
        }

        // 3) Finally fallback to visible text (e.g. for buttons)
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

import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AccessibilityService } from 'app/core/Accessibility/accessibility.service';
import { SpeechService } from 'app/core/speech/speech.service';

@Directive({ selector: '[jhiOptionAnnouncer]' })
export class OptionAnnouncerDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private el: ElementRef<HTMLSelectElement>,
    private a11y: AccessibilityService,
    private tts: SpeechService,
  ) {}

  ngOnInit(): void {
    const select = this.el.nativeElement;

    // On change (e.g. click), announce the new option
    fromEvent(select, 'change')
      .pipe(
        filter(() => this.a11y.isEnabled()),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        const opt = select.options[select.selectedIndex].text.trim();
        if (opt) this.tts.speak(opt);
      });

    // On arrow‐key navigation inside the select
    fromEvent<KeyboardEvent>(select, 'keyup')
      .pipe(
        filter(evt => (evt.key === 'ArrowUp' || evt.key === 'ArrowDown') && this.a11y.isEnabled()),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        const opt = select.options[select.selectedIndex].text.trim();
        if (opt) this.tts.speak(opt);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

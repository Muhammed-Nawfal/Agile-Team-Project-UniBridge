// src/main/webapp/app/shared/a11y/a11y.module.ts
import { NgModule } from '@angular/core';
import { FocusAnnouncerDirective } from './focus-announcer.directive';
import { HoverAnnouncerDirective } from './hover-announcer.directive';
import { OptionAnnouncerDirective } from './option-announcer.directive';

@NgModule({
  declarations: [
    FocusAnnouncerDirective,
    HoverAnnouncerDirective,
    OptionAnnouncerDirective, // ← add here
  ],
  exports: [
    FocusAnnouncerDirective,
    HoverAnnouncerDirective,
    OptionAnnouncerDirective, // ← and here
  ],
})
export class A11yModule {}

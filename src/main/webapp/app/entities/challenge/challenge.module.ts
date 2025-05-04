// src/main/webapp/app/entities/challenge/challenge.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ChallengeListComponent } from './list/challenge.component'; // Update to match the actual file
import { ChallengeCardComponent } from './challenge-card.component'; // Fix the path to match the actual file location
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    FontAwesomeModule,
    RouterModule, // if you use [routerLink] anywhere
    // … any shared modules …
  ],
  declarations: [ChallengeListComponent, ChallengeCardComponent],
  exports: [ChallengeListComponent, ChallengeCardComponent], // Export both components
})
export class ChallengeModule {}

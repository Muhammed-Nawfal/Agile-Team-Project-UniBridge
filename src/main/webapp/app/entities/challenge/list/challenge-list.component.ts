// src/main/webapp/app/entities/challenge/list/challenge-list.component.ts
import { Component, OnInit } from '@angular/core';
import { IChallenge } from '../challenge.model';
import { ChallengeService } from '../service/challenge.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgFor, NgIf } from '@angular/common';
import { ChallengeCardComponent } from '../challenge-card.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'jhi-challenge-list',
  templateUrl: './challenge-list.component.html',
  styleUrls: ['./challenge-list.component.scss'],
  imports: [FontAwesomeModule, NgFor, NgIf, ChallengeCardComponent, RouterLink],
  standalone: true,
})
export class ChallengeListComponent implements OnInit {
  challenges: IChallenge[] = [];
  isLoading = false;

  constructor(private challengeService: ChallengeService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.challengeService.query().subscribe({
      next: res => {
        this.challenges = res.body ?? [];
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  trackId(_: number, item: IChallenge): number {
    return item.id;
  }

  onAccept(id: number): void {
    this.challengeService.accept(id).subscribe(() => this.load());
  }
  onReject(id: number): void {
    this.challengeService.reject(id).subscribe(() => this.load());
  }
  onComplete(id: number): void {
    this.challengeService.complete(id).subscribe(() => this.load());
  }
}

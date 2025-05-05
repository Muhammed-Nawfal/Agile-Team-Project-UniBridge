import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivityMatchComponent } from '../entities/activity-match/list/activity-match.component';

import SharedModule from 'app/shared/shared.module';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { AfterViewInit, AfterViewChecked } from '@angular/core';
import AOS from 'aos';

@Component({
  standalone: true,
  selector: 'jhi-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [SharedModule, RouterModule],
})
export default class HomeComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {
  account = signal<Account | null>(null);

  private readonly destroy$ = new Subject<void>();

  private readonly accountService = inject(AccountService);
  private readonly router = inject(Router);
  private aosInitialized = false;

  ngOnInit(): void {
    this.accountService
      .getAuthenticationState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(account => this.account.set(account));

    // Initialize AOS
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: false, // false = animation on every scroll
    });
  }

  onButtonClick(): void {
    if (!this.account()) {
      // If the user is not authenticated, redirect them to the login page
      this.router.navigate(['/login']);
    } else {
      // Otherwise, proceed with the button action (you can add logic here if needed)
    }
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.initAOS();
  }

  ngAfterViewChecked(): void {
    this.refreshAOS();
  }

  private initAOS(): void {
    if (!this.aosInitialized) {
      AOS.init({
        duration: 800,
        once: false, // allow animation every time on scroll
      });
      this.aosInitialized = true;
    }
  }

  private refreshAOS(): void {
    if (this.aosInitialized) {
      AOS.refreshHard(); // Force a full re-calculation
    }
  }
}

import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ViewChildren,
  ElementRef,
  QueryList,
  inject,
  signal,
  AfterViewChecked,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import AOS from 'aos';

declare const VANTA: any;
import * as THREE from 'three';

@Component({
  standalone: true,
  selector: 'jhi-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export default class HomeComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {
  @ViewChild('sliderContainer', { static: true }) sliderContainer!: ElementRef<HTMLDivElement>;
  @ViewChildren('slideEl') slideEls!: QueryList<ElementRef<HTMLDivElement>>;
  @ViewChild('vantaRef', { static: true }) vantaRef!: ElementRef<HTMLDivElement>;

  account = signal<Account | null>(null);
  slides = [
    { title: 'Create Profile', icon: 'fa-user-plus', desc: 'HIII' },
    { title: 'Set Preferences', icon: 'fa-sliders-h', desc: 'HOW ARE YOU?' },
    { title: 'Match Buddies', icon: 'fa-users', desc: 'HOWS TP?' },
    { title: 'Create & Join Activities', icon: 'fa-running', desc: 'DIE' },
    { title: 'Chat & Connect', icon: 'fa-comments', desc: 'DONT DIE' },
    { title: 'Book Event Spaces', icon: 'fa-calendar-check', desc: 'DONT USE THIS APP' },
    { title: 'Challenge Your Friends', icon: 'fa-trophy', desc: 'WASTE YOUR TIME' },
    { title: 'Rank other users', icon: 'fa-star', desc: 'BYEEEEE' },
  ];
  currentIndex = 0;
  currentTransform = 'translateX(0px)';

  private autoplaySub?: Subscription;
  private readonly accountService = inject(AccountService);
  private readonly router = inject(Router);
  private aosInitialized = false;
  private vantaEffect: any;

  ngOnInit(): void {
    this.accountService.getAuthenticationState().subscribe(acc => this.account.set(acc));
    this.autoplaySub = interval(5000)
      .pipe(map(() => this.next()))
      .subscribe();
  }

  ngAfterViewInit(): void {
    this.initAOS();

    this.vantaEffect = VANTA.FOG({
      el: this.vantaRef.nativeElement,
      THREE,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      highlightColor: 0xa64ac9,
      midtoneColor: 0xd472ff,
      lowlightColor: 0x3b1f63,
      baseColor: 0x000000,
      blurFactor: 0.5,
      speed: 1.5,
    });

    // midtoneColor: 0xffffff,
    //   lowlightColor: 0x4a3b8b,
    //   baseColor: 0x000000,

    setTimeout(() => this.updateTransform(), 0);
  }

  ngOnDestroy(): void {
    this.vantaEffect?.destroy();
    this.autoplaySub?.unsubscribe();
  }

  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.updateTransform();
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    this.updateTransform();
  }

  goTo(idx: number): void {
    this.currentIndex = idx;
    this.updateTransform();
  }

  onButtonClick(): void {
    void this.router.navigate(['/login']);
  }

  ngAfterViewChecked(): void {
    this.refreshAOS();
  }

  private updateTransform(): void {
    const container = this.sliderContainer.nativeElement;
    const slides = this.slideEls.toArray().map(el => el.nativeElement);
    const active = slides[this.currentIndex];
    // if (!active) return;

    const containerWidth = container.clientWidth;
    const slideWidth = active.clientWidth;
    const slideOffset = active.offsetLeft;

    // calculate pixel shift so that active slide centers
    const offsetX = containerWidth / 2 - slideWidth / 2 - slideOffset;
    this.currentTransform = `translateX(${offsetX}px)`;
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

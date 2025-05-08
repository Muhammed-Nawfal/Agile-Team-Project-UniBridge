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
import { LoginService } from 'app/login/login.service';

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
    { title: 'Create Profile', icon: 'fa-user-plus', desc: 'Set up your student profile to start matching and connecting.' },
    { title: 'Set Preferences', icon: 'fa-sliders-h', desc: 'Tell us what you’re into – sports, study, societies, and more.' },
    { title: 'Match Buddies', icon: 'fa-users', desc: 'Find students with similar interests to hang out or work with.' },
    { title: 'Create & Join Activities', icon: 'fa-running', desc: 'Organize or join events like gym sessions, study groups, or matches.' },
    { title: 'Chat & Connect', icon: 'fa-comments', desc: 'Message matched users and make new friends instantly.' },
    { title: 'Book Event Spaces', icon: 'fa-calendar-check', desc: 'Reserve rooms, pitches, or spaces easily for your activities.' },
    { title: 'Challenge Your Friends', icon: 'fa-trophy', desc: 'Compete with friends in challenges and level up together.' },
    { title: 'Rank Other Users', icon: 'fa-star', desc: 'Give and receive feedback to build your Unibridge reputation.' },
  ];
  currentIndex = 0;
  currentTransform = 'translateX(0px)';
  private autoplaySub?: Subscription;
  private readonly accountService = inject(AccountService);
  private readonly router = inject(Router);
  private aosInitialized = false;
  private vantaEffect: any;
  private readonly loginService = inject(LoginService);

  ngOnInit(): void {
    this.accountService.getAuthenticationState().subscribe(acc => this.account.set(acc));
    this.autoplaySub = interval(5000)
      .pipe(map(() => this.next()))
      .subscribe();
  }

  ngAfterViewInit(): void {
    this.initAOS();

    // this.vantaEffect = VANTA.FOG({
    //   el: this.vantaRef.nativeElement,
    //   THREE,
    //   mouseControls: true,
    //   touchControls: true,
    //   gyroControls: false,
    //   highlightColor: 0xa64ac9,
    //   midtoneColor: 0xd472ff,
    //   lowlightColor: 0x3b1f63,
    //   baseColor: 0x000000,
    //   blurFactor: 0.5,
    //   speed: 1.5,
    // });

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

  get isLoggedIn(): boolean {
    return this.account() !== null;
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  logout(): void {
    this.loginService.logout();
    this.router.navigate(['/']);
  }

  onButtonClick(): void {
    this.router.navigate(['/login']);
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

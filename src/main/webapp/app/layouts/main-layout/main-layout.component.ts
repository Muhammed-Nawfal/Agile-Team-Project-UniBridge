import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import NavbarComponent from '../navbar/navbar.component';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { IProfile } from 'app/entities/profile/profile.model';

@Component({
  selector: 'jhi-app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent implements OnInit {
  profile: IProfile | null = null;

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    this.profileService.findMyProfile().subscribe(res => {
      this.profile = res.body ?? null;
    });
  }
}

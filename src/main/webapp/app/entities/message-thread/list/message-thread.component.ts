import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { MessageThreadService } from 'app/entities/message-thread/service/message-thread.service';
import { AccountService } from 'app/core/auth/account.service';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { IMessageThread } from '../message-thread.model';

@Component({
  standalone: true,
  selector: 'jhi-message-thread',
  templateUrl: './message-thread.component.html',
  imports: [CommonModule, RouterModule],
})
export class MessageThreadComponent implements OnInit {
  threads: IMessageThread[] = [];
  meId!: number;

  private threadService = inject(MessageThreadService);
  private accountService = inject(AccountService);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  ngOnInit(): void {
    this.accountService.identity().subscribe(acc => {
      this.profileService.query({ 'userLogin.equals': acc!.login }).subscribe(resp => {
        this.meId = resp.body![0].id!;
        this.load();
      });
    });
  }

  load(): void {
    this.threadService
      .query({ eagerload: true, sort: 'id,asc' }) // ← here
      .subscribe(res => {
        this.threads = res.body ?? [];
      });
  }

  open(th: IMessageThread): void {
    this.router.navigate(['/chat', 'thread', th.id]);
  }

  getName(th: IMessageThread): string {
    if (th.isGroup) return th.name ?? 'Group';
    const other = th.participants?.find(p => p.id !== this.meId);
    return other ? `${other.firstName} ${other.lastName}` : 'Unknown';
  }
}

import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MessageThreadService } from 'app/entities/message-thread/service/message-thread.service';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { IMessageThread } from '../message-thread.model';
import { IProfile } from 'app/entities/profile/profile.model';
import { ChatService } from 'app/entities/chat/service/chat.service';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Subject, takeUntil } from 'rxjs';

dayjs.extend(relativeTime);

@Component({
  standalone: true,
  selector: 'jhi-message-thread',
  templateUrl: './message-thread.component.html',
  styleUrls: ['./message-thread.component.scss'],
  imports: [CommonModule, RouterModule],
})
export class MessageThreadComponent implements OnInit, OnDestroy {
  threads: IMessageThread[] = [];
  meId!: number;
  loading = false;
  error: string | null = null;
  threadPreviews = new Map<number, { lastMessage: string; unreadCount: number }>();
  private destroy$ = new Subject<void>();

  private threadService = inject(MessageThreadService);
  private profileService = inject(ProfileService);
  private chatService = inject(ChatService);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadIdentityAndThreads();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadThreads(): void {
    this.loading = true;
    this.error = null;

    this.threadService
      .query({
        'participants.id.greaterThan': '0',
        sort: 'updatedOn,desc',
        eagerload: true,
      })
      .subscribe({
        next: res => {
          this.threads = res.body ?? [];
          this.loadThreadPreviews();
          this.loading = false;
        },
        error: err => {
          this.error = 'Failed to load conversations';
          this.loading = false;
          console.error(err);
        },
      });
  }

  loadThreadPreviews(): void {
    // Clear existing previews
    this.threadPreviews.clear();

    // For each thread, load the last message and unread count
    this.threads.forEach(thread => {
      if (!thread.id) return;

      // Get the last message for this thread
      this.chatService.getMessagesByThread(thread.id).subscribe({
        next: res => {
          const messages = res.body ?? [];
          const lastMessage = messages.length > 0 ? (messages[messages.length - 1].message ?? '') : '';

          // Count unread messages
          const unreadCount = messages.filter(msg => msg.receiver?.id === this.meId && msg.status !== 'READ').length;

          // Store in our preview map
          this.threadPreviews.set(thread.id, {
            lastMessage,
            unreadCount,
          });
        },
        error(err) {
          console.error(`Failed to load messages for thread ${thread.id}`, err);
        },
      });
    });
  }

  getName(th: IMessageThread): string {
    if (!th.participants || th.participants.length === 0) {
      return 'No participants';
    }

    if (th.isGroup) {
      return th.name ?? `Group (${th.participants.length} members)`;
    }

    const others = th.participants.filter(p => p.id !== this.meId);

    if (others.length === 0) {
      return 'Personal Notes';
    }

    const names = others.map(p => {
      const name = `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim();
      return (name || p.login) ?? 'Unnamed User';
    });

    return names.join(', ');
  }

  getInitial(th: IMessageThread): string {
    if (th.isGroup) {
      return 'G';
    }

    const other = th.participants?.find(p => p.id !== this.meId);
    if (!other) {
      return '?';
    }

    if (other.firstName) {
      return other.firstName.charAt(0).toUpperCase();
    }
    if (other.login) {
      return other.login.charAt(0).toUpperCase();
    }
    return '?';
  }

  formatRelativeTime(date: dayjs.Dayjs | null | undefined): string {
    if (!date || !dayjs.isDayjs(date)) return '--';

    const now = dayjs();
    const diff = now.diff(date, 'day');

    if (diff === 0) {
      return date.format('h:mm A');
    } else if (diff === 1) {
      return 'Yesterday';
    } else if (diff < 7) {
      return date.format('ddd');
    } else if (now.year() === date.year()) {
      return date.format('MMM D');
    } else {
      return date.format('MMM D, YYYY');
    }
  }

  getLastMessagePreview(thread: IMessageThread): string {
    if (!thread.id || !this.threadPreviews.has(thread.id)) {
      return 'Loading...';
    }

    const preview = this.threadPreviews.get(thread.id)!.lastMessage;
    if (!preview) {
      return 'No messages yet';
    }

    return preview.length > 40 ? preview.substring(0, 37) + '...' : preview;
  }

  hasUnreadMessages(thread: IMessageThread): boolean {
    if (!thread.id || !this.threadPreviews.has(thread.id)) {
      return false;
    }

    return this.threadPreviews.get(thread.id)!.unreadCount > 0;
  }

  formatDate(date: dayjs.Dayjs | null | undefined): string {
    if (!date || !dayjs.isDayjs(date)) return '--';
    return date.format('MMM D, YYYY h:mm A');
  }

  open(th: IMessageThread): void {
    this.router.navigate(['/chat', 'thread', th.id]);
  }

  createNewConversation(): void {
    this.router.navigate(['/message-thread/new']);
  }

  protected loadIdentityAndThreads(): void {
    this.loading = true;
    this.error = null;

    this.profileService.findMyProfile().subscribe({
      next: profileRes => {
        const myProfile = profileRes.body;
        if (!myProfile?.id) {
          this.error = 'Please log in to view conversations';
          this.loading = false;
          this.router.navigate(['/login']);
          return;
        }

        this.meId = myProfile.id;
        this.loadThreads();
      },
      error: err => {
        this.error = 'Failed to load profile';
        this.loading = false;
        console.error(err);
        this.router.navigate(['/login']);
      },
    });
  }
}

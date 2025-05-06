import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MessageThreadService } from 'app/entities/message-thread/service/message-thread.service';
import { AccountService } from 'app/core/auth/account.service';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { IMessageThread } from '../message-thread.model';
import { IProfile } from 'app/entities/profile/profile.model';
import { ChatService } from 'app/entities/chat/service/chat.service';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

@Component({
  standalone: true,
  selector: 'jhi-message-thread',
  templateUrl: './message-thread.component.html',
  styleUrls: ['./message-thread.component.scss'],
  imports: [CommonModule, RouterModule],
})
export class MessageThreadComponent implements OnInit {
  threads: IMessageThread[] = [];
  meId!: number;
  loading = false;
  error: string | null = null;
  threadPreviews = new Map<number, { lastMessage: string; unreadCount: number }>();

  private threadService = inject(MessageThreadService);
  private accountService = inject(AccountService);
  private profileService = inject(ProfileService);
  private chatService = inject(ChatService);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadIdentityAndThreads();
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
    // Ensure that participants exists and is not empty
    if (!th.participants || th.participants.length === 0) {
      return 'No participants'; // Return 'No participants' if empty or undefined
    }

    if (th.isGroup) {
      return th.name ?? `Group (${th.participants.length} members)`;
    }

    // Find the other participant(s)
    const others = th.participants.filter(p => p.id !== this.meId);

    if (others.length === 0) {
      // Only current user in the conversation
      return 'Personal Notes';
    }

    // Map other participants to names, filtering out any empty names
    const names = others.map(p => {
      const name = `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim();
      return name || 'Unnamed User';
    });

    return names.join(', ');
  }

  getInitial(th: IMessageThread): string {
    if (th.isGroup) {
      return 'G'; // For group chats
    }

    const other = th.participants?.find(p => p.id !== this.meId);
    if (!other?.firstName) {
      return '?';
    }

    return other.firstName.charAt(0).toUpperCase();
  }

  formatRelativeTime(date: dayjs.Dayjs | null | undefined): string {
    if (!date || !dayjs.isDayjs(date)) return '--';

    const now = dayjs();
    const diff = now.diff(date, 'day');

    if (diff === 0) {
      // Today - show time only
      return date.format('h:mm A');
    } else if (diff === 1) {
      // Yesterday
      return 'Yesterday';
    } else if (diff < 7) {
      // Within a week - show day name
      return date.format('ddd');
    } else if (now.year() === date.year()) {
      // Same year - show month and day
      return date.format('MMM D');
    } else {
      // Different year - show month, day and year
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

    // Truncate to reasonable length
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
    // Navigate to create new conversation page
    // You might need to create this page or use a modal
    this.router.navigate(['/message-thread/new']);
  }

  protected loadIdentityAndThreads(): void {
    this.loading = true;
    this.accountService.identity().subscribe({
      next: acc => {
        if (!acc) {
          this.error = 'Please log in to view conversations';
          this.loading = false;
          return;
        }

        this.profileService.query({ 'userLogin.equals': acc.login }).subscribe({
          next: profileRes => {
            if (profileRes.body && profileRes.body.length > 0) {
              this.meId = profileRes.body[0].id!;
              this.loadThreads();
            } else {
              this.error = 'Profile not found';
              this.loading = false;
            }
          },
          error: err => {
            this.error = 'Failed to load profile';
            this.loading = false;
            console.error(err);
          },
        });
      },
      error: err => {
        this.error = 'Authentication error';
        this.loading = false;
        console.error(err);
      },
    });
  }
}

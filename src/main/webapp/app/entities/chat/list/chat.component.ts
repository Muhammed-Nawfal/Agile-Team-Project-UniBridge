import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Subject, interval, switchMap, takeUntil, of } from 'rxjs';
import SharedModule from 'app/shared/shared.module'; // Add this for FontAwesome

import dayjs from 'dayjs/esm';

import { MessageType } from 'app/entities/enumerations/message-type.model';
import { MessageStatus } from 'app/entities/enumerations/message-status.model';
import { IChat, NewChat } from '../chat.model';
import { ChatService } from '../service/chat.service';
import { MessageThreadService } from 'app/entities/message-thread/service/message-thread.service';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChatDeleteDialogComponent } from '../delete/chat-delete-dialog.component';

@Component({
  standalone: true,
  selector: 'jhi-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, SharedModule],
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('messageContainer', { static: true }) messageContainer!: ElementRef<HTMLElement>;

  messageForm: FormGroup;
  editForm: FormGroup;
  chats: IChat[] = [];
  threadId!: number;
  meId!: number;
  otherId!: number;
  editingChatId: number | null = null;
  openMenuId: number | null = null;
  isSending = false;

  // Store profile information to improve name display
  userProfiles = new Map<number, { firstName: string; lastName: string }>();

  protected router = inject(Router);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  private chatService = inject(ChatService);
  private threadService = inject(MessageThreadService);
  private profileService = inject(ProfileService);
  private modalService = inject(NgbModal);

  private profanityList: string[] = [
    'fuck',
    'shit',
    'asshole',
    'bitch',
    'bastard',
    'damn',
    'cunt',
    'dick',
    'twat',
    'piss',
    'cock',
    'pussy',
    'whore',
    'slut',
    'ass',
    'fck',
    'fuk',
    'sh1t',
    'sh!t',
    'a$$',
    'b1tch',
    'b!tch',
    'd1ck',
    'd!ck',
    'f u c k',
    's h i t',
    'a s s',
    'blowjob',
    'handjob',
    'cum',
    'semen',
    'clit',
    'vagina',
    'penis',
  ];

  private profanityRegexes: RegExp[] = [];

  constructor() {
    this.messageForm = this.fb.group({ message: ['', [Validators.required]] });
    this.editForm = this.fb.group({ message: ['', [Validators.required]] });

    // Initialize regex patterns for profanity filtering
    this.profanityList.forEach(word => {
      const pattern = word
        .replace(/a/gi, '[a@4]')
        .replace(/e/gi, '[e3]')
        .replace(/i/gi, '[i1!]')
        .replace(/o/gi, '[o0]')
        .replace(/s/gi, '[s$5]')
        .replace(/t/gi, '[t7]');
      this.profanityRegexes.push(new RegExp(`\\b${pattern}\\b`, 'gi'));
    });
  }

  ngOnInit(): void {
    // Get current user's profile - no need for takeUntil here as it's a one-time call
    this.profileService.findMyProfile().subscribe({
      next: myProfileRes => {
        const myProfile = myProfileRes.body;
        if (!myProfile?.id) return;

        this.meId = myProfile.id;
        this.userProfiles.set(myProfile.id, {
          firstName: myProfile.firstName ?? '',
          lastName: myProfile.lastName ?? '',
        });

        // Route params subscription needs takeUntil for cleanup
        this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
          const id = Number(params['threadId']);
          if (!id) {
            this.router.navigate(['/message-thread']);
            return;
          }

          this.threadId = id;
          this.loadThreadDetails();
          this.loadMessages();
          this.startPolling();
        });
      },
      error: () => {
        this.router.navigate(['/login']);
      },
    });
  }

  sendMessage(): void {
    if (this.messageForm.invalid || this.isSending) return;

    const raw = this.messageForm.value.message as string;
    if (!raw || raw.trim() === '') return;

    this.isSending = true;
    const filtered = this.filterProfanity(raw);

    const now = dayjs();
    const dto: NewChat = {
      id: null,
      message: filtered,
      type: MessageType.TEXT,
      status: MessageStatus.SENT,
      isDeleted: false,
      timestamp: now,
      createdOn: now,
      updatedOn: null,
      media: null,
      mediaContentType: null,
      sender: { id: this.meId },
      receiver: { id: this.otherId },
      thread: null,
      messageThread: null,
    };

    this.chatService.sendMessage(this.threadId, dto).subscribe({
      next: () => {
        this.messageForm.reset();
        this.loadMessages();
        setTimeout(() => {
          this.isSending = false;
        }, 500);
      },
      error: err => {
        alert(`Failed to send message.\nStatus: ${err.status} ${err.statusText}`);
        this.isSending = false;
      },
    });
  }

  loadMessages(): void {
    this.chatService.getMessagesByThread(this.threadId).subscribe(res => {
      this.chats = res.body ?? [];

      // Cache user profile information
      this.cacheUserProfiles();

      this.scrollToBottom();
      this.chatService.markMessagesAsRead(this.threadId).subscribe();
    });
  }

  // Cache all profiles involved in current conversation

  getOtherUserName(): string {
    if (this.otherId && this.userProfiles.has(this.otherId)) {
      const profile = this.userProfiles.get(this.otherId)!;
      const name = `${profile.firstName} ${profile.lastName}`.trim();
      return name || 'Unknown'; // Added login as fallback
    }
    return 'Unknown';
  }

  getSenderName(chat: IChat): string {
    const senderId = chat.sender?.id;
    if (!senderId) return 'Unknown';

    // Check if we know this profile
    if (this.userProfiles.has(senderId)) {
      const profile = this.userProfiles.get(senderId)!;
      const name = `${profile.firstName} ${profile.lastName}`.trim();
      return name || (senderId === this.meId ? 'Me' : 'Unknown');
    }

    // Check if it's the current user
    if (senderId === this.meId) {
      return 'Me';
    }

    // Use sender info from the chat
    if (chat.sender?.firstName || chat.sender?.lastName) {
      return `${chat.sender.firstName ?? ''} ${chat.sender.lastName ?? ''}`.trim();
    }

    return 'Unknown';
  }

  getContactInitial(): string {
    if (this.otherId && this.userProfiles.has(this.otherId)) {
      const profile = this.userProfiles.get(this.otherId)!;
      if (profile.firstName) {
        return profile.firstName.charAt(0).toUpperCase();
      }
    }

    const contact = this.chats.find(chat => chat.receiver?.id === this.otherId || chat.sender?.id === this.otherId);

    if (contact?.receiver?.firstName) {
      return contact.receiver.firstName.charAt(0).toUpperCase();
    }

    if (contact?.sender?.firstName) {
      return contact.sender.firstName.charAt(0).toUpperCase();
    }

    return 'U';
  }

  isOwn(chat: IChat): boolean {
    return chat.sender?.id === this.meId;
  }

  startEdit(chat: IChat): void {
    this.editingChatId = chat.id!;
    this.editForm.setValue({ message: chat.message ?? '' });
    this.openMenuId = null;
  }

  cancelEdit(): void {
    this.editingChatId = null;
    this.editForm.reset();
  }

  saveEdit(): void {
    if (this.editForm.invalid || this.editingChatId === null) return;

    const newMsg = this.editForm.value.message as string;
    const original = this.chats.find(c => c.id === this.editingChatId)!;

    if (!this.canEditMessage(original)) {
      alert('You can no longer edit this message. It has been over 2 minutes.');
      this.cancelEdit();
      return;
    }

    const updated: IChat = {
      ...original,
      message: this.filterProfanity(newMsg),
      updatedOn: dayjs(),
    };
    this.chatService.update(updated).subscribe({
      next: () => {
        this.editingChatId = null;
        this.loadMessages();
      },
      error() {
        alert('Failed to update message.');
      },
    });
  }

  canEditMessage(chat: IChat): boolean {
    const now = dayjs();
    const messageTime = dayjs(chat.timestamp);
    const diffMinutes = now.diff(messageTime, 'minute');
    return diffMinutes < 2;
  }

  deleteChat(chat: IChat): void {
    const modalRef = this.modalService.open(ChatDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.chat = chat;
    modalRef.closed.subscribe(result => {
      if (result === 'ITEM_DELETED_EVENT') {
        this.loadMessages();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByFn(index: number, item: IChat): number {
    return item.id || index;
  }

  private cacheUserProfiles(): void {
    const userIds = new Set<number>();
    this.chats.forEach(chat => {
      if (chat.sender?.id) userIds.add(chat.sender.id);
      if (chat.receiver?.id) userIds.add(chat.receiver.id);
    });

    userIds.forEach(id => {
      if (!this.userProfiles.has(id)) {
        this.profileService
          .find(id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: profileRes => {
              const profile = profileRes.body;
              if (profile?.id) {
                this.userProfiles.set(profile.id, {
                  firstName: profile.firstName ?? '',
                  lastName: profile.lastName ?? '',
                });
              }
            },
            error: () => {
              // Set default values if profile fetch fails
              this.userProfiles.set(id, {
                firstName: 'Unknown',
                lastName: 'User',
              });
            },
          });
      }
    });
  }

  private loadThreadDetails(): void {
    this.threadService
      .query({ 'id.equals': this.threadId, eagerload: true })
      .pipe(
        takeUntil(this.destroy$),
        switchMap(res => {
          const thread = res.body?.[0];
          if (!thread) {
            this.router.navigate(['/message-thread']);
            return of(null);
          }

          // Find other participants and fetch their profiles
          const participants = thread.participants ?? [];
          const participantRequests = participants
            .filter(p => p.id && p.id !== this.meId)
            .map(p => {
              if (!this.otherId && p.id) {
                this.otherId = p.id;
              }
              return this.profileService.find(p.id);
            });

          return participantRequests.length ? of(participantRequests) : of(null);
        }),
      )
      .subscribe(requests => {
        if (requests) {
          requests.forEach(request => {
            request.subscribe(profileRes => {
              const profile = profileRes.body;
              if (profile?.id) {
                this.userProfiles.set(profile.id, {
                  firstName: profile.firstName ?? '',
                  lastName: profile.lastName ?? '',
                });
              }
            });
          });
        }
      });
  }

  private startPolling(): void {
    interval(5000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.chatService.getMessagesByThread(this.threadId)),
      )
      .subscribe(res => {
        const newMessages = res.body ?? [];
        const oldCount = this.chats.length;

        // Only update if there are changes (new messages or status changes)
        if (JSON.stringify(newMessages) !== JSON.stringify(this.chats)) {
          // Save scroll position
          const scrollContainer = this.messageContainer.nativeElement;
          const wasAtBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop <= scrollContainer.clientHeight + 50;

          // Update chat array
          this.chats = newMessages;

          // Update cached profiles if message count changed
          if (this.chats.length > oldCount) {
            this.cacheUserProfiles();
          }

          // Only scroll to bottom if user was already at bottom
          if (wasAtBottom) {
            this.scrollToBottom();
          }
        }

        // Mark as read regardless of updates
        this.chatService.markMessagesAsRead(this.threadId).subscribe();
      });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.messageContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }, 100);
  }

  private filterProfanity(text: string): string {
    return text
      .split(/(\b|\s+)/)
      .map(word => {
        let filtered = word;
        this.profanityRegexes.forEach(regex => {
          filtered = filtered.replace(regex, match => '*'.repeat(match.length));
        });
        return filtered;
      })
      .join('');
  }
}

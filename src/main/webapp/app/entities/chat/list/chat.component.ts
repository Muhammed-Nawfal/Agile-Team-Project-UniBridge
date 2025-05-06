import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Subject, interval, switchMap, takeUntil, of } from 'rxjs';

import dayjs from 'dayjs/esm';

import { MessageType } from 'app/entities/enumerations/message-type.model';
import { MessageStatus } from 'app/entities/enumerations/message-status.model';
import { IChat, NewChat } from '../chat.model';
import { ChatService } from '../service/chat.service';
import { MessageThreadService } from 'app/entities/message-thread/service/message-thread.service';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { AccountService } from 'app/core/auth/account.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChatDeleteDialogComponent } from '../delete/chat-delete-dialog.component';

@Component({
  standalone: true,
  selector: 'jhi-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
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
  private accountService = inject(AccountService);
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
    this.accountService.identity().subscribe();

    this.accountService
      .getAuthenticationState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(account => {
        // Reset values on account change to ensure clean state
        this.meId = 0;
        this.otherId = 0;
        this.chats = [];
        this.userProfiles.clear(); // Clear cached profiles

        if (account?.login) {
          this.profileService.query({ 'userLogin.equals': account.login }).subscribe(profileResp => {
            const prof = profileResp.body?.[0];
            if (!prof) return;

            this.meId = prof.id!;

            // Cache current user's profile
            if (prof.firstName || prof.lastName) {
              this.userProfiles.set(prof.id, {
                firstName: prof.firstName ?? '',
                lastName: prof.lastName ?? '',
              });
            }

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
          });
        }
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
      return `${profile.firstName} ${profile.lastName}`.trim() || 'Unknown';
    }

    const contact = this.chats.find(chat => chat.receiver?.id === this.otherId || chat.sender?.id === this.otherId);
    if (contact) {
      const receiverName =
        contact.receiver?.firstName && contact.receiver.lastName ? contact.receiver.firstName + ' ' + contact.receiver.lastName : null;
      const senderName =
        contact.sender?.firstName && contact.sender.lastName ? contact.sender.firstName + ' ' + contact.sender.lastName : null;
      return receiverName ?? senderName ?? 'Unknown';
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
    // Extract unique user IDs from chats
    const userIds = new Set<number>();
    this.chats.forEach(chat => {
      if (chat.sender?.id) userIds.add(chat.sender.id);
      if (chat.receiver?.id) userIds.add(chat.receiver.id);
    });

    // Cache any profiles not already cached
    userIds.forEach(id => {
      if (!this.userProfiles.has(id) && id !== this.meId && id !== this.otherId) {
        const profileInfo = this.chats.find(
          c =>
            (c.sender?.id === id && (c.sender.firstName ?? c.sender.lastName)) ??
            (c.receiver?.id === id && (c.receiver.firstName ?? c.receiver.lastName)),
        );

        if (profileInfo) {
          if (profileInfo.sender?.id === id) {
            this.userProfiles.set(id, {
              firstName: profileInfo.sender.firstName ?? '',
              lastName: profileInfo.sender.lastName ?? '',
            });
          } else if (profileInfo.receiver?.id === id) {
            this.userProfiles.set(id, {
              firstName: profileInfo.receiver.firstName ?? '',
              lastName: profileInfo.receiver.lastName ?? '',
            });
          }
        }
      }
    });
  }

  private loadThreadDetails(): void {
    this.threadService
      .query({ 'id.equals': this.threadId, eagerload: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        const thread = res.body?.[0];
        if (!thread) {
          this.router.navigate(['/message-thread']);
          return;
        }

        if (!this.meId) return;

        // Find other participants and store their profile info
        const participants = thread.participants ?? [];
        participants.forEach(participant => {
          if (participant.id && participant.id !== this.meId) {
            // Set as other user if not already set
            if (!this.otherId) {
              this.otherId = participant.id;
            }

            // Cache profile info
            if (participant.firstName || participant.lastName) {
              this.userProfiles.set(participant.id, {
                firstName: participant.firstName ?? '',
                lastName: participant.lastName ?? '',
              });
            }
          }
        });
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

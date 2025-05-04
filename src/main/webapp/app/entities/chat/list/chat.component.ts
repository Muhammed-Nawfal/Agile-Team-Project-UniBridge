// src/main/webapp/app/entities/chat/list/chat.component.ts

import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, interval, switchMap, takeUntil } from 'rxjs';

import dayjs from 'dayjs/esm';

import { MessageType } from 'app/entities/enumerations/message-type.model';
import { MessageStatus } from 'app/entities/enumerations/message-status.model';
import { IChat, NewChat } from '../chat.model';
import { ChatService } from '../service/chat.service';
import { MessageThreadService } from 'app/entities/message-thread/service/message-thread.service';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  standalone: true,
  selector: 'jhi-chat',
  templateUrl: './chat.component.html',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('messageContainer', { static: true }) messageContainer!: ElementRef<HTMLElement>;

  messageForm: FormGroup;
  chats: IChat[] = [];
  threadId!: number;
  meId!: number;
  otherId!: number;
  protected router = inject(Router);

  private destroy$ = new Subject<void>();
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private chatService = inject(ChatService);
  private threadService = inject(MessageThreadService);
  private accountService = inject(AccountService);
  private profileService = inject(ProfileService);

  constructor() {
    this.messageForm = this.fb.group({
      message: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    // 1) resolve current user profile
    this.accountService
      .identity()
      .pipe(
        switchMap(acc => this.profileService.query({ 'userLogin.equals': acc!.login })),
        takeUntil(this.destroy$),
      )
      .subscribe(resp => {
        this.meId = resp.body![0].id!;
        // 2) read threadId from route
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

  send(): void {
    if (this.messageForm.invalid) {
      return;
    }

    const now = dayjs();
    const dto: NewChat = {
      id: null,
      message: this.messageForm.value.message,
      type: MessageType.TEXT,
      status: MessageStatus.SENT,
      isDeleted: false,
      timestamp: now,
      createdOn: now,
      updatedOn: null,
      media: null,
      mediaContentType: null,
      sender: null,
      receiver: null,
      thread: null,
      messageThread: null,
    };

    this.chatService.sendMessage(this.threadId, dto).subscribe({
      next: () => {
        this.messageForm.reset();
        this.loadMessages();
      },
      error(err) {
        // 🎯 DEBUGGING: it will log status, headers, and the full error payload
        console.error('❌ sendMessage failed:', err);
        alert(`Failed to send message.\n` + `Status: ${err.status} ${err.statusText}\n` + `Response body: ${JSON.stringify(err.error)}`);
      },
    });
  }

  loadMessages(): void {
    this.chatService.getMessagesByThread(this.threadId).subscribe(res => {
      this.chats = res.body ?? [];
      this.scrollToBottom();
    });
  }

  isOwn(chat: IChat): boolean {
    return chat.sender?.id === this.meId;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadThreadDetails(): void {
    // Use the /message-threads?filter endpoint since GET /message-threads/{id} isn't exposed
    this.threadService
      .query({ 'id.equals': this.threadId, eagerload: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        const thread = res.body?.[0];
        if (!thread) {
          this.router.navigate(['/message-thread']);
          return;
        }
        // In a 1-on-1 chat, pick the “other” participant
        const others = (thread.participants ?? []).filter(p => p.id !== this.meId);
        this.otherId = others[0]?.id;
      });
  }

  private startPolling(): void {
    interval(5000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.chatService.getMessagesByThread(this.threadId)),
      )
      .subscribe(res => {
        this.chats = res.body ?? [];
        this.scrollToBottom();
      });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.messageContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }, 100);
  }
}

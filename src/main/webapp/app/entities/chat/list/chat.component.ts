import { Component, NgZone, OnInit, inject, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, Subscription, interval, switchMap, takeUntil, Subject, take } from 'rxjs';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import SharedModule from 'app/shared/shared.module';
import { DurationPipe, FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';
import { DataUtils } from 'app/core/util/data-util.service';
import { IChat, NewChat } from '../chat.model';
import { ChatService, EntityArrayResponseType } from '../service/chat.service';
import { AccountService } from 'app/core/auth/account.service';
import { ProfileService, EntityArrayResponseType as ProfileResponseType } from 'app/entities/profile/service/profile.service';
import { MessageType } from 'app/entities/enumerations/message-type.model';

@Component({
  standalone: true,
  selector: 'jhi-chat',
  templateUrl: './chat.component.html',
  imports: [RouterModule, ReactiveFormsModule, SharedModule, DurationPipe, FormatMediumDatetimePipe, FormatMediumDatePipe],
})
export class ChatComponent implements OnInit, OnDestroy {
  chats?: IChat[];
  isLoading = false;
  threadId?: number;
  currentUserProfileId?: number;
  messageForm: FormGroup;

  public readonly router = inject(Router);
  protected readonly chatService = inject(ChatService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected dataUtils = inject(DataUtils);
  protected ngZone = inject(NgZone);
  protected accountService = inject(AccountService);
  protected profileService = inject(ProfileService);
  protected fb = inject(FormBuilder);
  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  private destroy$ = new Subject<void>();

  constructor() {
    this.messageForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  ngOnInit(): void {
    // 1) First resolve my profile ID
    this.accountService
      .identity()
      .pipe(
        take(1),
        switchMap(account => this.profileService.query({ 'userLogin.equals': account?.login }).pipe(take(1))),
      )
      .subscribe(resp => {
        const me = resp.body?.[0];
        if (me?.id) {
          this.currentUserProfileId = me.id;

          // 2) Now that we have my profile ID, listen to query params
          this.activatedRoute.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
            const threadIdParam = params['threadId'];
            if (threadIdParam) {
              this.threadId = parseInt(threadIdParam, 10);
              this.load();
              // Set up polling for new messages
              this.startMessagePolling();
            }
          });
        } else {
          console.error('Could not find my profile');
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  startMessagePolling(): void {
    interval(5000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.loadMessages()),
      )
      .subscribe();
  }

  load(): void {
    if (this.threadId) {
      this.loadMessages().subscribe({
        next: (res: EntityArrayResponseType) => {
          this.onResponseSuccess(res);
          this.scrollToBottom();
        },
      });
    }
  }

  loadMessages(): Observable<EntityArrayResponseType> {
    if (!this.threadId) {
      throw new Error('Thread ID is required');
    }
    this.isLoading = true;
    return this.chatService.getMessagesByThread(this.threadId);
  }

  sendMessage(): void {
    if (this.messageForm.valid && this.threadId) {
      const newChat: NewChat = {
        id: null,
        message: this.messageForm.get('message')?.value,
        type: MessageType.TEXT,
        isDeleted: false,
        timestamp: null,
        status: null,
        media: null,
        mediaContentType: null,
        createdOn: null,
        updatedOn: null,
        thread: null,
        sender: null,
        receiver: null,
        messageThread: null,
      };

      this.chatService.sendMessage(this.threadId, newChat).subscribe({
        next: () => {
          this.messageForm.reset();
          this.load();
        },
        error(error) {
          console.error('Error sending message:', error);
        },
      });
    }
  }

  isOwnMessage(chat: IChat): boolean {
    return chat.sender?.id === this.currentUserProfileId;
  }

  scrollToBottom(): void {
    try {
      setTimeout(() => {
        if (this.messageContainer.nativeElement) {
          this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
        }
      }, 100);
    } catch (err) {
      /* empty */
    }
  }

  goBack(): void {
    this.router.navigate(['/message-thread']);
  }

  protected onResponseSuccess(response: EntityArrayResponseType): void {
    this.chats = response.body ?? [];
    this.isLoading = false;
  }
}

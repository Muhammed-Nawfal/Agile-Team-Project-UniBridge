import { Component, ElementRef, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AlertError } from 'app/shared/alert/alert-error.model';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { IMessageThread } from 'app/entities/message-thread/message-thread.model';
import { MessageThreadService } from 'app/entities/message-thread/service/message-thread.service';
import { IProfile } from 'app/entities/profile/profile.model';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { MessageStatus } from 'app/entities/enumerations/message-status.model';
import { MessageType } from 'app/entities/enumerations/message-type.model';
import { ChatService } from '../service/chat.service';
import { IChat } from '../chat.model';
import { ChatFormGroup, ChatFormService } from './chat-form.service';

@Component({
  standalone: true,
  selector: 'jhi-chat-update',
  templateUrl: './chat-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class ChatUpdateComponent implements OnInit {
  isSaving = false;
  chat: IChat | null = null;
  messageStatusValues = Object.keys(MessageStatus);
  messageTypeValues = Object.keys(MessageType);

  messageThreadsSharedCollection: IMessageThread[] = [];
  profilesSharedCollection: IProfile[] = [];

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected chatService = inject(ChatService);
  protected chatFormService = inject(ChatFormService);
  protected messageThreadService = inject(MessageThreadService);
  protected profileService = inject(ProfileService);
  protected elementRef = inject(ElementRef);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: ChatFormGroup = this.chatFormService.createChatFormGroup();

  compareMessageThread = (o1: IMessageThread | null, o2: IMessageThread | null): boolean =>
    this.messageThreadService.compareMessageThread(o1, o2);

  compareProfile = (o1: IProfile | null, o2: IProfile | null): boolean => this.profileService.compareProfile(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ chat }) => {
      this.chat = chat;
      if (chat) {
        this.updateForm(chat);
      }

      this.loadRelationshipsOptions();
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  setFileData(event: Event, field: string, isImage: boolean): void {
    this.dataUtils.loadFileToForm(event, this.editForm, field, isImage).subscribe({
      error: (err: FileLoadError) =>
        this.eventManager.broadcast(new EventWithContent<AlertError>('teamproject24App.error', { message: err.message })),
    });
  }

  clearInputImage(field: string, fieldContentType: string, idInput: string): void {
    this.editForm.patchValue({
      [field]: null,
      [fieldContentType]: null,
    });
    if (idInput && this.elementRef.nativeElement.querySelector(`#${idInput}`)) {
      this.elementRef.nativeElement.querySelector(`#${idInput}`).value = null;
    }
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const chat = this.chatFormService.getChat(this.editForm);
    if (chat.id !== null) {
      this.subscribeToSaveResponse(this.chatService.update(chat));
    } else {
      this.subscribeToSaveResponse(this.chatService.create(chat));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IChat>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(chat: IChat): void {
    this.chat = chat;
    this.chatFormService.resetForm(this.editForm, chat);

    this.messageThreadsSharedCollection = this.messageThreadService.addMessageThreadToCollectionIfMissing<IMessageThread>(
      this.messageThreadsSharedCollection,
      chat.thread,
      chat.messageThread,
    );
    this.profilesSharedCollection = this.profileService.addProfileToCollectionIfMissing<IProfile>(
      this.profilesSharedCollection,
      chat.sender,
      chat.receiver,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.messageThreadService
      .query()
      .pipe(map((res: HttpResponse<IMessageThread[]>) => res.body ?? []))
      .pipe(
        map((messageThreads: IMessageThread[]) =>
          this.messageThreadService.addMessageThreadToCollectionIfMissing<IMessageThread>(
            messageThreads,
            this.chat?.thread,
            this.chat?.messageThread,
          ),
        ),
      )
      .subscribe((messageThreads: IMessageThread[]) => (this.messageThreadsSharedCollection = messageThreads));

    this.profileService
      .query()
      .pipe(map((res: HttpResponse<IProfile[]>) => res.body ?? []))
      .pipe(
        map((profiles: IProfile[]) =>
          this.profileService.addProfileToCollectionIfMissing<IProfile>(profiles, this.chat?.sender, this.chat?.receiver),
        ),
      )
      .subscribe((profiles: IProfile[]) => (this.profilesSharedCollection = profiles));
  }
}

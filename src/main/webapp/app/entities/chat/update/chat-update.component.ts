import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AlertError } from 'app/shared/alert/alert-error.model';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { IFriendsList } from 'app/entities/friends-list/friends-list.model';
import { FriendsListService } from 'app/entities/friends-list/service/friends-list.service';
import { IProfile } from 'app/entities/profile/profile.model';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { ActionType } from 'app/entities/enumerations/action-type.model';
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
  actionTypeValues = Object.keys(ActionType);

  friendChatsCollection: IFriendsList[] = [];
  profilesSharedCollection: IProfile[] = [];
  usersSharedCollection: IUser[] = [];

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected chatService = inject(ChatService);
  protected chatFormService = inject(ChatFormService);
  protected friendsListService = inject(FriendsListService);
  protected profileService = inject(ProfileService);
  protected userService = inject(UserService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: ChatFormGroup = this.chatFormService.createChatFormGroup();

  compareFriendsList = (o1: IFriendsList | null, o2: IFriendsList | null): boolean => this.friendsListService.compareFriendsList(o1, o2);

  compareProfile = (o1: IProfile | null, o2: IProfile | null): boolean => this.profileService.compareProfile(o1, o2);

  compareUser = (o1: IUser | null, o2: IUser | null): boolean => this.userService.compareUser(o1, o2);

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

    this.friendChatsCollection = this.friendsListService.addFriendsListToCollectionIfMissing<IFriendsList>(
      this.friendChatsCollection,
      chat.friendChat,
    );
    this.profilesSharedCollection = this.profileService.addProfileToCollectionIfMissing<IProfile>(
      this.profilesSharedCollection,
      chat.chats,
    );
    this.usersSharedCollection = this.userService.addUserToCollectionIfMissing<IUser>(
      this.usersSharedCollection,
      chat.sender,
      chat.receiver,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.friendsListService
      .query({ filter: 'chat-is-null' })
      .pipe(map((res: HttpResponse<IFriendsList[]>) => res.body ?? []))
      .pipe(
        map((friendsLists: IFriendsList[]) =>
          this.friendsListService.addFriendsListToCollectionIfMissing<IFriendsList>(friendsLists, this.chat?.friendChat),
        ),
      )
      .subscribe((friendsLists: IFriendsList[]) => (this.friendChatsCollection = friendsLists));

    this.profileService
      .query()
      .pipe(map((res: HttpResponse<IProfile[]>) => res.body ?? []))
      .pipe(map((profiles: IProfile[]) => this.profileService.addProfileToCollectionIfMissing<IProfile>(profiles, this.chat?.chats)))
      .subscribe((profiles: IProfile[]) => (this.profilesSharedCollection = profiles));

    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(map((users: IUser[]) => this.userService.addUserToCollectionIfMissing<IUser>(users, this.chat?.sender, this.chat?.receiver)))
      .subscribe((users: IUser[]) => (this.usersSharedCollection = users));
  }
}

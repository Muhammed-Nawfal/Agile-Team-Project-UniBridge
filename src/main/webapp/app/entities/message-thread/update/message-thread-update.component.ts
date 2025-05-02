import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IFriendsList } from 'app/entities/friends-list/friends-list.model';
import { FriendsListService } from 'app/entities/friends-list/service/friends-list.service';
import { IActivityMatch } from 'app/entities/activity-match/activity-match.model';
import { ActivityMatchService } from 'app/entities/activity-match/service/activity-match.service';
import { IProfile } from 'app/entities/profile/profile.model';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { MessageThreadService } from '../service/message-thread.service';
import { IMessageThread } from '../message-thread.model';
import { MessageThreadFormGroup, MessageThreadFormService } from './message-thread-form.service';

@Component({
  standalone: true,
  selector: 'jhi-message-thread-update',
  templateUrl: './message-thread-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class MessageThreadUpdateComponent implements OnInit {
  isSaving = false;
  messageThread: IMessageThread | null = null;

  friendChatsCollection: IFriendsList[] = [];
  matchChatsCollection: IActivityMatch[] = [];
  profilesSharedCollection: IProfile[] = [];

  protected messageThreadService = inject(MessageThreadService);
  protected messageThreadFormService = inject(MessageThreadFormService);
  protected friendsListService = inject(FriendsListService);
  protected activityMatchService = inject(ActivityMatchService);
  protected profileService = inject(ProfileService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: MessageThreadFormGroup = this.messageThreadFormService.createMessageThreadFormGroup();

  compareFriendsList = (o1: IFriendsList | null, o2: IFriendsList | null): boolean => this.friendsListService.compareFriendsList(o1, o2);

  compareActivityMatch = (o1: IActivityMatch | null, o2: IActivityMatch | null): boolean =>
    this.activityMatchService.compareActivityMatch(o1, o2);

  compareProfile = (o1: IProfile | null, o2: IProfile | null): boolean => this.profileService.compareProfile(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ messageThread }) => {
      this.messageThread = messageThread;
      if (messageThread) {
        this.updateForm(messageThread);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const messageThread = this.messageThreadFormService.getMessageThread(this.editForm);
    if (messageThread.id !== null) {
      this.subscribeToSaveResponse(this.messageThreadService.update(messageThread));
    } else {
      this.subscribeToSaveResponse(this.messageThreadService.create(messageThread));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IMessageThread>>): void {
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

  protected updateForm(messageThread: IMessageThread): void {
    this.messageThread = messageThread;
    this.messageThreadFormService.resetForm(this.editForm, messageThread);

    this.friendChatsCollection = this.friendsListService.addFriendsListToCollectionIfMissing<IFriendsList>(
      this.friendChatsCollection,
      messageThread.friendChat,
    );
    this.matchChatsCollection = this.activityMatchService.addActivityMatchToCollectionIfMissing<IActivityMatch>(
      this.matchChatsCollection,
      messageThread.matchChat,
    );
    this.profilesSharedCollection = this.profileService.addProfileToCollectionIfMissing<IProfile>(
      this.profilesSharedCollection,
      ...(messageThread.participants ?? []),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.friendsListService
      .query({ filter: 'messagethread-is-null' })
      .pipe(map((res: HttpResponse<IFriendsList[]>) => res.body ?? []))
      .pipe(
        map((friendsLists: IFriendsList[]) =>
          this.friendsListService.addFriendsListToCollectionIfMissing<IFriendsList>(friendsLists, this.messageThread?.friendChat),
        ),
      )
      .subscribe((friendsLists: IFriendsList[]) => (this.friendChatsCollection = friendsLists));

    this.activityMatchService
      .query({ filter: 'messagethread-is-null' })
      .pipe(map((res: HttpResponse<IActivityMatch[]>) => res.body ?? []))
      .pipe(
        map((activityMatches: IActivityMatch[]) =>
          this.activityMatchService.addActivityMatchToCollectionIfMissing<IActivityMatch>(activityMatches, this.messageThread?.matchChat),
        ),
      )
      .subscribe((activityMatches: IActivityMatch[]) => (this.matchChatsCollection = activityMatches));

    this.profileService
      .query()
      .pipe(map((res: HttpResponse<IProfile[]>) => res.body ?? []))
      .pipe(
        map((profiles: IProfile[]) =>
          this.profileService.addProfileToCollectionIfMissing<IProfile>(profiles, ...(this.messageThread?.participants ?? [])),
        ),
      )
      .subscribe((profiles: IProfile[]) => (this.profilesSharedCollection = profiles));
  }
}

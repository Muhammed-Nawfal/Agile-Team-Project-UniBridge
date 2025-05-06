// src/main/webapp/app/entities/challenge/list/challenge-list.component.ts

/* eslint-disable */

import { Component, OnInit } from '@angular/core';
import { IChallenge } from '../challenge.model';
import { ChallengeService } from '../service/challenge.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgFor, NgIf } from '@angular/common';
import { ChallengeCardComponent } from '../challenge-card.component';
import { RouterLink } from '@angular/router';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { MessageThreadService } from 'app/entities/message-thread/service/message-thread.service';
import { ChatService } from 'app/entities/chat/service/chat.service';
import { NewChat } from 'app/entities/chat/chat.model';
import dayjs from 'dayjs/esm';
import { FriendsListService } from 'app/entities/friends-list/service/friends-list.service';

@Component({
  selector: 'jhi-challenge-list',
  templateUrl: './challenge-list.component.html',
  styleUrls: ['./challenge-list.component.scss'],
  imports: [FontAwesomeModule, NgFor, NgIf, ChallengeCardComponent, RouterLink],
  standalone: true,
})
export class ChallengeListComponent implements OnInit {
  challenges: IChallenge[] = [];
  isLoading = false;

  constructor(
    private challengeService: ChallengeService,
    private profileService: ProfileService,
    private messageThreadService: MessageThreadService,
    private chatService: ChatService,
    private friendsListService: FriendsListService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;

    this.profileService.findMyProfile().subscribe({
      next: profileRes => {
        const myProfile = profileRes.body;
        if (!myProfile?.id) {
          this.isLoading = false;
          return;
        }

        this.challengeService.query().subscribe({
          next: res => {
            this.challenges = (res.body ?? []).filter(c => c.assignedTo?.id === myProfile.id);
            this.isLoading = false;
          },
          error: () => (this.isLoading = false),
        });
      },
      error: () => (this.isLoading = false),
    });
  }

  trackId(_: number, item: IChallenge): number {
    try {
      return item.id;
    } catch (error: unknown) {
      // safely narrow the error
      if (error instanceof Error) {
        console.error(error.message);
      }
      return item.id;
    }
  }

  onReject(id: number): void {
    this.challengeService.reject(id).subscribe(() => this.load());
  }
  onComplete(challenge: IChallenge): void {
    if (!challenge.assignedTo?.id || !challenge.createdBy?.id) {
      console.error('Challenge is missing assignedTo or createdBy');
      return;
    }

    const assignedToId = challenge.assignedTo.id;
    const createdById = challenge.createdBy.id;

    this.friendsListService.checkFriendshipStatus(createdById).subscribe({
      next: res => {
        const friendsListId = res.friendsListId;
        if (friendsListId !== undefined) {
          this.messageThreadService.getOrCreateThreadForFriends(friendsListId).subscribe({
            next: response => {
              const thread = response.body;
              if (!thread?.id) return;

              const messageText = 'I have completed ';
              {
                challenge.title;
              }
              (', please mark me as completed so I can get my points!;');
              const newChat: NewChat = {
                id: null,
                message: messageText,
                createdOn: dayjs(), // optional if backend uses this
                timestamp: dayjs(), // required
                isDeleted: false, // required
                status: 'SENT', // required - match your MessageStatus enum
                type: 'TEXT', // required - match your MessageType enum
                thread: response.body ?? undefined,
                sender: { id: assignedToId }, // optional, backend may infer from session
              };

              this.chatService.sendMessage(thread.id, newChat).subscribe({
                next() {
                  console.log('Message sent to challenge creator.');
                },
                error(err) {
                  console.error('Error sending completion request:', err);
                },
              });
            },
            error(err) {
              console.error('Error getting/creating message thread:', err);
            },
          });
        }
      },
    });
  }
}

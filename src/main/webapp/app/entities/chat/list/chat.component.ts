import { Component, OnInit, AfterViewChecked, inject, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription, combineLatest, tap, forkJoin, Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CommonModule, KeyValuePipe } from '@angular/common';

import { IChat, NewChat } from '../chat.model';
import { ChatService } from '../service/chat.service';
import { ChatDeleteDialogComponent } from '../delete/chat-delete-dialog.component';
import { IProfile } from 'app/entities/profile/profile.model';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { IFriendsList } from 'app/entities/friends-list/friends-list.model';
import { FriendsListService } from 'app/entities/friends-list/service/friends-list.service';
import { IActivityMatch } from 'app/entities/activity-match/activity-match.model';
import { ActivityMatchService } from 'app/entities/activity-match/service/activity-match.service';
import { IMessageThread, NewMessageThread } from 'app/entities/message-thread/message-thread.model';
import { MessageThreadService } from 'app/entities/message-thread/service/message-thread.service';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';

// Define enums locally
enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
}

enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  FILE = 'FILE',
}

enum Decision {
  ACCEPT = 'ACCEPT',
  DECLINED = 'DECLINED',
  PENDING = 'PENDING',
}

// Interface for contact information
interface Contact {
  id: number;
  profileId: number;
  login: string;
  firstName: string;
  lastName: string;
  avatar?: string; // Will use profile picture if available, otherwise generate color
  threadId?: number; // Message thread ID for this contact
}

// Interface for user messages with explicit type
interface UserMessage {
  id?: number;
  text: string;
  time: string;
  type: 'sent' | 'received';
  containsProfanity?: boolean;
  status?: MessageStatus;
}

@Component({
  selector: 'jhi-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  standalone: true,
  imports: [RouterLinkActive, RouterLink, FormsModule, CommonModule, KeyValuePipe],
})
export class ChatComponent implements OnInit, AfterViewChecked {
  // Helper methods for templates
  Object = Object; // Make Object available to the template

  // Dark mode state
  darkMode = false;

  // Current user account
  account: Account | null = null;
  currentUserProfile?: IProfile | null = null;

  // Contacts and messages
  contacts: Record<string, Contact> = {};
  messages: Record<string, UserMessage[]> = {};
  selectedContact = '';
  selectedContactId = 0;
  currentThreadId?: number;
  newMessage = '';

  // Subscription and loading state management
  subscription: Subscription | null = null;
  chats?: IChat[];
  isLoading = false;

  // Dependency injection of services
  public readonly router = inject(Router);
  protected readonly chatService = inject(ChatService);
  protected readonly profileService = inject(ProfileService);
  protected readonly friendsListService = inject(FriendsListService);
  protected readonly activityMatchService = inject(ActivityMatchService);
  protected readonly messageThreadService = inject(MessageThreadService);
  protected readonly accountService = inject(AccountService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected modalService = inject(NgbModal);

  @ViewChild('messagesContainer') private messagesContainer?: ElementRef;

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
  ];

  // Initialize component
  ngOnInit(): void {
    // Check for dark mode preference
    this.initDarkMode();

    // Add hardcoded test contacts immediately
    this.addTestContacts();

    // Load current user first
    this.accountService.identity().subscribe(account => {
      this.account = account;
      if (account) {
        this.loadCurrentUserProfile();
      }
    });

    // Subscribe to route changes
    this.subscription = this.activatedRoute.queryParamMap.subscribe(params => {
      const contactParam = params.get('user');
      if (contactParam) {
        const contactId = Number(contactParam);
        if (!isNaN(contactId)) {
          this.selectContactById(contactId);
        }
      } else if (Object.keys(this.contacts).length > 0) {
        // If no contact specified, select the first test contact
        this.selectContact(Object.keys(this.contacts)[0]);
      }
    });
  }

  // Initialize dark mode
  initDarkMode(): void {
    // Check if there's a saved preference
    const savedMode = localStorage.getItem('chat-dark-mode');
    if (savedMode !== null) {
      this.darkMode = savedMode === 'true';
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.darkMode = prefersDark;
    }

    // Apply the initial mode
    this.applyDarkMode();

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (localStorage.getItem('chat-dark-mode') === null) {
        // Only auto-switch if user hasn't explicitly set a preference
        this.darkMode = e.matches;
        this.applyDarkMode();
      }
    });
  }

  // Toggle dark mode
  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    localStorage.setItem('chat-dark-mode', this.darkMode.toString());
    this.applyDarkMode();
  }

  // Apply dark mode class to document
  applyDarkMode(): void {
    if (this.darkMode) {
      document.body.classList.add('dark-theme');
      document.documentElement.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
      document.documentElement.classList.remove('dark-theme');
    }
  }

  // Add test contacts for development
  addTestContacts(): void {
    // Test contact 1
    const testContact1Key = '1';
    this.contacts[testContact1Key] = {
      id: 1,
      profileId: 1,
      login: 'alex_smith',
      firstName: 'Alex',
      lastName: 'Smith',
      avatar: this.generateAvatarColor('Alex'),
      threadId: 1, // Fake thread ID
    };

    // Test contact 2
    const testContact2Key = '2';
    this.contacts[testContact2Key] = {
      id: 2,
      profileId: 2,
      login: 'maria_jones',
      firstName: 'Maria',
      lastName: 'Jones',
      avatar: this.generateAvatarColor('Maria'),
      threadId: 2, // Fake thread ID
    };

    // Test contact 3
    const testContact3Key = '3';
    this.contacts[testContact3Key] = {
      id: 3,
      profileId: 3,
      login: 'raj_patel',
      firstName: 'Raj',
      lastName: 'Patel',
      avatar: this.generateAvatarColor('Raj'),
      threadId: 3, // Fake thread ID
    };

    // Add test messages for each contact
    this.messages[testContact1Key] = [
      {
        id: 101,
        text: 'Hey, do you want to come for a study session in the Library later?',
        time: '10:30 AM',
        type: 'received',
        status: MessageStatus.READ,
      },
      {
        id: 102,
        text: "Sure, I'd love to! What time are you thinking?",
        time: '10:35 AM',
        type: 'sent',
        status: MessageStatus.READ,
      },
      {
        id: 103,
        text: "How about 2pm? We can go over the notes from yesterday's lecture.",
        time: '10:36 AM',
        type: 'received',
        status: MessageStatus.READ,
      },
    ];

    this.messages[testContact2Key] = [
      {
        id: 201,
        text: 'Did you finish your part of the group project?',
        time: 'Yesterday',
        type: 'received',
        status: MessageStatus.READ,
      },
      {
        id: 202,
        text: "Almost done, I'll send it to you by tonight!",
        time: 'Yesterday',
        type: 'sent',
        status: MessageStatus.READ,
      },
    ];

    this.messages[testContact3Key] = [
      {
        id: 301,
        text: 'Are you going to the campus event tomorrow?',
        time: 'Monday',
        type: 'received',
        status: MessageStatus.READ,
      },
      {
        id: 302,
        text: "Yes, I'm planning to go. Want to meet there?",
        time: 'Monday',
        type: 'sent',
        status: MessageStatus.READ,
      },
      {
        id: 303,
        text: "Sounds good! Let's meet at the entrance at 6pm.",
        time: 'Monday',
        type: 'received',
        status: MessageStatus.READ,
      },
      {
        id: 304,
        text: 'Perfect, see you then!',
        time: 'Monday',
        type: 'sent',
        status: MessageStatus.READ,
      },
    ];
  }

  // Load current user profile
  loadCurrentUserProfile(): void {
    if (!this.account) {
      return;
    }

    this.profileService.findUserByLogin(this.account.login).subscribe({
      next: response => {
        // First get the user, then get the profile associated with it
        if (response.body?.id) {
          this.profileService.query({ 'user.equals': response.body.id }).subscribe({
            next: profileResponse => {
              if (profileResponse.body && profileResponse.body.length > 0) {
                this.currentUserProfile = profileResponse.body[0];
                this.loadContacts();
              }
            },
            error(err) {
              console.error('Failed to load current user profile', err);
            },
          });
        }
      },
      error(err) {
        console.error('Failed to load current user', err);
      },
    });
  }

  // Load all contacts (friends and activity matches)
  loadContacts(): void {
    if (!this.currentUserProfile?.id) {
      return;
    }

    this.isLoading = true;
    const profileId = this.currentUserProfile.id;

    // Get friends where request was accepted
    const friends$ = this.friendsListService.query({
      'requestStatus.equals': Decision.ACCEPT,
    });

    // Get activity matches that were accepted
    const matches$ = this.activityMatchService.query({
      'status.equals': Decision.ACCEPT,
    });

    // Process both friends and matches
    forkJoin([friends$, matches$]).subscribe({
      next: ([friendsRes, matchesRes]) => {
        const friends = friendsRes.body ?? [];
        const matches = matchesRes.body ?? [];

        // Process friends
        friends.forEach(friend => {
          // Determine if current user is the requestor or requestee
          let otherProfileId: number | undefined;

          if (friend.requestedByProfile?.id === profileId) {
            otherProfileId = friend.requestedToProfile?.id;
          } else if (friend.requestedToProfile?.id === profileId) {
            otherProfileId = friend.requestedByProfile?.id;
          }

          if (otherProfileId) {
            // Look for associated message thread
            const threadId = undefined; // We need to implement this correctly later
            this.loadProfileContact(otherProfileId, threadId);
          }
        });

        // Process activity matches
        matches.forEach(match => {
          let otherProfileId: number | undefined;

          if (match.matchRequestor?.id === profileId) {
            otherProfileId = match.userDetails?.id;
          } else if (match.userDetails?.id === profileId) {
            otherProfileId = match.matchRequestor?.id;
          }

          if (otherProfileId) {
            // Look for associated message thread
            const threadId = undefined; // We need to implement this correctly later
            this.loadProfileContact(otherProfileId, threadId);
          }
        });

        this.isLoading = false;

        // Don't select first contact here since we already have test contacts
      },
      error: err => {
        console.error('Failed to load contacts', err);
        this.isLoading = false;
      },
    });
  }

  // Load profile information for a contact
  loadProfileContact(profileId: number, threadId?: number): void {
    this.profileService.find(profileId).subscribe({
      next: res => {
        const profile = res.body;
        if (profile) {
          const contactKey = `${profile.id}`;
          this.contacts[contactKey] = {
            id: profile.id,
            profileId: profile.id,
            login: profile.login ?? '',
            firstName: profile.firstName ?? '',
            lastName: profile.lastName ?? '',
            avatar: this.generateAvatarColor(profile.firstName ?? ''),
            threadId,
          };
          this.messages[contactKey] = [];

          // If we have a thread ID, load the messages
          if (threadId) {
            this.loadMessagesForThread(threadId, contactKey);
          }
        }
      },
      error(err) {
        console.error(`Failed to load profile ${profileId}`, err);
      },
    });
  }

  // Load messages for a thread
  loadMessagesForThread(threadId: number, contactKey: string): void {
    this.chatService.query({ 'threadId.equals': threadId }).subscribe({
      next: res => {
        const chats = res.body ?? [];

        // Sort messages by timestamp (using string comparison which works for ISO format)
        chats.sort((a, b) => {
          const timeA = a.timestamp ? a.timestamp.toString() : '';
          const timeB = b.timestamp ? b.timestamp.toString() : '';
          return timeA.localeCompare(timeB);
        });

        // Convert to UserMessage format
        const formattedMessages: UserMessage[] = chats.map(chat => {
          const isSent = chat.sender?.id === this.currentUserProfile?.id;

          return {
            id: chat.id,
            text: chat.message ?? '',
            time: this.formatTimestamp(chat.timestamp?.toString()),
            type: isSent ? 'sent' : 'received',
            status: chat.status as MessageStatus,
          };
        });

        this.messages[contactKey] = formattedMessages;

        // If this is the selected contact, scroll to bottom
        if (this.selectedContact === contactKey) {
          setTimeout(() => this.scrollToBottom(), 100);
        }
      },
      error(err) {
        console.error(`Failed to load messages for thread ${threadId}`, err);
      },
    });
  }

  // Format ISO timestamp to readable time
  formatTimestamp(timestamp?: string | null): string {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  }

  // Generate consistent color based on name
  generateAvatarColor(name: string): string {
    if (!name) return '#7c4dff'; // Default purple

    // Simple hash function for name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      // eslint-disable-next-line no-bitwise
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convert to hex color
    // eslint-disable-next-line no-bitwise
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  }

  // Automatically scroll to bottom after view updates
  ngAfterViewChecked(): void {
    // Only scroll if this is the active contact
    if (this.selectedContact && this.messagesContainer) {
      this.scrollToBottom();
    }
  }

  // Scroll messages container to bottom
  scrollToBottom(): void {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  // Select a contact by ID (used when navigating directly to a contact)
  selectContactById(contactId: number): void {
    const contactKey = `${contactId}`;
    if (contactKey in this.contacts) {
      this.selectContact(contactKey);
    } else {
      // If contact not loaded yet, we'll retry after contacts are loaded
      // This is handled in the loadContacts method
    }
  }

  // Select a contact and update UI
  selectContact(contactKey: string): void {
    // Update selected contact
    this.selectedContact = contactKey;
    const contact = this.contacts[contactKey];
    this.selectedContactId = contact.id;
    this.currentThreadId = contact.threadId;

    // If we have a thread ID but no messages, load them
    if (contact.threadId && this.messages[contactKey].length === 0) {
      this.loadMessagesForThread(contact.threadId, contactKey);
    }

    // Update URL to reflect selected contact
    this.router.navigate(['/chat'], { queryParams: { user: contact.id } });

    // Scroll to bottom after short delay
    setTimeout(() => this.scrollToBottom(), 100);
  }

  // Create a new message thread if one doesn't exist
  createMessageThread(contactKey: string): Observable<number> {
    return new Observable<number>(observer => {
      const contact = this.contacts[contactKey];

      if (contact.threadId) {
        // Thread already exists
        observer.next(contact.threadId);
        observer.complete();
        return;
      }

      if (!this.currentUserProfile?.id) {
        observer.error('Current user profile not loaded');
        return;
      }

      // For test contacts, create a fake thread ID
      if (contactKey === '1' || contactKey === '2' || contactKey === '3') {
        const fakeThreadId = parseInt(contactKey, 10) * 100; // Just a fake ID for testing
        contact.threadId = fakeThreadId;
        observer.next(fakeThreadId);
        observer.complete();
        return;
      }

      // Create a new thread
      const newThread: NewMessageThread = {
        id: null,
        isGroup: false,
        name: `${this.currentUserProfile.firstName ?? ''} and ${contact.firstName}`,
        createdOn: undefined, // Let the backend handle timestamp creation
        participants: [{ id: this.currentUserProfile.id }, { id: contact.profileId }],
      };

      this.messageThreadService.create(newThread).subscribe({
        next: res => {
          const threadId = res.body?.id;
          if (threadId) {
            // Update the contact with the new thread ID
            contact.threadId = threadId;
            this.contacts[contactKey] = contact;
            observer.next(threadId);
            observer.complete();
          } else {
            observer.error('Failed to create message thread');
          }
        },
        error(err) {
          console.error('Error creating message thread', err);
          observer.error(err);
        },
      });
    });
  }

  // Send a new message
  sendMessage(): void {
    // Validate message and selected contact
    const trimmedMessage = this.newMessage.trim();
    if (!trimmedMessage || !this.selectedContact) return;

    const contact = this.contacts[this.selectedContact];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!contact) return;

    // Check for profanity
    const hasProfanity = this.checkForProfanity(trimmedMessage);
    const filteredText = hasProfanity ? this.filterProfanity(trimmedMessage) : trimmedMessage;

    // Get or create thread
    this.createMessageThread(this.selectedContact).subscribe({
      next: threadId => {
        if (!this.currentUserProfile?.id) {
          console.error('Current user profile not loaded');
          return;
        }

        // For test contacts, just add the message locally
        if (this.selectedContact === '1' || this.selectedContact === '2' || this.selectedContact === '3') {
          const sentMessage: UserMessage = {
            id: Math.floor(Math.random() * 10000), // Generate a random ID for test
            text: filteredText,
            time: this.generateFormattedTime(),
            type: 'sent',
            containsProfanity: hasProfanity,
            status: MessageStatus.SENT,
          };

          this.messages[this.selectedContact].push(sentMessage);
          this.newMessage = '';
          this.scrollToBottom();

          // Simulate a response after 2 seconds
          setTimeout(() => {
            const responses = [
              "That's great!",
              "Good point, I'll consider that.",
              'Thanks for letting me know.',
              "I'll get back to you on that soon.",
              'What time works for you?',
              'I agree with you.',
              "Let's discuss that more when we meet.",
              'Interesting perspective!',
            ];

            const randomResponse = responses[Math.floor(Math.random() * responses.length)];

            const receivedMessage: UserMessage = {
              id: Math.floor(Math.random() * 10000),
              text: randomResponse,
              time: this.generateFormattedTime(),
              type: 'received',
              status: MessageStatus.DELIVERED,
            };

            this.messages[this.selectedContact].push(receivedMessage);
            this.scrollToBottom();

            // Update the message status to READ after a short delay
            setTimeout(() => {
              sentMessage.status = MessageStatus.READ;
            }, 1000);
          }, 2000);

          return;
        }

        // For real contacts, create a message object and send to server
        const newChat: NewChat = {
          id: null,
          message: filteredText,
          timestamp: undefined, // Let the backend handle timestamp creation
          status: MessageStatus.SENT,
          type: MessageType.TEXT,
          isDeleted: false,
          createdOn: undefined, // Let the backend handle timestamp creation
          thread: { id: threadId },
          sender: { id: this.currentUserProfile.id },
          receiver: { id: contact.profileId },
        };

        // Add optimistic UI update for immediate feedback
        const sentMessage: UserMessage = {
          text: filteredText,
          time: this.generateFormattedTime(),
          type: 'sent',
          containsProfanity: hasProfanity,
          status: MessageStatus.SENT,
        };

        this.messages[this.selectedContact].push(sentMessage);
        this.newMessage = '';
        this.scrollToBottom();

        // Send message to server
        this.chatService.create(newChat).subscribe({
          next: res => {
            // Update the sent message with the ID from server
            const index = this.messages[this.selectedContact].length - 1;
            if (index >= 0) {
              this.messages[this.selectedContact][index].id = res.body?.id;
            }
          },
          error(err) {
            console.error('Failed to send message', err);
            // Could add error handling UI here
          },
        });
      },
      error(err) {
        console.error('Failed to create or get thread', err);
      },
    });
  }

  // Mark messages as read when viewed
  markMessagesAsRead(): void {
    if (!this.selectedContact || !this.currentThreadId) return;

    // Find unread received messages
    const unreadMessages = this.messages[this.selectedContact].filter(
      message => message.type === 'received' && message.status !== MessageStatus.READ && message.id,
    );

    if (unreadMessages.length === 0) return;

    // Update messages in the UI
    unreadMessages.forEach(message => {
      message.status = MessageStatus.READ;
    });

    // For test contacts, no need to update database
    if (this.selectedContact === '1' || this.selectedContact === '2' || this.selectedContact === '3') {
      return;
    }

    // Update messages in the database
    unreadMessages.forEach(message => {
      if (message.id) {
        this.chatService.find(message.id).subscribe({
          next: res => {
            if (res.body) {
              const updatedChat = {
                ...res.body,
                status: MessageStatus.READ,
              };
              this.chatService.update(updatedChat).subscribe();
            }
          },
        });
      }
    });
  }

  // Generate formatted time for messages
  private generateFormattedTime(): string {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  }

  // Check for profanity in text
  private checkForProfanity(text: string): boolean {
    if (!text) return false;

    const lowerText = text.toLowerCase();
    return this.profanityList.some(word => {
      // Use regex with word boundaries to match whole words
      const regex = new RegExp('\\b' + word + '\\b', 'i');
      return regex.test(lowerText);
    });
  }

  // Filter profanity from text
  private filterProfanity(text: string): string {
    if (!text) return text;

    let filteredText = text;
    this.profanityList.forEach(word => {
      // Use regex with word boundaries to match whole words
      const regex = new RegExp('\\b' + word + '\\b', 'gi');
      filteredText = filteredText.replace(regex, '*'.repeat(word.length));
    });

    return filteredText;
  }
}

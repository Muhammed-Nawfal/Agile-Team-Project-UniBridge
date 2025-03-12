import { Component, OnInit, AfterViewChecked, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription, combineLatest, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CommonModule, KeyValuePipe } from '@angular/common';

import { IChat } from '../chat.model';
import { ChatService } from '../service/chat.service';
import { ChatDeleteDialogComponent } from '../delete/chat-delete-dialog.component';

// Interface for contact information
interface Contact {
  name: string;
  age: number;
  avatar: string;
  initialMessage: string;
  responseOptions: string[];
}

// Interface for user messages with explicit type
interface UserMessage {
  text: string;
  time: string;
  type: 'sent' | 'received';
}

@Component({
  selector: 'jhi-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  standalone: true,
  imports: [RouterLinkActive, RouterLink, FormsModule, CommonModule, KeyValuePipe],
})
export class ChatComponent implements OnInit, AfterViewChecked {
  // Predefined contacts with their details
  contacts: Record<string, Contact> = {
    Kylie: {
      name: 'Kylie',
      age: 21,
      avatar: '#293eaa',
      initialMessage: 'Hey, do you want to come for a study session in the Library later?',
      responseOptions: [
        'Great! Looking forward to studying with you.',
        'BTW, did you finish the assignment?',
        'Should we invite anyone else to join us?',
        'What time works best for you?',
        "I'll bring some snacks!",
      ],
    },
    Nicole: {
      name: 'Nicole',
      age: 22,
      avatar: '#ff6b6b',
      initialMessage: 'I found some great notes for our class. Want to review them?',
      responseOptions: [
        'Thanks for letting me know!',
        'Did you find the lecture notes helpful?',
        'Can we go over the difficult problems together?',
        "I'm still working on the last question.",
        'Have you started on the group project yet?',
      ],
    },
    Nawfal: {
      name: 'Nawfal',
      age: 23,
      avatar: '#4ecdc4',
      initialMessage: 'Coffee break soon?',
      responseOptions: [
        'Coffee sounds perfect!',
        'How about that new place near campus?',
        'I could use a break from studying.',
        "Let's meet at 3pm?",
        'Should we invite the others?',
      ],
    },
    Yinrui: {
      name: 'Yinrui',
      age: 20,
      avatar: '#45b7d1',
      initialMessage: 'Have you seen the new project guidelines?',
      responseOptions: [
        'Yes, I saw it. We need to submit by Friday.',
        'Have you chosen your topic yet?',
        'Do you think we should ask for an extension?',
        "I've already started the research part.",
        'Want to collaborate on this one?',
      ],
    },
  };

  // Store messages for each contact
  messages: Record<string, UserMessage[]> = {};

  // Currently selected contact
  selectedContact = 'Kylie';
  newMessage = '';

  // Subscription and loading state management
  subscription: Subscription | null = null;
  chats?: IChat[];
  isLoading = false;

  // Dependency injection of services
  public readonly router = inject(Router);
  protected readonly chatService = inject(ChatService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected modalService = inject(NgbModal);

  // Initialize component
  ngOnInit(): void {
    // Initialize messages array for each contact
    Object.keys(this.contacts).forEach(contactName => {
      this.messages[contactName] = [];
    });

    // Subscribe to route changes and load chats
    this.subscription = combineLatest([this.activatedRoute.queryParamMap])
      .pipe(tap(() => this.loadChats()))
      .subscribe();

    // Check for contact in URL parameters
    this.activatedRoute.queryParamMap.subscribe(params => {
      const contactParam = params.get('user');
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (contactParam && this.contacts[contactParam]) {
        this.selectContact(contactParam);
      }
    });
  }

  // Automatically scroll to bottom after view updates
  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  // Scroll messages container to bottom
  scrollToBottom(): void {
    // Use native JavaScript to scroll
    const container = document.querySelector('.messages-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  // Load chat data from service
  loadChats(): void {
    this.isLoading = true;
    this.chatService
      .query()
      .pipe(
        tap(res => {
          this.chats = res.body ?? [];
          this.isLoading = false;
        }),
      )
      .subscribe({
        error: err => {
          console.error('Failed to load chats', err);
          this.isLoading = false;
        },
      });
  }

  // Select a contact and update UI
  selectContact(contactName: string): void {
    // Update selected contact
    this.selectedContact = contactName;

    // Update URL to reflect selected contact
    this.router.navigate(['/chat'], { queryParams: { user: contactName } });

    // Scroll to bottom after short delay
    setTimeout(() => this.scrollToBottom(), 100);
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

  // Send a new message
  // eslint-disable-next-line @typescript-eslint/member-ordering
  sendMessage(): void {
    // Trim and validate message
    const trimmedMessage = this.newMessage.trim();
    if (!trimmedMessage) return;

    // Create sent message
    const sentMessage: UserMessage = {
      text: trimmedMessage,
      time: this.generateFormattedTime(),
      type: 'sent',
    };

    // Add message to current contact's messages
    this.messages[this.selectedContact].push(sentMessage);

    // Clear input
    this.newMessage = '';

    // Simulate contact response
    setTimeout(() => {
      // Get random response from contact's options
      const contact = this.contacts[this.selectedContact];
      const responseText = contact.responseOptions[Math.floor(Math.random() * contact.responseOptions.length)];

      // Create received message
      const receivedMessage: UserMessage = {
        text: responseText,
        time: this.generateFormattedTime(),
        type: 'received',
      };

      // Add response to messages
      this.messages[this.selectedContact].push(receivedMessage);

      // Scroll to bottom
      this.scrollToBottom();
    }, 1500);
  }

  // // Optional: Unmatch current contact (placeholder)
  // unmatchContact(): void {
  //   console.log(`Unmatched with ${this.selectedContact}`);
  //   // TODO: Implement actual unmatch logic
  // }
  //
  // // Optional: Report current contact (placeholder)
  // reportContact(): void {
  //   console.log(`Reported ${this.selectedContact}`);
  //   // TODO: Implement actual report logic
  // }
}

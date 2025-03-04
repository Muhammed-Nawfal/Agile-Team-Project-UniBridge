import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Contact {
  id: number;
  name: string;
  age: number;
  distance: number;
}

interface Message {
  id: number;
  message: string;
  timestamp: Date;
  sender: string;
  receiver: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent {
  currentUser: string = 'Me';
  matchDate: Date = new Date();

  contacts: Contact[] = [
    { id: 1, name: 'Andre', age: 25, distance: 2 },
    { id: 2, name: 'Jeffrey', age: 28, distance: 5 },
    { id: 3, name: 'Ivan', age: 24, distance: 3 },
  ];

  selectedContact: Contact = {
    id: 1,
    name: 'Daniel',
    age: 25,
    distance: 2,
  };

  messages: Message[] = [
    {
      id: 1,
      message: 'Hey, are you down for a session at the Library later today?',
      timestamp: new Date(new Date().setHours(12, 56)),
      sender: 'Name 1',
      receiver: 'Me',
    },
    {
      id: 2,
      message: 'Yes sure! See you there!',
      timestamp: new Date(new Date().setHours(13, 12)),
      sender: 'Me',
      receiver: 'Name 1',
    },
  ];

  newMessage: string = '';

  sendMessage() {
    if (this.newMessage.trim()) {
      this.messages.push({
        id: this.messages.length + 1,
        message: this.newMessage,
        timestamp: new Date(),
        sender: this.currentUser,
        receiver: this.selectedContact.name,
      });
      this.newMessage = ''; // Clear input
    }
  }
}

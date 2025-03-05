import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  notifications = [
    { message: 'New message received', timestamp: '2025-03-03 10:00 AM' },
    { message: 'System update completed', timestamp: '2025-03-03 09:30 AM' },
    { message: 'Meeting scheduled for tomorrow', timestamp: '2025-03-02 05:00 PM' }
  ];

}
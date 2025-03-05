import { Component, OnInit } from '@angular/core';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = []; // Array to hold notifications

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    // Subscribe to the notification service to get updates
    this.notificationService.getNotifications().subscribe((notifications) => {
      this.notifications = notifications;
    });
  }

  // Dismiss a notification by its ID
  dismissNotification(id: number): void {
    this.notificationService.removeNotification(id);
  }
}
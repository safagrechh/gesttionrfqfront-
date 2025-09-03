import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService } from 'src/app/api/api/notification.service';
import { NotificationDto } from 'src/app/api/model/notificationDto';
import { RealtimeNotificationService } from 'src/app/api/api/realtime-notification.service';
import { HttpContext, HttpHeaders } from '@angular/common/http';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { UserService } from 'src/app/api';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { ToastNotificationService } from 'src/app/services/toast-notification.service';

type NotificationVM = {
  id?: number;                 // server id (may be missing for live-only entries)
  message: string;
  rfqId?: number;
  createdAt?: string;
  isRead?: boolean;
  actionUserName?: string;
};

@Component({
  selector: 'app-nav-right',
  standalone: true,
  imports: [SharedModule, NgIf, NgFor],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss'],
  providers: [NgbDropdownConfig]
})
export class NavRightComponent implements OnInit, OnDestroy {
  userName: string = 'Loading...';
  userRole: string = '';

  // what the template needs
  notifications: NotificationVM[] = [];
  unread = 0;
  connectionStatus: string = 'disconnected';

  private subscriptions: Subscription[] = [];

  private roleMap: Record<number, string> = {
    0: 'Validateur',
    1: 'Ingenieur RFQ',
    2: 'Admin',
    3: 'Lecteur'
  };

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private router: Router,
    private api: NotificationService,
    public realtime: RealtimeNotificationService,
    private toastService: ToastNotificationService
  ) {
    const config = inject(NgbDropdownConfig);
    config.placement = 'bottom-right';
  }

  ngOnInit(): void {
    // Load user header
    this.userService.apiUserMeGet().subscribe({
      next: (user) => {
        this.userName = user.nomUser;
        this.userRole = this.roleMap[user.role] || 'Unknown role';

        // After user is loaded, ensure token is set for notifications
        const token = localStorage.getItem('token');
        if (token) {
          // Set token for REST API
          this.api.configuration.credentials = {
            'Bearer': () => `Bearer ${token}`
          };

          // Make sure realtime is started
          if (this.realtime) {
            this.realtime.start(token);
          }
        }
      },
      error: (err) => {
        console.error('Failed to load user:', err);
        this.userName = 'Guest';
        this.userRole = 'Guest';
      }
    });

    // Seed recent notifications from REST (show latest 5)
    this.refreshList();

    // Seed unread count
    this.refreshUnread();

    // Subscribe to connection status
    this.subscriptions.push(
      this.realtime.connectionStatus$.subscribe(status => {
        console.log('SignalR connection status:', status);
        this.connectionStatus = status;
      })
    );

    // Listen to realtime pushes - only for new notifications, not initial load
    this.subscriptions.push(
      this.realtime.messages$.subscribe((msgs) => {
        console.log('Received realtime messages:', msgs);
        if (!msgs || !msgs.length) return;

        // Get the latest message (first in array since it's prepended)
        const latestMsg = msgs[0];
        
        // Check if this message is already in our notifications list
        const exists = this.notifications.some(n => 
          n.message === latestMsg.message && 
          n.rfqId === latestMsg.rfqId && 
          n.createdAt === latestMsg.createdAt
        );
        
        // Only add if it doesn't already exist
        if (!exists) {
          const vm: NotificationVM = {
            message: latestMsg.message,
            rfqId: latestMsg.rfqId,
            createdAt: latestMsg.createdAt ?? new Date().toISOString(),
            isRead: false,
            actionUserName: latestMsg.actionUserName
          };
          
          console.log('Adding new real-time notification:', vm);
          
          // Prepend the new notification and keep only 5 for the dropdown
          this.notifications = [vm, ...this.notifications].slice(0, 5);
          this.unread++;
          
          // Show a toast notification popup
          console.log('Attempting to show toast notification:', vm.message);
          this.toastService.showToast({
            message: vm.message,
            type: 'info',
            actionUserName: vm.actionUserName,
            rfqId: vm.rfqId?.toString(),
            duration: 10000
          });
          console.log('Toast service called successfully');
          
          console.log(`📢 New notification: ${vm.message}`);
        }
      })
    );
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // ========== Template actions ==========

  clearAll(): void {
    this.api.apiNotificationMarkAllReadPost().subscribe({
      next: () => {
        // Mark all as read locally and reset badge
        this.notifications = this.notifications.map(n => ({ ...n, isRead: true }));
        this.unread = 0;
      },
      error: (err) => {
        console.error('Failed to mark all as read:', err);
      }
    });
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.isRead = true);
    this.unread = 0;
  }

  getNewNotifications(): NotificationVM[] {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    return this.notifications.filter(n => {
      const createdAt = new Date(n.createdAt || '');
      return createdAt > oneHourAgo;
    });
  }

  getEarlierNotifications(): NotificationVM[] {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    return this.notifications.filter(n => {
      const createdAt = new Date(n.createdAt || '');
      return createdAt <= oneHourAgo;
    });
  }

  getUserName(notification: NotificationVM): string {
    // Use actionUserName from notification or fallback to default
    return notification.actionUserName || 'System User';
  }

  getTimeAgo(createdAt?: string): string {
    if (!createdAt) return 'unknown';
    
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  }

  markRead(notification: NotificationVM): void {
    if (!notification.id) {
      // live-only item: mark this specific notification as read
      if (!notification.isRead) {
        notification.isRead = true;
        this.unread = Math.max(0, this.unread - 1);
      }
      // Navigate to RFQ page if rfqId is available
      if (notification.rfqId) {
        this.router.navigate(['/rfq-manage/get-rfq', notification.rfqId]);
      }
      return;
    }

    // Get auth token from the API service configuration
    const headers = new HttpHeaders({
      'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
    });
    
    this.http.put(`https://localhost:7107/api/Notification/${notification.id}/mark-read`, {}, { headers }).subscribe({
      next: () => {
        if (!notification.isRead) {
          notification.isRead = true;
          this.unread = Math.max(0, this.unread - 1);
        }
        // Refresh unread count from server to ensure accuracy
        this.refreshUnread();
        
        // Navigate to RFQ page if rfqId is available
        if (notification.rfqId) {
          this.router.navigate(['/rfq-manage/get-rfq', notification.rfqId]);
        }
      },
      error: (err) => {
        console.error(`Failed to mark notification ${notification.id} as read:`, err);
      }
    });
  }

  remove(id: number): void {
    if (!id) {
      // live-only item: remove first unread or first item
      const idx = this.notifications.findIndex(n => !n.isRead);
      const rm = idx >= 0 ? idx : 0;
      if (rm < this.notifications.length) {
        const wasUnread = !this.notifications[rm].isRead;
        this.notifications.splice(rm, 1);
        if (wasUnread) this.unread = Math.max(0, this.unread - 1);
      }
      return;
    }

    this.api.apiNotificationIdDelete(id).subscribe({
      next: () => {
        const idx = this.notifications.findIndex(x => x.id === id);
        if (idx >= 0) {
          const wasUnread = !this.notifications[idx].isRead;
          this.notifications.splice(idx, 1);
          if (wasUnread) this.unread = Math.max(0, this.unread - 1);
        }
        // Refresh unread count from server to ensure accuracy
        this.refreshUnread();
      },
      error: (err) => {
        console.error(`Failed to delete notification ${id}:`, err);
      }
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    this.realtime.stop();
    this.userName = 'Guest';
    this.router.navigate(['/auth/signin']);
  }

  // Manual refresh button handler
  refreshNotifications(): void {
    this.refreshList();
    this.refreshUnread();
  }

  // Debug method to check SignalR connection
  checkSignalRConnection(): void {
    console.log('🔍 Debug: Checking SignalR connection...');
    console.log('📊 Current notifications count:', this.notifications.length);
    console.log('📊 Current unread count:', this.unread);
    
    const status = this.connectionStatus;
    console.log('🔗 SignalR connection status:', status);
    
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    console.log('🔑 Token available:', !!token);
    
    if (status === 'connected') {
      console.log('✅ Connection is active');
      this.realtime.testConnection();
      console.log('⚠️ ISSUE IDENTIFIED: Backend is not sending live notifications!');
      console.log('📋 Backend needs to implement notification sending when notifications are created');
      console.log('📋 Expected: When a notification is created, backend should call:');
      console.log('📋 Clients.User(userId).SendAsync("ReceiveNotification", notification)');
    } else {
      console.log('❌ Connection not active, forcing restart...');
      if (token) {
        this.realtime.forceRestart(token);
      } else {
        console.error('❌ Cannot restart - no authentication token available');
      }
    }
  }

  // ========== Helpers ==========

  private refreshList(): void {
    this.api.apiNotificationGet(5).subscribe({
      next: (response: any) => {
        console.log('Loaded notifications:', response);
        // Handle both array and object with $values array
        const notificationList = Array.isArray(response)
          ? response
          : (response?.$values || []);

        // Clear existing notifications to prevent duplicates
        this.notifications = [];
        
        // Create a Set to track unique notification IDs
        const seenIds = new Set<number>();
        
        this.notifications = notificationList
          .filter(n => {
            if (n.id && seenIds.has(n.id)) {
              return false; // Skip duplicate
            }
            if (n.id) seenIds.add(n.id);
            return true;
          })
          .map(n => ({
            id: n.id,
            message: n.message ?? 'Notification',
            rfqId: n.rfqId,
            createdAt: n.createdAt,
            isRead: !!n.isRead,
            actionUserName: n.actionUserName
          }));
      },
      error: (error) => {
        console.error('Failed to load notifications:', error);
      }
    });
  }

  private refreshUnread(): void {
    this.api.apiNotificationUnreadCountGet('body', false, {
      context: new HttpContext()
    }).subscribe({
      next: (count: any) => {
        console.log('Unread count:', count);
        // OpenAPI generator often types this as any; coerce to number if needed
        this.unread = typeof count === 'number' ? count : Number(count) || 0;
      },
      error: (error) => {
        console.error('Failed to get unread count:', error);
      }
    });
  }
}

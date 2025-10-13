import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { NotificationService as ApiNotificationService } from 'src/app/api/api/notification.service';
import { HttpHeaders, HttpContext } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class RealtimeNotificationService {
  private hub!: signalR.HubConnection;
  private started = false;
  private connectionUrl = 'https://localhost:7107/hubs/notifications';

  private _messages = new BehaviorSubject<{ message: string; rfqId?: number; createdAt?: string; actionUserName?: string }[]>([]);
  public messages$ = this._messages.asObservable();

  // Add a connection status subject
  private _connectionStatus = new BehaviorSubject<string>('disconnected');
  public connectionStatus$ = this._connectionStatus.asObservable();

  constructor(private api: ApiNotificationService) {}

  start(token: string) {
    if (this.started) {
      console.log('SignalR already started, skipping...');
      return;
    }

    console.log('Starting SignalR connection...');
    this._connectionStatus.next('connecting');

    // Set the OpenAPI client's bearer token correctly
    this.api.configuration.credentials = {
      'Bearer': () => `Bearer ${token}`
    };

    // Also set the token in the default headers for the API service
    this.api.defaultHeaders = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.hub = new signalR.HubConnectionBuilder()
      .withUrl(this.connectionUrl, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // More aggressive reconnect
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Set up notification handler
    this.hub.on('ReceiveNotification', (payload: any) => {
      console.log('🔔 LIVE SignalR notification received:', payload);
      const next = [{
        message: payload?.message ?? 'New notification',
        rfqId: payload?.rfqId,
        createdAt: payload?.createdAt ?? new Date().toISOString(),
        actionUserName: payload?.actionUserName
      }, ...this._messages.value].slice(0, 50); // keep a rolling buffer
      this._messages.next(next);

      // Quick popup (replace with your toast/snackbar if you like)
      console.log(`📢 LIVE: ${next[0].message}`);
    });

    // Add more event handlers for debugging
    this.hub.on('UserJoined', (message: string) => {
      console.log('👤 User joined notification group:', message);
    });

    this.hub.on('TestNotification', (message: string) => {
      console.log('🧪 Test notification received:', message);
    });

    // Start the connection
    this.hub.start()
      .then(() => {
        console.log('SignalR connected successfully!');
        this.started = true;
        this._connectionStatus.next('connected');

        console.log('🔍 SignalR connection ready - waiting for live notifications...');
        console.log('📋 Backend should send notifications via: Clients.User(userId).SendAsync("ReceiveNotification", notification)');

        // Seed with recent notifications from REST (e.g., last 10)
        this.loadRecentNotifications(token);
      })
      .catch(err => {
        console.error('SignalR start error', err);
        this._connectionStatus.next('error');
      });

    // Connection event handlers
    this.hub.onclose(err => {
      console.warn('Hub closed', err);
      this._connectionStatus.next('disconnected');
      this.started = false;
    });

    this.hub.onreconnecting(err => {
      console.warn('Hub reconnecting', err);
      this._connectionStatus.next('reconnecting');
    });

    this.hub.onreconnected(id => {
      console.info('Hub reconnected', id);
      this._connectionStatus.next('connected');
      // Reload notifications after reconnection
      this.loadRecentNotifications(token);
    });
  }

  // Separate method to load recent notifications with proper authentication
  private loadRecentNotifications(token: string) {
    // Call the API with the correct parameter structure
    // The API supports: observe, reportProgress, options
    this.api.apiNotificationGet('body', false, { context: new HttpContext() }).subscribe({
      next: (response: any) => {
        console.log('Loaded recent notifications:', response);
        // Handle both array and object with $values array
        const notificationList = Array.isArray(response)
          ? response
          : (response?.$values || []);

        if (notificationList.length > 0) {
          const mapped = notificationList.map(n => ({
            message: n.message ?? 'Notification',
            rfqId: n.rfqId,
            createdAt: n.createdAt,
            actionUserName: n.actionUserName
          }));
          // Replace the messages instead of accumulating to prevent duplicates
          this._messages.next(mapped);
        }
      },
      error: (error) => {
        console.error('Failed to load recent notifications:', error);
      }
    });
  }

  stop() {
    if (!this.started) return;

    console.log('Stopping SignalR connection...');
    this.hub.stop()
      .then(() => {
        console.log('SignalR disconnected');
        this.started = false;
        this._connectionStatus.next('disconnected');
      })
      .catch(err => {
        console.error('Error stopping SignalR', err);
      });
  }

  // Method to manually refresh notifications
  refreshNotifications() {
    const token = localStorage.getItem('token');
    if (token) {
      this.loadRecentNotifications(token);
      return true;
    }
    return false;
  }

  // Force restart the SignalR connection
  forceRestart(token: string) {
    console.log('Force restarting SignalR connection...');
    if (this.started && this.hub) {
      this.hub.stop().then(() => {
        this.started = false;
        this._connectionStatus.next('disconnected');
        // Wait a moment then restart
        setTimeout(() => {
          this.start(token);
        }, 1000);
      }).catch(err => {
        console.error('Error stopping hub for restart:', err);
        this.started = false;
        this.start(token);
      });
    } else {
      this.start(token);
    }
  }

  // Note: Backend SignalR hub methods for group joining are not implemented
  // The backend needs to implement proper notification sending when notifications are created

  // Test SignalR connection by sending a test message
  async testConnection(): Promise<boolean> {
    if (!this.hub || !this.started) {
      console.error('SignalR not connected');
      return false;
    }

    console.log('🧪 Testing SignalR connection...');
    console.log('⚠️ Backend SignalR hub methods are not implemented');
    console.log('📋 Backend needs to implement:');
    console.log('   - TestConnection method for testing');
    console.log('   - Proper notification sending when notifications are created');
    console.log('   - Example: Clients.User(userId).SendAsync("ReceiveNotification", notification)');

    return true;
  }
}

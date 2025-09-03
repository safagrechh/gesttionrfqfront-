// Angular import
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

// project import
import { SpinnerComponent } from './theme/shared/components/spinner/spinner.component';
import { RealtimeNotificationService } from './api/api/realtime-notification.service';
import { ToastNotificationComponent } from './components/toast-notification/toast-notification.component';

@Component({
  selector: 'app-root',
  imports: [SpinnerComponent, RouterModule, ToastNotificationComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private realtime = inject(RealtimeNotificationService);
  private subscriptions: Subscription[] = [];

  title = 'Asteel Flash';
  connectionStatus: string = 'disconnected';

  ngOnInit() {
    // Subscribe to connection status
    this.subscriptions.push(
      this.realtime.connectionStatus$.subscribe(status => {
        console.log('App component - SignalR connection status:', status);
        this.connectionStatus = status;
      })
    );

    // 🔄 Restore SignalR connection if token exists
    const token = localStorage.getItem('token');
    if (token) {
      console.log('App component - Starting SignalR connection with token');
      this.realtime.start(token);
    } else {
      console.warn('App component - No token found, SignalR connection not started');
    }

    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());

    // Stop SignalR connection
    if (this.connectionStatus !== 'disconnected') {
      console.log('App component - Stopping SignalR connection on destroy');
      this.realtime.stop();
    }
  }
}

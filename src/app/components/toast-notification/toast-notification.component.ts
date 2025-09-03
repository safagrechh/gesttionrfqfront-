import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Subscription } from 'rxjs';
import { ToastNotificationService, ToastNotification } from '../../services/toast-notification.service';

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-notification.component.html',
  styleUrls: ['./toast-notification.component.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(-100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class ToastNotificationComponent implements OnInit, OnDestroy {
  toasts: ToastNotification[] = [];
  private subscription: Subscription = new Subscription();

  constructor(
    private toastService: ToastNotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('ToastNotificationComponent initialized');
    this.subscription = this.toastService.toasts$.subscribe(toasts => {
      console.log('ToastNotificationComponent received toasts:', toasts);
      this.toasts = toasts;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  removeToast(id: string) {
    this.toastService.removeToast(id);
  }

  onToastClick(toast: ToastNotification) {
    // Navigate to specific RFQ if rfqId is available, otherwise go to general RFQ list page
    if (toast.rfqId) {
      this.router.navigate(['/rfq-manage/get-rfq', toast.rfqId]);
    } else {
      this.router.navigate(['/rfq-manage/get-rfqs']);
    }
    // Optionally remove the toast after clicking
    this.removeToast(toast.id);
  }

  getToastIcon(type: string): string {
    switch (type) {
      case 'success': return 'pi pi-check-circle';
      case 'info': return 'pi pi-info-circle';
      case 'warning': return 'pi pi-exclamation-triangle';
      case 'error': return 'pi pi-times-circle';
      default: return 'pi pi-bell';
    }
  }

  trackByToastId(index: number, toast: ToastNotification): string {
    return toast.id;
  }
}
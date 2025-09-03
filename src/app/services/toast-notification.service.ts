import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
  actionUserName?: string;
  rfqId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastNotificationService {
  private toasts = new BehaviorSubject<ToastNotification[]>([]);
  public toasts$ = this.toasts.asObservable();

  constructor() {}

  showToast(notification: Omit<ToastNotification, 'id'>) {
    console.log('ToastService.showToast called with:', notification);
    const id = this.generateId();
    const toast: ToastNotification = {
      id,
      duration: 10000, // Default 10 seconds
      ...notification
    };

    const currentToasts = this.toasts.value;
    console.log('Current toasts before adding:', currentToasts);
    this.toasts.next([...currentToasts, toast]);
    console.log('Toasts after adding:', this.toasts.value);

    // Auto-remove after duration with minimum display time
    if (toast.duration && toast.duration > 0) {
      // Ensure minimum display time of 3 seconds
      const minDisplayTime = Math.max(3000, toast.duration);
      console.log(`Setting timeout to remove toast ${id} after ${minDisplayTime}ms`);
      setTimeout(() => {
        console.log(`Auto-removing toast ${id}`);
        this.removeToast(id);
      }, minDisplayTime);
    }
  }

  removeToast(id: string) {
    console.log(`removeToast called for id: ${id}`);
    const currentToasts = this.toasts.value;
    console.log('Current toasts before removal:', currentToasts);
    const filteredToasts = currentToasts.filter(toast => toast.id !== id);
    console.log('Toasts after filtering:', filteredToasts);
    this.toasts.next(filteredToasts);
  }

  clearAll() {
    this.toasts.next([]);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, LoginDto } from 'src/app/api';
import { RealtimeNotificationService } from 'src/app/api/api/realtime-notification.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-auth-signin',
  templateUrl: './auth-signin.component.html',
  styleUrls: ['./auth-signin.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, RouterModule]
})
export default class AuthSigninComponent {
  email = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private realtime: RealtimeNotificationService
  ) {}

  onSubmit() {
    const loginDto: LoginDto = { email: this.email, password: this.password };

    this.authService.apiAuthPost(loginDto).subscribe({
      next: (response) => {
        const token = (response as any)?.token;
        if (token) {
          localStorage.setItem('token', token);
          // Start SignalR realtime notifications
          this.realtime.start(token);
        }
        this.router.navigate(['/rfq-manage/get-rfqs/']);
      },
      error: (err) => {
        console.error('Login failed', err);
      }
    });
  }
}

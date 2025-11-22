import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, LoginDto, UserService, ReclamationService, CreateReclamationDto } from 'src/app/api';
import { ReclamationType } from 'src/app/api';
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
  emailError: string | null = null;
  passwordError: string | null = null;
  authError: string | null = null;
  isSubmitting = false;

  reclaimVisible: boolean = false;
  reclaimEmail: string = '';
  reclaimEmailError: string | null = null;
  reclaimVerifying: boolean = false;
  reclaimUserName: string | null = null;
  reclaimSuccess: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private realtime: RealtimeNotificationService,
    private userService: UserService,
    private reclamationService: ReclamationService
  ) {}

  onEmailInput() { this.emailError = null; this.authError = null; }
  onPasswordInput() { this.passwordError = null; this.authError = null; }

  onSubmit() {
    this.isSubmitting = true;
    const loginDto: LoginDto = { email: this.email, password: this.password };

    this.authService.apiAuthPost(loginDto).subscribe({
      next: (response) => {
        const token = (response as any)?.token;
        if (token) {
          localStorage.setItem('token', token);
          this.realtime.start(token);
        }
        this.isSubmitting = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        const data = err?.error;
        const emailValid = typeof data?.emailValid === 'boolean' ? data.emailValid : undefined;
        const passwordValid = typeof data?.passwordValid === 'boolean' ? data.passwordValid : undefined;
        this.emailError = null; this.passwordError = null; this.authError = null;

        if (emailValid === false) {
          this.emailError = 'Incorrect email address';
        }
        if (passwordValid === false) {
          this.passwordError = 'Incorrect password';
        }
        if (this.emailError === null && this.passwordError === null) {
          const msg = (data?.message ?? err?.message ?? '').toString();
          this.authError = msg || 'Sign-in failed. Check your credentials.';
        }
        this.isSubmitting = false;
      }
    });
  }

  openReclaim() {
    this.reclaimVisible = true;
    this.reclaimEmail = '';
    this.reclaimEmailError = null;
    this.reclaimUserName = null;
    this.reclaimSuccess = null;
  }
  closeReclaim() { this.reclaimVisible = false; }
  onReclaimEmailInput() { this.reclaimEmailError = null; this.reclaimSuccess = null; }

  verifyReclaimEmail() {
    if (!this.reclaimEmail || !/.+@.+\..+/.test(this.reclaimEmail)) {
      this.reclaimEmailError = 'Please enter a valid email address';
      return;
    }
    this.reclaimVerifying = true;
    const probe: LoginDto = { email: this.reclaimEmail, password: ' ' };
    this.authService.apiAuthPost(probe).subscribe({
      next: () => {
        this.reclaimVerifying = false;
        this.reclaimSuccess = null;
      },
      error: (err) => {
        const data = err?.error;
        const emailValid = typeof data?.emailValid === 'boolean' ? data.emailValid : undefined;
        const passwordValid = typeof data?.passwordValid === 'boolean' ? data.passwordValid : undefined;
        if (emailValid === false) {
          this.reclaimEmailError = 'Email not found';
          this.reclaimUserName = null;
        } else if (passwordValid === false) {
          this.userService.apiUserGet().subscribe({
            next: (resp: any) => {
              const list = resp?.$values || [];
              const found = list.find((u: any) => (u.email || '').toLowerCase() === this.reclaimEmail.toLowerCase());
              this.reclaimUserName = found?.nomUser || this.reclaimEmail.split('@')[0];
              this.reclaimEmailError = null;
            },
            error: () => {
              this.reclaimUserName = this.reclaimEmail.split('@')[0];
              this.reclaimEmailError = null;
            }
          });
        }
        this.reclaimVerifying = false;
      }
    });
  }

  confirmReclaim() {
    if (!this.reclaimEmail || !/.+@.+\..+/.test(this.reclaimEmail)) {
      this.reclaimEmailError = 'Please enter a valid email address';
      return;
    }
    this.reclaimVerifying = true;
    this.reclaimEmailError = null;
    this.reclaimSuccess = null;

    const probe: LoginDto = { email: this.reclaimEmail, password: ' ' };
    this.authService.apiAuthPost(probe).subscribe({
      next: () => {
        this.reclaimVerifying = false;
      },
      error: (err) => {
        const data = err?.error;
        const emailValid = typeof data?.emailValid === 'boolean' ? data.emailValid : undefined;
        const passwordValid = typeof data?.passwordValid === 'boolean' ? data.passwordValid : undefined;

        if (emailValid === false) {
          this.reclaimEmailError = 'Email not found';
          this.reclaimUserName = null;
          this.reclaimVerifying = false;
          return;
        }
        if (passwordValid === false) {
          this.userService.apiUserGet().subscribe({
            next: (resp: any) => {
              const list = resp?.$values || [];
              const found = list.find((u: any) => (u.email || '').toLowerCase() === this.reclaimEmail.toLowerCase());
              const name = found?.nomUser || this.reclaimEmail.split('@')[0];
              this.reclaimUserName = name;

              const payload: CreateReclamationDto = {
                title: 'Password reset request',
                message: `User ${this.reclaimEmail} requests a new password. Please email a new password to Mr ${name}.`,
                type: ReclamationType.NUMBER_2
              };
              this.reclamationService.apiReclamationPost(payload).subscribe({
                next: () => {
                  this.reclaimSuccess = `Admin will send you a new password soon, Mr ${name}`;
                  this.reclaimVerifying = false;
                },
                error: () => {
                  this.reclaimEmailError = 'Failed to create reclamation. Please try again later';
                  this.reclaimVerifying = false;
                }
              });
            },
            error: () => {
              const name = this.reclaimEmail.split('@')[0];
              this.reclaimUserName = name;
              const payload: CreateReclamationDto = {
                title: 'Password reset request',
                message: `User ${this.reclaimEmail} requests a new password. Please email a new password to Mr ${name}.`,
                type: ReclamationType.NUMBER_2
              };
              this.reclamationService.apiReclamationPost(payload).subscribe({
                next: () => {
                  this.reclaimSuccess = `Admin will send you a new password soon, Mr ${name}`;
                  this.reclaimVerifying = false;
                },
                error: () => {
                  this.reclaimEmailError = 'Failed to create reclamation. Please try again later';
                  this.reclaimVerifying = false;
                }
              });
            }
          });
        } else {
          this.reclaimVerifying = false;
        }
      }
    });
  }
}

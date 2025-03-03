import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/api'; // Adjust import as needed
import { LoginDto } from 'src/app/api';  // Adjust import as needed
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-auth-signin',
  templateUrl: './auth-signin.component.html',
  styleUrls: ['./auth-signin.component.scss'],
  standalone: true,
    imports: [
      CommonModule,
      FormsModule,
      SharedModule,
      RouterModule,
    ]
})
export default class AuthSigninComponent {

  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  // Handle form submission
  onSubmit() {
    const loginDto: LoginDto = { email: this.email, password: this.password };

    this.authService.apiAuthPost(loginDto).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        // Assuming the token is in the response
        const token = response.token;
        if (token) {
          localStorage.setItem('token', token);  // Save the token to localStorage
        }
        // Navigate to dashboard after successful login
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Login failed', err);
        // Handle error (display error message, etc.)
      }
    });
  }

}

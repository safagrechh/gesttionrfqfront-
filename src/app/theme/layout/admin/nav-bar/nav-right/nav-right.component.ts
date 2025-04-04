import { Component, OnInit, inject } from '@angular/core';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { User, UserService } from 'src/app/api';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-right',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss'],
  providers: [NgbDropdownConfig]
})
export class NavRightComponent implements OnInit {
  userName: string = 'Loading...'; // Default until fetched
  userRole : string ;
  user: any;
  // Map numeric roles to display strings
  roleMap: Record<number, string> = {
    0: 'Validateur',
    1: 'Ingenieur RFQ',
    2: 'Admin',
    3: 'Lecteur'
  };


  constructor(private http: HttpClient , private userService: UserService,   private router: Router,) {
    const config = inject(NgbDropdownConfig);
    config.placement = 'bottom-right';
  }

  ngOnInit(): void {
    this.userService.apiUserMeGet().subscribe({
      next: (user) => {
        this.userName = user.nomUser;
        // Convert numeric role to string
        this.userRole = this.roleMap[user.role] || 'Unknown role';
        console.log('User fetched:', this.user);
      },
      error: (err) => {
        this.userName = 'Guest';
        this.userRole = 'Guest';
        console.error('Error fetching user:', err);
      }
    });
  }

  logout(): void {
    localStorage.removeItem('token'); // Or however you store the JWT
    this.userName = 'Guest';
    this.router.navigate(['/auth/signin']);
   
  }

}

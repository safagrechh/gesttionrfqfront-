import { Component, OnInit, inject } from '@angular/core';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { User, UserService } from 'src/app/api';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
  user: any;

  constructor(private http: HttpClient , private userService: UserService) {
    const config = inject(NgbDropdownConfig);
    config.placement = 'bottom-right';
  }

  ngOnInit(): void {
    this.userService.apiUserMeGet().subscribe({
      next: (user) => {
        this.userName = user.nomUser;
        console.log('User fetched:', this.user);
      },
      error: (err) => {
        this.userName = 'Guest';
        console.error('Error fetching user:', err);
      }
    });
  }

  logout(): void {
    localStorage.removeItem('token'); // Or however you store the JWT
    this.userName = 'Guest';
    window.location.reload(); // Redirect to login page
  }

}

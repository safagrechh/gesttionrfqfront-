import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { RoleU, UserService } from 'src/app/api';
import { UserSummaryDto } from 'src/app/api';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-consulter-users',
  templateUrl: './consulter-users.component.html',
  styleUrls: ['./consulter-users.component.scss'],
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule],
})
export class ConsulterUsersComponent implements OnInit {
  users: Array<UserSummaryDto> = [];
  searchName: string = '';
  filteredUser: UserSummaryDto | null = null;
  selectedUser: UserSummaryDto | null = null;
  searchAttempted: boolean = false; // Track whether a search has been performed

  roleList = [
    { id: 0, name: 'Validateurs' },
    { id: 1, name: 'Ingénieurs' },
    { id: 2, name: 'Administrateurs' },
    { id: 3, name: 'Lecteurs' }
  ];

  constructor(private userService: UserService , private router: Router ) {}

  ngOnInit(): void {
    this.loadAllUsers();
  }

  loadAllUsers(): void {
    this.userService.apiUserGet().subscribe(
      (response: any) => {
        this.users = response.$values;
      },
      (error) => {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
      }
    );
  }

  getUsersByRole(role: number): UserSummaryDto[] {
    return this.users.filter(user => user.role === role);
  }

  searchByName(): void {
    if (!this.searchName.trim()) {
      this.searchAttempted = false;
      this.filteredUser = null;
      return;
    }
    this.searchAttempted = true;
    this.filteredUser = this.users.find(user =>
      user.nomUser?.toLowerCase().includes(this.searchName.toLowerCase())
    ) || null;
  }

  trackTable(index: number, item: UserSummaryDto): number {
    return item.id;
  }

  editUser(user: UserSummaryDto): void {
    this.selectedUser = { ...user };
  }

  cancelEdit(): void {
    this.selectedUser = null;
  }

  updateUser(): void {
    if (this.selectedUser) {
      console.log('Before Conversion:', this.selectedUser);

      // Convert role to number and ensure it's valid
      const roleValue = Number(this.selectedUser.role);
      console.log('Converted Role Value:', roleValue);

      const roleEnumValue: RoleU | undefined = (Object.values(RoleU).includes(roleValue as RoleU) ? (roleValue as RoleU) : undefined);
      console.log('Mapped Role:', roleEnumValue);

      if (roleEnumValue === undefined) {
        console.error('Invalid role assignment.');
        alert('Invalid role selected.');
        return;
      }

      const updatedUser: UserSummaryDto = {
        ...this.selectedUser,
        role: roleEnumValue // Ensure role is properly assigned
      };

      console.log('Updated User DTO:', updatedUser);

      this.userService.apiUserIdPut(updatedUser.id, updatedUser).subscribe(
        () => {
          alert('User updated successfully!');
          this.selectedUser = null;
          this.router.navigate(['/user-manage/get-users']);
        },
        (error) => {
          console.error('Error updating user:', error);
          alert('There was an error updating the user.');
        }
      );
    }
  }



  deleteUser(id: number): void {
    if (confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
      this.userService.apiUserIdDelete(id).subscribe(() => {
        this.users = this.users.filter(user => user.id !== id);
      });
    }
  }

  getRoleName(role: number): string {
    const roleMap: { [key: number]: string } = {
      0: 'Validateur',
      1: 'Ingénieur',
      2: 'Administrateur' ,
      3:'Lecteur'
    };
    return roleMap[role] || 'Inconnu';
  }

}

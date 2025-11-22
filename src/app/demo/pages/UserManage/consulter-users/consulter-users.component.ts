import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { RoleU, UserService } from 'src/app/api';
import { UserSummaryDto, CreateUserDto } from 'src/app/api';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ToastNotificationService } from 'src/app/services/toast-notification.service';

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
  selectedImageName: string | null = null;
  newImageName: string | null = null;
  searchAttempted: boolean = false; // Track whether a search has been performed
  newUser: CreateUserDto = {
    nomUser: '',
    email: '',
    password: '',
    role: 0 as RoleU,
    image: null
  };

  roleList = [
    { id: 0, name: 'Validators' },
    { id: 1, name: 'Engineers' },
    { id: 2, name: 'Administrators' }
  ];

  attemptCreate: boolean = false;
  emailExists: boolean = false;
  passwordStrength: { score: number; label: string; color: string } = { score: 0, label: 'Weak', color: '#ef4444' };
  editPassword: string = '';
  showNewPassword: boolean = false;
  showEditPassword: boolean = false;
  editPasswordStrength: { score: number; label: string; color: string } = { score: 0, label: 'Weak', color: '#ef4444' };

  onNewUserEmailInput(email: string) {
    const e = (email || '').trim().toLowerCase();
    this.emailExists = !!e && this.users.some(u => (u.email || '').trim().toLowerCase() === e);
  }
  onPasswordInput(pw: string) {
    const s = (pw || '');
    let score = 0;
    if (s.length >= 8) score++;
    if (/[a-z]/.test(s)) score++;
    if (/[A-Z]/.test(s)) score++;
    if (/\d/.test(s)) score++;
    if (/[^A-Za-z0-9]/.test(s)) score++;
    const labels = ['Very Weak','Weak','Fair','Good','Strong','Very Strong'];
    const colors = ['#ef4444','#f97316','#f59e0b','#10b981','#3b82f6','#8b5cf6'];
    this.passwordStrength = { score, label: labels[Math.min(score, 5)], color: colors[Math.min(score, 5)] };
  }

  onEditPasswordInput(pw: string) {
    const s = (pw || '');
    let score = 0;
    if (s.length >= 8) score++;
    if (/[a-z]/.test(s)) score++;
    if (/[A-Z]/.test(s)) score++;
    if (/\d/.test(s)) score++;
    if (/[^A-Za-z0-9]/.test(s)) score++;
    const labels = ['Very Weak','Weak','Fair','Good','Strong','Very Strong'];
    const colors = ['#ef4444','#f97316','#f59e0b','#10b981','#3b82f6','#8b5cf6'];
    this.editPasswordStrength = { score, label: labels[Math.min(score, 5)], color: colors[Math.min(score, 5)] };
  }

  private generateStrongPassword(length: number = 12): string {
    const lowers = 'abcdefghijklmnopqrstuvwxyz';
    const uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    const symbols = '!@#$%^&*()-_=+[]{};:,.<>/?';
    const all = lowers + uppers + digits + symbols;
    const pick = (set: string) => set[Math.floor(Math.random() * set.length)];
    const base = [pick(lowers), pick(uppers), pick(digits), pick(symbols)].join('');
    let rest = '';
    for (let i = base.length; i < length; i++) rest += pick(all);
    const pwd = (base + rest).split('').sort(() => Math.random() - 0.5).join('');
    return pwd;
  }

  suggestNewPassword() {
    this.newUser.password = this.generateStrongPassword();
    this.onPasswordInput(this.newUser.password);
    this.showNewPassword = true;
  }

  suggestEditPassword() {
    this.editPassword = this.generateStrongPassword();
    this.showEditPassword = true;
  }

  constructor(private userService: UserService , private router: Router, private toastService: ToastNotificationService ) {}

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
    this.editPassword = '';
  }

  cancelEdit(): void {
    this.selectedUser = null;
    this.selectedImageName = null;
  }

  private readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }

  onSelectedUserImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.selectedUser) return;
    this.readFileAsDataURL(file)
      .then((dataUrl) => {
        this.selectedUser!.image = dataUrl;
        this.selectedImageName = file.name;
      })
      .catch((err) => {
        console.error('Error reading image file:', err);
        this.toastService.showToast({ type: 'error', message: "Erreur lors du chargement de l'image" });
      });
  }

  clearSelectedUserImage(): void {
    if (!this.selectedUser) return;
    this.selectedUser.image = null;
    this.selectedImageName = null;
  }

  onNewUserImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.readFileAsDataURL(file)
      .then((dataUrl) => {
        this.newUser.image = dataUrl;
        this.newImageName = file.name;
      })
      .catch((err) => {
        console.error('Error reading image file:', err);
        this.toastService.showToast({ type: 'error', message: "Erreur lors du chargement de l'image" });
      });
  }

  updateUser(): void {
    if (!this.selectedUser) return;

    const roleValue = Number(this.selectedUser.role);
    const roleEnumValue: RoleU | undefined = (Object.values(RoleU).includes(roleValue as RoleU) ? (roleValue as RoleU) : undefined);
    if (roleEnumValue === undefined) {
      this.toastService.showToast({ type: 'error', message: 'Invalid role selected.' });
      return;
    }

    const payload = {
      id: this.selectedUser.id,
      nomUser: this.selectedUser.nomUser?.toString().trim(),
      email: this.selectedUser.email?.toString().trim(),
      role: roleEnumValue,
      image: this.selectedUser.image ?? null,
      password: this.editPassword ? this.editPassword.toString() : null
    };

    this.userService.apiUserIdPut(payload.id!, payload).subscribe({
      next: () => {
        this.toastService.showToast({ type: 'success', message: 'Utilisateur mis à jour avec succès' });
        this.selectedUser = null;
        this.editPassword = '';
        this.router.navigate(['/user-manage/get-users']);
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.toastService.showToast({ type: 'error', message: 'Erreur lors de la mise à jour de l\'utilisateur' });
      }
    });
  }

  createUser(): void {
    this.attemptCreate = true;
    const { nomUser, email, password, role } = this.newUser;
    if (!nomUser || !email || !password || role === undefined || role === null || this.emailExists) {
      this.toastService.showToast({ type: 'warning', message: 'Please fill all required fields and ensure email is unique.' });
      return;
    }

    const roleValue = Number(role);
    const roleEnumValue: RoleU | undefined = (Object.values(RoleU).includes(roleValue as RoleU) ? (roleValue as RoleU) : undefined);
    if (roleEnumValue === undefined) {
      this.toastService.showToast({ type: 'error', message: 'Invalid role selected.' });
      return;
    }

    const payload: CreateUserDto = {
      nomUser: nomUser?.toString().trim(),
      email: email?.toString().trim(),
      password: password?.toString(),
      role: roleEnumValue,
      image: this.newUser.image ?? null
    };

    this.userService.apiUserPost(payload).subscribe({
      next: () => {
        this.toastService.showToast({ type: 'success', message: 'Utilisateur ajouté avec succès' });
        this.loadAllUsers();
        this.newUser = { nomUser: '', email: '', password: '', role: 0 as RoleU, image: null };
        this.newImageName = null;
        this.emailExists = false;
        this.attemptCreate = false;
        this.passwordStrength = { score: 0, label: 'Weak', color: '#ef4444' };
      },
      error: (error) => {
        const msg = (error?.error || error?.message || '').toString().toLowerCase();
        if (error?.status === 409 || msg.includes('email') && msg.includes('exist')) {
          this.emailExists = true;
        }
        this.toastService.showToast({ type: 'error', message: 'Erreur lors de l\'ajout de l\'utilisateur' });
      }
    });
  }



  deleteUser(id: number): void {
    if (confirm("Are you sure you want to delete this user?")) {
      this.userService.apiUserIdDelete(id).subscribe(() => {
        this.users = this.users.filter(user => user.id !== id);
      });
    }
  }

  getRoleName(role: number): string {
    const roleMap: { [key: number]: string } = {
      0: 'Validator',
      1: 'Engineer',
      2: 'Administrator',
      3: 'Viewer'
    };
    return roleMap[role] || 'Unknown';
  }

}

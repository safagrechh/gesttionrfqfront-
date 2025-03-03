import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from 'src/app/api'; // Import from the generated service
import { CreateUserDto } from 'src/app/api'; // Import CreateUserDto
import { Router } from '@angular/router';
import { RoleU } from 'src/app/api'; // Import RoleU
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule ,
    SharedModule ,

  ]
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  roles = [
    { value: RoleU.NUMBER_0, label: 'Validateur' },
    { value: RoleU.NUMBER_1, label: 'Ingernieur RFQ' },
    { value: RoleU.NUMBER_2, label: 'Admin' },
    { value: RoleU.NUMBER_3, label: 'Lecteur' }
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService, // Injecting the generated UserService
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      nomUser: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required] // Adding role field
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      console.log('Form Values:', this.userForm.value);

      const roleValue = Number(this.userForm.value.role); // Convert role to number
      console.log('Role Value:', roleValue);

      // Validate role and ensure it's correctly mapped
      const roleEnumValue: RoleU | undefined = (Object.values(RoleU).includes(roleValue as RoleU) ? (roleValue as RoleU) : undefined);
      console.log('Mapped Role:', roleEnumValue);

      const createUserDto: CreateUserDto = {
        nomUser: this.userForm.value.nomUser,
        email: this.userForm.value.email,
        password: this.userForm.value.password,
        role: roleEnumValue // Ensure it's correctly assigned
      };

      console.log('User DTO:', createUserDto);

      if (roleEnumValue === undefined) {
        console.error('Invalid role assignment.');
        alert('Invalid role selected.');
        return;
      }

      this.userService.apiUserPost(createUserDto).subscribe(
        (response) => {
          alert('User added successfully!');
          this.router.navigate(['/']);
        },
        (error) => {
          console.error('Error adding user:', error);
          alert('There was an error adding the user.');
        }
      );
    }
  }




}

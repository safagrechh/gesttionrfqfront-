import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { UserFormComponent } from './user-form/user-form.component'; // Import the standalone component

const routes: Routes = [
  {
    path: 'user-form',
    component: UserFormComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    UserFormComponent 
  ]
})
export class UserManageModule {}

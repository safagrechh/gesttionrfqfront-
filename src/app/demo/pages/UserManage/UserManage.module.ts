import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { UserFormComponent } from './user-form/user-form.component'; // Import the standalone component
import { ConsulterUsersComponent } from './consulter-users/consulter-users.component';

const routes: Routes = [
  {
    path: 'user-form',
    component: UserFormComponent
  },
  {
    path: 'get-users',
    component: ConsulterUsersComponent
  },


];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    UserFormComponent ,
    ConsulterUsersComponent
  ]
})
export class UserManageModule {}

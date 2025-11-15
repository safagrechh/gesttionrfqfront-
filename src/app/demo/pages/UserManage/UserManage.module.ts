import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ConsulterUsersComponent } from './consulter-users/consulter-users.component';

const routes: Routes = [
  {
    path: '',
    component: ConsulterUsersComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    ConsulterUsersComponent
  ]
})
export class UserManageModule {}

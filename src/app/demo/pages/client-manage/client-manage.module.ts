import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientManageComponent } from './client-manage/client-manage.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: ClientManageComponent
  }

];

@NgModule({
  declarations: [],
  imports: [
    CommonModule ,
    ClientManageComponent ,
    RouterModule.forChild(routes),
  ]
})
export class ClientManageModule { }

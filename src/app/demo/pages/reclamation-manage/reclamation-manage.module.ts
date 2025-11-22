import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReclamationManageComponent } from './reclamation-manage/reclamation-manage.component';

const routes: Routes = [
  {
    path: '',
    component: ReclamationManageComponent
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReclamationManageComponent,
    RouterModule.forChild(routes)
  ]
})
export class ReclamationManageModule {}
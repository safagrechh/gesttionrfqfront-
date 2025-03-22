import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MaterialLeadersComponent } from './material-leaders/material-leaders.component';
import { TestLeadersComponent } from './test-leaders/test-leaders.component';
import { ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: 'material-leaders',
    component: MaterialLeadersComponent
  },

  {
    path: 'test-leaders',
    component: TestLeadersComponent
  }


];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    MaterialLeadersComponent,
    TestLeadersComponent

  ]
})
export class WorkerManageModule { }

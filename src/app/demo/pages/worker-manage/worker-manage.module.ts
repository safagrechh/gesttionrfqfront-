import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MaterialLeadersComponent } from './material-leaders/material-leaders.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MarketsegmentComponent } from './marketsegment/marketsegment.component';

const routes: Routes = [
  {
    path: 'material-leaders',
    component: MaterialLeadersComponent
  },

  {
    path: 'market-segment',
    component: MarketsegmentComponent
  }


];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    MaterialLeadersComponent,
    MarketsegmentComponent

  ]
})
export class WorkerManageModule { }

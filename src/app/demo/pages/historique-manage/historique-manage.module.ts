import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HistoriqueActionsComponent } from './historique-actions/historique-actions.component';

const routes: Routes = [
  {
    path: 'historique-actions',
    component: HistoriqueActionsComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HistoriqueActionsComponent
  ]
})
export class HistoriqueManageModule {}
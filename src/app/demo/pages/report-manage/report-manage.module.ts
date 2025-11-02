import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { GenerateReportComponent } from './generer-rapport/generate-report.component';

const routes: Routes = [
  {
    path: 'generer-rapport',
    component: GenerateReportComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    GenerateReportComponent
  ]
})
export class ReportManageModule {}
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CreateRFQComponent } from './create-rfq/create-rfq.component';
import { ReactiveFormsModule } from '@angular/forms';



const routes: Routes = [
  {
    path: 'create-rfq',
    component: CreateRFQComponent
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CreateRFQComponent,
    ReactiveFormsModule,
  ]
})
export class RFQModule { }

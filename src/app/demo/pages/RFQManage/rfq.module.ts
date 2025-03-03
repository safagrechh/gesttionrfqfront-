import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CreateRFQComponent } from './create-rfq/create-rfq.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ConsulterRFQComponent } from './consulter-rfq/consulter-rfq.component';



const routes: Routes = [
  {
    path: 'create-rfq',
    component: CreateRFQComponent
  },

  {
    path: 'get-rfqs',
    component:ConsulterRFQComponent
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CreateRFQComponent,
    ReactiveFormsModule,
    ConsulterRFQComponent
  ]
})
export class RFQModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CreateRFQComponent } from './create-rfq/create-rfq.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ConsulterRFQComponent } from './consulter-rfq/consulter-rfq.component';
import { BrouillonsComponent } from './brouillons/brouillons.component';
import { RFQComponent } from './rfq/rfq.component';



const routes: Routes = [
  {
    path: 'create-rfq',
    component: CreateRFQComponent
  },

  {
    path: 'get-rfqs',
    component:ConsulterRFQComponent
  } ,
  {
    path: 'get-brouillons',
    component:BrouillonsComponent
  },
  {
    path: 'get-rfq/:id',
    component:RFQComponent
  }


];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CreateRFQComponent,
    ReactiveFormsModule,
    ConsulterRFQComponent,
    BrouillonsComponent,
    RFQComponent
  ]
})
export class RFQModule { }

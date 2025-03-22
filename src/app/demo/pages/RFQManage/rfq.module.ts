import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CreateRFQComponent } from './create-rfq/create-rfq.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ConsulterRFQComponent } from './consulter-rfq/consulter-rfq.component';
import { RFQComponent } from './rfq/rfq.component';
import { EditRFQComponent } from './edit-rfq/edit-rfq.component';
import { CreateVersionComponent } from './create-version/create-version.component';



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
    path: 'get-rfq/:id',
    component:RFQComponent
  } ,
  {
    path: 'edit-rfq/:id',
    component:EditRFQComponent
  } ,
  {
    path: 'ajouter-version/:id',
    component: CreateVersionComponent
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
    RFQComponent ,
    EditRFQComponent
  ]
})
export class RFQModule { }

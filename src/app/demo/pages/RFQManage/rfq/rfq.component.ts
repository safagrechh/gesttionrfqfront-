import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RFQService, UserService } from 'src/app/api';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-rfq',
  templateUrl: './rfq.component.html',
  styleUrls: ['./rfq.component.scss'],
   standalone: true,
    imports: [CommonModule, ReactiveFormsModule, SharedModule],
})
export class RFQComponent implements OnInit {
  rfqForm!: FormGroup;
  rfq: any;
  isReadOnly = true;
  idrfq :number ;
  isValidateur: boolean = false;



  constructor(
    private fb: FormBuilder,
    private rfqService: RFQService,
    private route: ActivatedRoute ,
    private userService: UserService,

  ) {}

  ngOnInit(): void {
    this.rfqForm = this.fb.group({
      quoteName: [{ value: '', disabled: true }],
      cq: [{ value: '', disabled: true }],
      numRefQuoted: [{ value: '', disabled: true }],
      client: [{ value: '', disabled: true }],
      statut: [{ value: '', disabled: true }],
      materialLeader: [{ value: '', disabled: true }],
      testLeader: [{ value: '', disabled: true }],
      marketSegment: [{ value: '', disabled: true }],
      ingenieurRFQ: [{ value: '', disabled: true }],
      vaLeader: [{ value: '', disabled: true }],
      dateCreation: [{ value: '', disabled: true }],
      sopDate: [{ value: '', disabled: true }],
      koDate: [{ value: '', disabled: true }],
      customerDataDate: [{ value: '', disabled: true }],
      mdDate: [{ value: '', disabled: true }],
      mrDate: [{ value: '', disabled: true }],
      tdDate: [{ value: '', disabled: true }],
      trDate: [{ value: '', disabled: true }],
      ldDate: [{ value: '', disabled: true }],
      lrDate: [{ value: '', disabled: true }],
      cdDate: [{ value: '', disabled: true }],
      approvalDate: [{ value: '', disabled: true }]
    });

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.loadRFQDetails(+id);
      this.idrfq= +id
    }
    this.checkUserRole();
  }

  checkUserRole() {
    this.userService.apiUserMeGet().subscribe(user => {
      console.log('Authenticated User:', user);
      this.isValidateur = user.role === 0;
    });
  }

  loadRFQDetails(id: number) {
    this.rfqService.apiRFQIdGet(id).subscribe((data) => {
      this.rfq = data;
      console.log(this.rfq);
      this.rfqForm.patchValue(data);
    });
  }

  onSubmitValider(){
    this.rfqService.apiRFQIdValiderPost(this.idrfq).subscribe(() => {
      alert('RFQ validée avec succès');
      this.loadRFQDetails(this.idrfq);
    });
  }

  onSubmitEditer(){}

  onSubmitRejeter(){}
}

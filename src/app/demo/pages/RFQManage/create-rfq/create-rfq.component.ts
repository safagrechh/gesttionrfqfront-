import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientService, ClientSummaryDto, MarketSegment, UserSummaryDto, WorkerDto } from 'src/app/api';
import { WorkerService, UserService, MarketSegmentService, RFQService, CreateRFQDto } from 'src/app/api';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-create-rfq',
  templateUrl: './create-rfq.component.html',
  styleUrls: ['./create-rfq.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule],
})
export class CreateRFQComponent implements OnInit {
  rfqForm: FormGroup;
  clients: ClientSummaryDto[] = [];
  validators: UserSummaryDto[] = [];
  ingenieurs: UserSummaryDto[] = [];
  ws :WorkerDto[] = [];
  materialLeaders: WorkerDto[] = [];
  testers: WorkerDto[] = [];
  marketSegments: MarketSegment[] = [];
  isValidateur: boolean = false;

  statutOptions = [
    { value: 0, label: 'Complete' },
    { value: 1, label: 'In Progress' },
    { value: 2, label: 'Not Started' }
  ];



  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private userService: UserService,
    private workerService: WorkerService,
    private marketSegmentService: MarketSegmentService,
    private rfqService: RFQService
  ) {}

  ngOnInit(): void {
    this.rfqForm = this.fb.group({
      quoteName: ['', Validators.required],
      numRefQuoted: ['', Validators.required],
      statut: ['', Validators.required],
      clientId: ['', Validators.required],
      validateurId: ['', Validators.required],
      ingenieurRFQId: ['', Validators.required],
      marketSegmentId: ['', Validators.required],
      materialLeaderId: ['', Validators.required],
      testLeaderId: ['', Validators.required],
      estV: ['', [Validators.required, Validators.min(0)]],  // Add estV
      maxV: ['', [Validators.required, Validators.min(0)]],  // Add maxV
      sopDate: [''],
      koDate: [''],
      customerDataDate: [''],
      mdDate: [''],
      mrDate: [''],
      tdDate: [''],
      trDate: [''],
      ldDate: [''],
      lrDate: [''],
      cdDate: [''],
      approvalDate: ['']
    });

    this.getClients();
    this.getValidators();
    this.getIngenieurs();
    this.getWorkers();
    this.getMarketSegments();
    this.checkUserRole();
  }

  checkUserRole() {
    this.userService.apiUserMeGet().subscribe(user => {
      console.log('Authenticated User:', user);
      this.isValidateur = user.role === 0;
    });
  }
  getClients() {
    this.clientService.apiClientGet().subscribe(response => {
      console.log('Clients Response:', response);
      this.clients = (response as any).$values || [];
    });
  }



  getValidators() {
    this.userService.apiUserByRoleRoleGet('Validateur').subscribe(validators => {
      console.log('Validators:', validators); // Debugging log
      this.validators =  (validators as any).$values || [];
    });
  }

  getIngenieurs() {
    this.userService.apiUserByRoleRoleGet('IngenieurRFQ').subscribe(ingenieurs => {
      console.log('Ingenieurs:', ingenieurs); // Debugging log
      this.ingenieurs =  (ingenieurs as any).$values || [];
    });
  }

  getWorkers() {
    this.workerService.apiWorkerGet().subscribe(workers => {
      console.log('Workers:', workers); // Debugging log
      this.ws = (workers as any).$values || [];
      this.materialLeaders = this.ws.filter(w => w.role === 0);
      this.testers = this.ws.filter(w => w.role === 1);
    });
  }

  getMarketSegments() {
    this.marketSegmentService.apiMarketSegmentGet().subscribe(segments => {
      console.log('Market Segments:', segments); // Debugging log

      this.marketSegments = (segments as any).$values || [];;
    });
  }

  onSubmit(): void {
    console.log('Form content:', this.rfqForm.value);
    console.log(this.rfqForm.valid); // Check form validity
    if (this.rfqForm.invalid) return;

    // Ensure the statut is a number (it could be a string from the select)
    const formValue = this.rfqForm.value;
    formValue.statut = Number(formValue.statut); // Convert to number if it's a string

    const createRFQDto: CreateRFQDto = formValue;
    this.rfqService.apiRFQPost(createRFQDto).subscribe(response => {
      console.log('RFQ created successfully', response);
      alert('RFQ added successfully!');
    }, error => {
      console.error('Error creating RFQ', error);
      alert('There was an error adding the RFQ.');

    });
  }

  onSubmitValider(): void {
    console.log('Form content for validation:', this.rfqForm.value);
    console.log(this.rfqForm.valid); // Check form validity
    if (this.rfqForm.invalid) return;

    // Assurer que le statut soit un nombre
    const formValue = this.rfqForm.value;
    formValue.statut = Number(formValue.statut); // Convertir en nombre si c'est une chaîne

    const createRFQDto: CreateRFQDto = formValue;

    // Appeler la méthode apiRFQCreateValidePost du service
    this.rfqService.apiRFQCreateValidePost(createRFQDto).subscribe(response => {
      console.log('RFQ  saved and validated successfully', response);
      alert('RFQ  Saved and validated successfully!');
    }, error => {
      console.error('Error Saving and validating RFQ', error);
      alert('There was an error validating the RFQ.');
    });
  }


}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientService, ClientSummaryDto, MarketSegment, RFQDetailsDto, UserSummaryDto, WorkerDto   } from 'src/app/api';
import { WorkerService, UserService, MarketSegmentService, RFQService } from 'src/app/api';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { Router } from '@angular/router';


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
  // validators: UserSummaryDto[] = [];
  ingenieurs: UserSummaryDto[] = [];
  ws :WorkerDto[] = [];
  materialLeaders: WorkerDto[] = [];
  testers: WorkerDto[] = [];
  marketSegments: MarketSegment[] = [];
  isValidateur: boolean = false;
  selectedClient: any;
  rfqs: Array<RFQDetailsDto> = [];
  cqExists: boolean = false;
  selectedFile: File | null = null;
  acceptedFileTypes = '.pdf,.xml';
  maxFileSizeMB = 10;

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
    private rfqService: RFQService ,
    private router: Router,


  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.getClients();
    this.getIngenieurs();
    this.getWorkers();
    this.getMarketSegments();
    this.checkUserRole();
    this.fetchRFQDetails();

  }

  initializeForm(): void {
    this.rfqForm = this.fb.group({
      quoteName: ['', Validators.required],
      numRefQuoted: ['', Validators.required],
      clientId: ['', Validators.required],
      valeaderId: ['', Validators.required],
      ingenieurRFQId: ['', Validators.required],
      marketSegmentId: ['', Validators.required],
      materialLeaderId: ['', Validators.required],
      testLeaderId: ['', Validators.required],
      estV: ['', [Validators.required, Validators.min(0)]],
      maxV: ['', [Validators.required, Validators.min(0)]],
      sopDate: ['', Validators.required],
      koDate: ['', Validators.required],
      customerDataDate: ['', Validators.required],
      mdDate: ['', Validators.required],
      mrDate: [''],
      tdDate: ['', Validators.required],
      trDate: [''],
      ldDate: ['', Validators.required],
      lrDate: [''],
      cdDate: ['', Validators.required],
      cq: ['', Validators.required],
      file: [null] // Add file control
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];

    if (!file) return;

    // Get file extension


    if (file.size > this.maxFileSizeMB * 1024 * 1024) {
        alert(`File size exceeds ${this.maxFileSizeMB}MB limit`);
        return;
    }

    this.selectedFile = file;
    this.rfqForm.patchValue({ file: file });
    this.rfqForm.get('file')?.updateValueAndValidity();
}
clearFile(): void {
  this.selectedFile = null;
  this.rfqForm.patchValue({ file: null });
  // Reset the file input element
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  if (fileInput) fileInput.value = '';
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
  onClientChange(event: Event) {
    const selectedClientId = Number((event.target as HTMLSelectElement).value);
    this.selectedClient = this.clients.find(client => client.id === selectedClientId);
  }



  // getValidators() {
  //   this.userService.apiUserByRoleRoleGet('Validateur').subscribe(validators => {
  //     console.log('Validators:', validators); // Debugging log
  //     this.validators =  (validators as any).$values || [];
  //   });
  // }

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
    if (this.rfqForm.invalid) {
      Object.keys(this.rfqForm.controls).forEach(field => {
        const control = this.rfqForm.get(field);
        if (control instanceof FormControl) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.onCQChange();
    if (this.cqExists) {
      alert('CQ already exists. Please change it to proceed.');
      return;
    }

    const formValue = this.rfqForm.value;

    this.rfqService.apiRFQPost(
      formValue.cq,
      formValue.quoteName,
      formValue.numRefQuoted,
      formValue.sopDate,
      formValue.maxV,
      formValue.estV,
      formValue.koDate,
      formValue.customerDataDate,
      formValue.mdDate,
      formValue.mrDate,
      formValue.tdDate,
      formValue.trDate,
      formValue.ldDate,
      formValue.lrDate,
      formValue.cdDate,
      formValue.approvalDate,
      new Date().toISOString(), // dateCreation
      formValue.statut,
      formValue.materialLeaderId,
      formValue.testLeaderId,
      formValue.marketSegmentId,
      formValue.clientId,
      formValue.ingenieurRFQId,
      formValue.valeaderId,
      this.selectedFile, // file
      false, // brouillon
      'body', // observe
      false, // reportProgress
      {} // options
    ).subscribe({
      next: (response) => {
        console.log('RFQ created successfully', response);
        alert('RFQ added successfully!');
        this.router.navigate(['/rfq-manage/get-rfqs']);
      },
      error: (error) => {
        console.error('Error creating RFQ', error);
        alert('There was an error adding the RFQ.');
      }
    });
  }


  onSubmitBrouillon(): void {
    this.onCQChange();
    if (this.cqExists) {
      alert('CQ already exists. Please change it to proceed.');
      return;
    }

    const draftData = {
      ...this.rfqForm.value,
      // No need for null fallbacks since all fields are optional
    };

    this.rfqService.apiRFQDraftPost(draftData).subscribe({
      next: (response) => {
        console.log('Draft saved successfully', response);
        this.router.navigate(['/rfq-manage/get-rfqs']);
      },
      error: (error) => {
        console.error('Error saving draft:', error);
        alert('Error saving draft. Please try again.');
      }
    });
  }

  onSubmitValider(): void {
    if (this.rfqForm.invalid) {
      Object.keys(this.rfqForm.controls).forEach(field => {
        const control = this.rfqForm.get(field);
        if (control instanceof FormControl) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.onCQChange();
    if (this.cqExists) {
      alert('CQ already exists. Please change it to proceed.');
      return;
    }

    const formValue = this.rfqForm.value;

    this.rfqService.apiRFQCreateValidePost(
      formValue.cq,
      formValue.quoteName,
      formValue.numRefQuoted,
      formValue.sopDate,
      formValue.maxV,
      formValue.estV,
      formValue.koDate,
      formValue.customerDataDate,
      formValue.mdDate,
      formValue.mrDate,
      formValue.tdDate,
      formValue.trDate,
      formValue.ldDate,
      formValue.lrDate,
      formValue.cdDate,
      formValue.approvalDate,
      new Date().toISOString(), // dateCreation
      formValue.statut,
      formValue.materialLeaderId,
      formValue.testLeaderId,
      formValue.marketSegmentId,
      formValue.clientId,
      formValue.ingenieurRFQId,
      formValue.valeaderId,
      this.selectedFile, // file
      false, // brouillon
      'body', // observe
      false, // reportProgress
      {} // options
    ).subscribe({
      next: (response) => {
        console.log('RFQ created and validated successfully', response);
        alert('RFQ added and validated  successfully!');
        this.router.navigate(['/rfq-manage/get-rfqs']);
      },
      error: (error) => {
        console.error('Error creating RFQ', error);
        alert('There was an error adding the RFQ.');
      }
    });
  }


  fetchRFQDetails(): void {
    this.rfqService.apiRFQGet().subscribe(
      (response: any) => {
        this.rfqs = response.$values;
      },
      (error) => {
        console.error('Erreur lors de la récupération des RFQ:', error);
      }
    );
  }

  onCQChange() {
    const cqValue = Number(this.rfqForm.get('cq')?.value);  // Ensure it's a number
    console.log('CQ value changed:', cqValue);
    console.log('Existing RFQs:', this.rfqs); // Log the entire RFQ list

    // Check if the CQ value exists in any of the RFQs, ignoring null values
    this.cqExists = this.rfqs.some(rfq => rfq.cq !== null && Number(rfq.cq) === cqValue);
    console.log('Does CQ exist?', this.cqExists);
  }




}

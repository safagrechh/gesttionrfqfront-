import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientService, ClientSummaryDto, MarketSegment, RFQDetailsDto, UserSummaryDto, WorkerDto   } from 'src/app/api';
import { WorkerService, UserService, MarketSegmentService, RFQService } from 'src/app/api';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { Router } from '@angular/router';
import { HttpContext } from '@angular/common/http';
import { ToastNotificationService } from 'src/app/services/toast-notification.service';


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
    private toastService: ToastNotificationService


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
      // Champs RFQ principaux (alignés avec EditRFQ)
      quoteName: ['', Validators.required],
      numRefQuoted: ['', Validators.required],

      // Sélections obligatoires
      clientId: [null, Validators.required],
      valeaderId: ['', Validators.required],
      ingenieurRFQId: ['', Validators.required],
      marketSegmentId: ['', Validators.required],
      materialLeaderId: ['', Validators.required],
      testLeaderId: ['', Validators.required],

      // Valeurs numériques avec contrainte min(0)
      estV: ['', [Validators.required, Validators.min(0)]],
      maxV: ['', [Validators.required, Validators.min(0)]],

      // Dates obligatoires (comme EditRFQ)
      sopDate: ['', Validators.required],
      koDate: ['', Validators.required],
      customerDataDate: ['', Validators.required],
      mdDate: ['', Validators.required],
      tdDate: ['', Validators.required],
      ldDate: ['', Validators.required],
      cdDate: ['', Validators.required],

      // Dates optionnelles (non requises dans EditRFQ)
      mrDate: [''],
      trDate: [''],
      lrDate: [''],

      // Identifiants/contrôles additionnels
      cq: ['', Validators.required],
      file: [null] // Contrôle de fichier
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];

    if (!file) return;

    // Get file extension


    if (file.size > this.maxFileSizeMB * 1024 * 1024) {
        this.toastService.showToast({
          message: `File size exceeds ${this.maxFileSizeMB}MB limit`,
          type: 'warning',
          duration: 7000
        });
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
      this.toastService.showToast({
        message: 'Veuillez corriger les champs requis avant de soumettre.',
        type: 'warning',
        duration: 6000
      });
      return;
    }

    this.onCQChange();
    if (this.cqExists) {
      this.toastService.showToast({
        message: 'CQ already exists. Please change it to proceed.',
        type: 'warning',
        duration: 8000
      });
      return;
    }

    const formValue = this.rfqForm.value;

    // Convert dates to ISO strings
    const isoDateFields = ['sopDate', 'koDate', 'customerDataDate', 'mdDate',
                          'mrDate', 'tdDate', 'trDate', 'ldDate', 'lrDate',
                          'cdDate', 'approvalDate'];

    isoDateFields.forEach(field => {
      if (formValue[field]) {
        formValue[field] = new Date(formValue[field]).toISOString();
      }
    });

    // Call the service with proper parameters
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
      this.selectedFile, // file - must be a Blob or File object
      false, // brouillon
      'body', // observe
      false, // reportProgress
      {
        // Optional options
        httpHeaderAccept: 'application/json',
        context: new HttpContext()
      }
    ).subscribe({
      next: (response) => {
        console.log('RFQ created successfully', response);
        this.toastService.showToast({
          message: 'RFQ added successfully!',
          type: 'success',
          duration: 6000,
          rfqId: (response?.id ?? undefined)?.toString()
        });
        this.router.navigate(['/rfq-manage/get-rfqs']);
      },
      error: (error) => {
        console.error('Error creating RFQ', error);
        // More detailed error handling
        if (error.error) {
          this.toastService.showToast({
            message: `Error: ${error.error.title || error.error.message || 'Unknown error'}`,
            type: 'error',
            duration: 9000
          });
        } else {
          this.toastService.showToast({
            message: 'There was an error adding the RFQ.',
            type: 'error',
            duration: 7000
          });
        }
      }
    });
  }

  onSubmitBrouillon(): void {
    this.onCQChange();
    if (this.cqExists) {
      alert('CQ already exists. Please change it to proceed.');
      return;
    }

    const formValue = { ...this.rfqForm.value };

    const toNumberOrUndefined = (v: any) => (v === null || v === undefined || v === '' ? undefined : Number(v));

    // Convert dates to ISO strings for fields expected by the API
    const isoDateFields = [
      'sopDate', 'koDate', 'customerDataDate', 'mdDate', 'mrDate',
      'tdDate', 'trDate', 'ldDate', 'lrDate', 'cdDate'
    ];
    isoDateFields.forEach(field => {
      if (formValue[field]) {
        formValue[field] = new Date(formValue[field]).toISOString();
      }
    });

    this.rfqService.apiRFQDraftPost(
      toNumberOrUndefined(formValue.cq),
      formValue.quoteName,
      toNumberOrUndefined(formValue.numRefQuoted),
      formValue.sopDate,
      toNumberOrUndefined(formValue.maxV),
      toNumberOrUndefined(formValue.estV),
      formValue.koDate,
      formValue.customerDataDate,
      formValue.mdDate,
      formValue.mrDate,
      formValue.tdDate,
      formValue.trDate,
      formValue.ldDate,
      formValue.lrDate,
      formValue.cdDate,
      toNumberOrUndefined(formValue.materialLeaderId),
      toNumberOrUndefined(formValue.testLeaderId),
      toNumberOrUndefined(formValue.marketSegmentId),
      toNumberOrUndefined(formValue.clientId),
      toNumberOrUndefined(formValue.ingenieurRFQId),
      toNumberOrUndefined(formValue.valeaderId),
      this.selectedFile || undefined,
      'body',
      false,
      { httpHeaderAccept: 'application/json', context: new HttpContext() }
    ).subscribe({
      next: (response) => {
        console.log('Draft saved successfully', response);
        this.toastService.showToast({
          message: 'Draft saved successfully',
          type: 'success',
          duration: 6000,
          rfqId: (response?.id ?? undefined)?.toString()
        });
        this.router.navigate(['/rfq-manage/get-rfqs']);
      },
      error: (error) => {
        console.error('Error saving draft:', error);
        this.toastService.showToast({
          message: 'Error saving draft. Please try again.',
          type: 'error',
          duration: 7000
        });
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
        this.toastService.showToast({
          message: 'RFQ added and validated successfully!',
          type: 'success',
          duration: 6000,
          rfqId: (response?.id ?? undefined)?.toString()
        });
        this.router.navigate(['/rfq-manage/get-rfqs']);
      },
      error: (error) => {
        console.error('Error creating RFQ', error);
        this.toastService.showToast({
          message: 'There was an error adding the RFQ.',
          type: 'error',
          duration: 7000
        });
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

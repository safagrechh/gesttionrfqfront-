import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService, ClientSummaryDto, MarketSegment, MarketSegmentService, RFQDetailsDto, RFQService, UserService, UserSummaryDto, WorkerDto, WorkerService } from 'src/app/api';
import { UpdateRFQDto } from 'src/app/api';
import { Statut } from 'src/app/api';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-edit-rfq',
  templateUrl: './edit-rfq.component.html',
  styleUrls: ['./edit-rfq.component.scss'] ,
   imports: [CommonModule, ReactiveFormsModule, SharedModule] ,
   providers: [DatePipe]
})
export class EditRFQComponent implements OnInit {
  editForm!: FormGroup;
  rfqId!: number;
  selectedClient: any;
  clients: ClientSummaryDto[] = [];
  ingenieurs: UserSummaryDto[] = [];
  materialLeaders: WorkerDto[] = [];
  testers: WorkerDto[] = [];
  marketSegments: MarketSegment[] = [];
  ws :WorkerDto[] = [];
  isBrouillon: boolean = false;
   rfqs: Array<RFQDetailsDto> = [];
   cqExists: boolean = false;
   cq : number ;
   selectedFile: File | null = null;
   acceptedFileTypes = '.pdf,.xml';
   maxFileSizeMB = 10;
   existingFileName: string = '';
   existingFileSize: string = '';
   existingFileType: string = '';




  statutOptions = [
    { value: 0, label: 'Complete' },
    { value: 1, label: 'In Progress' },
    { value: 2, label: 'Not Started' }
  ];


  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private rfqService: RFQService ,
    private clientService: ClientService,
    private userService: UserService,
    private workerService: WorkerService,
    private marketSegmentService: MarketSegmentService,
    private datePipe: DatePipe
  ) {}

  // In ngOnInit, modify the RFQ data loading part:
  ngOnInit(): void {
    this.rfqId = Number(this.route.snapshot.paramMap.get('id'));

    this.editForm = this.fb.group({
      quoteName: ['', Validators.required],
      numRefQuoted: ['', Validators.required],
      statut: [null],
      clientId: ['', Validators.required],
      valeaderId: ['', Validators.required],
      ingenieurRFQId: ['', Validators.required],
      marketSegmentId: ['', Validators.required],
      materialLeaderId: ['', Validators.required],
      testLeaderId: ['', Validators.required],
      estV: ['', [Validators.required, Validators.min(0)]],  // Add estV
      maxV: ['', [Validators.required, Validators.min(0)]],  // Add maxV
      sopDate: ['', Validators.required],
      koDate: ['' , Validators.required],
      customerDataDate: ['', Validators.required],
      mdDate: ['' , Validators.required],
      mrDate: ['' ],
      tdDate: ['' , Validators.required],
      trDate: [''],
      ldDate: ['',Validators.required],
      lrDate: [''],
      cdDate: ['',Validators.required],
      cq: ['', Validators.required],
      valide: [false],
      rejete: [false],
      brouillon: [false]
    });

    // Charger les données existantes
    this.rfqService.apiRFQIdGet(this.rfqId).subscribe({
      next: (data: any) => {
        const dateFields = ['sopDate', 'koDate', 'customerDataDate', 'mdDate',
                         'mrDate', 'tdDate', 'trDate', 'ldDate', 'lrDate',
                         'cdDate', 'approvalDate'];
        
        // Set default dates to null if they are '0001-01-01'
        dateFields.forEach(field => {
          if (data[field]?.startsWith('0001-01-01')) {
            data[field] = null;
          } else {
            data[field] = this.datePipe.transform(data[field], 'yyyy-MM-dd');
          }
        });

        const materialLeader = this.materialLeaders.find(leader => leader.nom === data.materialLeader);
        if (materialLeader) {
          data.materialLeaderId = materialLeader.id;
        }

        const testLeader = this.testers.find(leader => leader.nom === data.testLeader);
        if (testLeader) {
          data.testLeaderId = testLeader.id;
        }

        const vaLeader = this.ingenieurs.find(leader => leader.nomUser === data.vaLeader);
        console.log("h ", vaLeader)

        if (vaLeader) {
          data.valeaderId = vaLeader.id;
        }

        const marketSegment = this.marketSegments.find(leader => leader.nom === data.marketSegment);
        if (marketSegment) {
          data.marketSegmentId = marketSegment.id;
        }
        const client = this.clients.find(leader => leader.nom === data.client);
        if (client) {
          data.clientId = client.id;
        }

        const ingenieur = this.ingenieurs.find(leader => leader.nomUser === data.ingenieurRFQ);
        if (ingenieur) {
          data.ingenieurRFQId = ingenieur.id;
        }

        // Now patch the form with the data
        this.editForm.patchValue(data);
        console.log("Form after patchValue", this.editForm.value);
        console.log('RFQ Data applied:', data);
        this.isBrouillon = data.brouillon;
        this.cq = data.cq ;

        if (data.fileName) {
          this.existingFileName = data.fileName;
          this.existingFileType = data.fileContentType;
          this.existingFileSize = data.fileSize ? (data.fileSize / 1024 / 1024).toFixed(2) + 'MB' : 'N/A';
        }
      },
      error: (err) => {
        // Handle the error in case the request fails
        console.error('Error fetching RFQ data:', err);
      }
    });

    this.getClients();
    this.getIngenieurs();
    this.getWorkers();
    this.getMarketSegments();
    this.fetchRFQDetails();
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
    if (this.editForm.invalid) {
        Object.keys(this.editForm.controls).forEach(field => {
            const control = this.editForm.get(field);
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

    if (this.editForm.valid) {
        this.editForm.patchValue({
            rejete: false
        });

        const formValue = this.editForm.value;

        // Convert dates to ISO string format if they exist
        const formatDate = (date: any) => date ? new Date(date).toISOString() : undefined;

        const fileToSend = this.selectedFile || undefined;

        this.rfqService.apiRFQIdPut(
            this.rfqId,
            formValue.cq,
            formValue.quoteName,
            formValue.numRefQuoted,
            formatDate(formValue.sopDate),
            formValue.maxV,
            formValue.estV,
            formatDate(formValue.koDate),
            formatDate(formValue.customerDataDate),
            formatDate(formValue.mdDate),
            formatDate(formValue.mrDate),
            formatDate(formValue.tdDate),
            formatDate(formValue.trDate),
            formatDate(formValue.ldDate),
            formatDate(formValue.lrDate),
            formatDate(formValue.cdDate),
            formatDate(formValue.approvalDate),
            formValue.statut,
            formValue.materialLeaderId,
            formValue.testLeaderId,
            formValue.marketSegmentId,
            formValue.clientId,
            formValue.ingenieurRFQId,
            formValue.valeaderId,
            formValue.valide,
            false, // rejete
            fileToSend, // file
            formValue.brouillon,
            'body', // observe
            false, // reportProgress
            { httpHeaderAccept: 'application/json' } // options
        ).subscribe({
            next: (response) => {
                console.log('RFQ updated successfully', response);
                alert('RFQ updated successfully!');
                this.router.navigate(['/rfq-manage/get-rfq/' + this.rfqId]);
            },
            error: (error) => {
                console.error('Error updating RFQ', error);
                if (error.status === 0) {
                    // This might be the chunked encoding error - check if the update actually succeeded
                    this.rfqService.apiRFQIdGet(this.rfqId).subscribe(latestData => {
                        // Compare latestData with what we tried to send
                        // If they match, the update probably succeeded despite the error
                        alert('RFQ may have been updated successfully. Please verify.');
                        this.router.navigate(['/rfq-manage/get-rfq/' + this.rfqId]);
                    });
                } else {
                    alert('There was an error updating the RFQ.');
                }
            }
        });
    }
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
    this.editForm.patchValue({ file: file });
    this.editForm.get('file')?.updateValueAndValidity();
}
clearFile(): void {
  // If we had an existing file and are clearing a new selection
  if (this.selectedFile && this.existingFileName) {
    this.selectedFile = null;
    this.editForm.patchValue({ file: null });
  }
  // If we're clearing the existing file (no new selection)
  else if (this.existingFileName) {
    this.existingFileName = '';
    this.existingFileType = '';
    this.existingFileSize = '';
    this.selectedFile = null;
    this.editForm.patchValue({ file: null });
  }

  // Reset the file input element
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  if (fileInput) fileInput.value = '';
}
  FinaliserBrouillon(): void {
     if (this.editForm.invalid) {
          // Trigger validation messages for all fields
          Object.keys(this.editForm.controls).forEach(field => {
            const control = this.editForm.get(field);
            if (control instanceof FormControl) {
              control.markAsTouched();
            }
          });
          return;
        }

    this.onCQChange();
    if (this.cqExists ) {
      alert('CQ already exists. Please change it to proceed.');
      return;
    }

    if (this.editForm.valid) {
      this.editForm.patchValue({
        brouillon : true
      });

      this.rfqService.apiRFQIdFinaliserPut(this.rfqId, this.editForm.value).subscribe(() => {
        this.router.navigate(['/rfq-manage/get-rfqs']); // Redirection après mise à jour
      });
    }

  }


  cancel(): void {
    this.router.navigate(['/rfq-manage/get-rfqs']);
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
    const cqValue = Number(this.editForm.get('cq')?.value);  // Ensure it's a number
    console.log('CQ value changed:', cqValue);
    console.log('Existing RFQs:', this.rfqs); // Log the entire RFQ list

    // Check if the CQ value exists in any of the RFQs, ignoring null values
    this.cqExists = this.rfqs.some(rfq => rfq.cq !== null && Number(rfq.cq) === cqValue && cqValue != this.cq);
    console.log('Does CQ exist?', this.cqExists);
  }
}

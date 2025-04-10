import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RFQDetailsDto, RFQService, ClientService, UserService, WorkerService, MarketSegmentService, ClientSummaryDto, UserSummaryDto, WorkerDto, MarketSegment , VersionRFQService} from 'src/app/api';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-create-version',
  imports: [CommonModule, ReactiveFormsModule, SharedModule] ,
  providers: [DatePipe] ,
  templateUrl: './create-version.component.html',
  styleUrl: './create-version.component.scss'
})
export class CreateVersionComponent implements OnInit {

  createForm!: FormGroup;
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
    private route: ActivatedRoute,
    private router: Router,
    private rfqService: RFQService ,
    private clientService: ClientService,
    private userService: UserService,
    private workerService: WorkerService,
    private marketSegmentService: MarketSegmentService,
    private datePipe: DatePipe ,
    private versionService: VersionRFQService ,
  ) {}

  ngOnInit(): void {
    this.rfqId = Number(this.route.snapshot.paramMap.get('id'));

    this.createForm = this.fb.group({
      cq: ['', Validators.required],
      quoteName: [''],
      numRefQuoted: [''],
      sopDate: [''],
      maxV: [0],
      estV: [0],
      koDate: [''],
      customerDataDate: [''],
      mdDate: [''],
      mrDate: [''],
      tdDate: [''],
      trDate: [''],
      ldDate: [''],
      lrDate: [null],
      cdDate: [null],
      materialLeaderId: [''],
      testLeaderId: [''],
      marketSegmentId: [''],
      clientId: ['',  Validators.required],
      ingenieurRFQId: [''],
      vaLeaderId: [''],
      valide: [false],
      rejete: [false],
      brouillon: [false] ,
      status: [''],
      rfqId: [''],
      file: [null]
    });

    // Charger les listes AVANT d'appliquer patchValue()
    Promise.all([
      this.getClients(),
      this.getIngenieurs(),
      this.getWorkers(),
      this.getMarketSegments()
    ]).then(() => {
      this.loadRFQData();  // Une fois les listes chargées, appliquer les valeurs du RFQ
    });
  }

  loadRFQData() {
    this.rfqService.apiRFQIdGet(this.rfqId).subscribe({
      next: (data: any) => {
        // Mapping fields correctly
        data.sopDate = this.datePipe.transform(data.sopDate, 'yyyy-MM-dd');
        data.koDate = this.datePipe.transform(data.koDate, 'yyyy-MM-dd');
        data.customerDataDate = this.datePipe.transform(data.customerDataDate, 'yyyy-MM-dd');
        data.mdDate = this.datePipe.transform(data.mdDate, 'yyyy-MM-dd');
        data.mrDate = this.datePipe.transform(data.mrDate, 'yyyy-MM-dd');
        data.tdDate = this.datePipe.transform(data.tdDate, 'yyyy-MM-dd');
        data.trDate = this.datePipe.transform(data.trDate, 'yyyy-MM-dd');
        data.ldDate = this.datePipe.transform(data.ldDate, 'yyyy-MM-dd');
        data.lrDate = this.datePipe.transform(data.lrDate, 'yyyy-MM-dd');
        data.cdDate = this.datePipe.transform(data.cdDate, 'yyyy-MM-dd');
        data.approvalDate = this.datePipe.transform(data.approvalDate, 'yyyy-MM-dd');

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
          data.vaLeaderId = vaLeader.id;
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


        // Patch Form after loading the data
        this.createForm.patchValue(data);
        console.log("Form after patchValue", this.createForm.value);
        console.log('RFQ Data applied:', data);
      },
      error: (err) => {
        console.error('Error loading RFQ:', err);
      }
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
    if (this.createForm.invalid) {
      Object.keys(this.createForm.controls).forEach(field => {
        const control = this.createForm.get(field);
        if (control instanceof FormControl) {
          control.markAsTouched();
        }
      });
      return;
    }

    if (this.createForm.valid) {
      this.createForm.patchValue({
        rejete: false,
        rfqId: this.rfqId,
        valide: false,
        // Set default values for fields that can't be null
        numRefQuoted: this.createForm.get('numRefQuoted')?.value || '',
        sopDate: this.createForm.get('sopDate')?.value || '0001-01-01',
        koDate: this.createForm.get('koDate')?.value || '0001-01-01',
        customerDataDate: this.createForm.get('customerDataDate')?.value || '0001-01-01',
        mdDate: this.createForm.get('mdDate')?.value || '0001-01-01',
        mrDate: this.createForm.get('mrDate')?.value || '0001-01-01',
        tdDate: this.createForm.get('tdDate')?.value || '0001-01-01',
        trDate: this.createForm.get('trDate')?.value || '0001-01-01',
        ldDate: this.createForm.get('ldDate')?.value || '0001-01-01',
        lrDate: this.createForm.get('lrDate')?.value || '0001-01-01',
        cdDate: this.createForm.get('cdDate')?.value || '0001-01-01'
      });

      const formValue = this.createForm.value;

      // Convert dates to ISO strings
      const isoDateFields = ['sopDate', 'koDate', 'customerDataDate', 'mdDate',
                            'mrDate', 'tdDate', 'trDate', 'ldDate', 'lrDate',
                            'cdDate', 'approvalDate'];

      isoDateFields.forEach(field => {
        if (formValue[field]) {
          formValue[field] = new Date(formValue[field]).toISOString();
        } else {
          formValue[field] = new Date('0001-01-01').toISOString();
        }
      });

      // Now submit the updated form data
      this.versionService.apiVersionRFQPost(
        formValue.rfqId,
        formValue.cq,
        formValue.quoteName,
        formValue.numRefQuoted,
        formValue.sopDate,
        formValue.maxV || 0,
        formValue.estV || 0,
        formValue.statut,
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
        formValue.materialLeaderId,
        formValue.testLeaderId,
        formValue.marketSegmentId,
        formValue.ingenieurRFQId,
        formValue.valeaderId,
        formValue.clientId,
        formValue.valide, // file
        formValue.rejete,
        this.selectedFile,
        'body', // observe
        false, // reportProgress
        {} // options
      ).subscribe({
        next: (response) => {
          console.log('version created successfully', response);
          alert('version added successfully!');
          this.router.navigate(['/rfq-manage/get-rfq/'+this.rfqId]);

        },
        error: (error) => {
          console.error('Error creating version', error);
          this.router.navigate(['/rfq-manage/get-rfq/'+this.rfqId]);
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
    this.createForm.patchValue({ file: file });
    this.createForm.get('file')?.updateValueAndValidity();
}

clearFile(): void {
  this.selectedFile = null;
  this.createForm.patchValue({ file: null });
  // Reset the file input element
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  if (fileInput) fileInput.value = '';
}

  trackById(index: number, item: any): number {
    return item.id;
  }




}

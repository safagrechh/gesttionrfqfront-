import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService, ClientSummaryDto, MarketSegment, MarketSegmentService, RFQService, UserService, UserSummaryDto, WorkerDto, WorkerService } from 'src/app/api';
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

  ngOnInit(): void {
    this.rfqId = Number(this.route.snapshot.paramMap.get('id'));

    this.editForm = this.fb.group({
      cq: [null],
      quoteName: ['', Validators.required],
      numRefQuoted: [null],
      sopDate: [''],
      maxV: [null],
      estV: [null],
      koDate: [''],
      customerDataDate: [''],
      mdDate: [''],
      mrDate: [''],
      tdDate: [''],
      trDate: [''],
      ldDate: [''],
      lrDate: [''],
      cdDate: [''],
      approvalDate: [''],
      statut: [null, Validators.required],
      materialLeaderId: [null],
      testLeaderId: [null],
      marketSegmentId: [null],
      clientId: [null],
      ingenieurRFQId: [null],
      vaLeaderId: [null],
      valide: [false],
      rejete: [false],
      brouillon: [false]
    });

    // Charger les données existantes
    this.rfqService.apiRFQIdGet(this.rfqId).subscribe({
      next: (data: UpdateRFQDto) => {
        // You can preprocess the data if needed before patching it
        // Example: Format date fields to 'yyyy-MM-dd'
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

        // Now patch the form with the data
        this.editForm.patchValue(data);
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
    if (this.editForm.valid) {
      // Ensure the "rejete" field is set to false before submitting the data
      this.editForm.patchValue({
        rejete: false
      });

      // Now submit the updated form data
      this.rfqService.apiRFQIdPut(this.rfqId, this.editForm.value).subscribe(() => {
        this.router.navigate(['/rfq-manage/get-rfqs']); // Redirection après mise à jour
      });
    }
  }


  cancel(): void {
    this.router.navigate(['/rfq-manage/get-rfqs']);
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientService } from 'src/app/api';
import { ClientSummaryDto, CreateClientDto } from 'src/app/api';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-client-manage',
  templateUrl: './client-manage.component.html',
  styleUrls: ['./client-manage.component.scss'],
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule, NgbPaginationModule],
})

export class ClientManageComponent implements OnInit {
  clients: ClientSummaryDto[] = [];
  searchName: string = '';
  filteredClient: ClientSummaryDto | null = null;
  selectedClient: ClientSummaryDto | null = null;
  clientForm!: FormGroup;
  searchAttempted: boolean = false;
  // Pagination state
  page: number = 1;
  pageSize: number = 8;

  // Computed indices for the current page (used in template)
  get startIndex(): number {
    if (!this.clients || this.clients.length === 0) return 0;
    return (this.page - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    if (!this.clients || this.clients.length === 0) return 0;
    const end = this.page * this.pageSize;
    return end < this.clients.length ? end : this.clients.length;
  }

  constructor(private clientService: ClientService, private router: Router, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.clientForm = this.fb.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      sales: ['', [Validators.required]] // Only allows numbers
    });

    this.loadAllClients();
  }

  loadAllClients(): void {
    this.clientService.apiClientGet().subscribe(
      (response: any) => {
        this.clients = response.$values;
        this.page = 1; // reset to first page on reload
      },
      (error) => {
        console.error('Error fetching clients:', error);
      }
    );
  }

  searchByName(): void {
    this.searchAttempted = true;
    if (!this.searchName.trim()) {
      this.filteredClient = null;
      return;
    }
    this.filteredClient = this.clients.find(client =>
      client.nom?.toLowerCase().includes(this.searchName.toLowerCase())
    ) || null;
  }

  trackTable(index: number, item: ClientSummaryDto): number {
    return item.id!;
  }

  editClient(client: ClientSummaryDto): void {
    this.selectedClient = { ...client };
  }

  cancelEdit(): void {
    this.selectedClient = null;
  }

  createClient(): void {
    if (this.clientForm.invalid) return;

    const newClient: CreateClientDto = this.clientForm.value;
    this.clientService.apiClientPost(newClient).subscribe(
      () => {
        alert('Client added successfully!');
        this.clientForm.reset();
        this.loadAllClients();
      },
      (error) => {
        console.error('Error while adding the client:', error);
      }
    );
  }

  deleteClient(id: number): void {
    if (confirm("Are you sure you want to delete this client?")) {
      this.clientService.apiClientIdDelete(id).subscribe(() => {
        this.clients = this.clients.filter(client => client.id !== id);
      });
    }
  }

  saveClient(): void {
    if (!this.selectedClient) return;

    this.clientService.apiClientIdPut(this.selectedClient.id!, this.selectedClient).subscribe(
      () => {
        alert('Client updated successfully!');
        this.selectedClient = null;
        this.loadAllClients();
      },
      (error) => {
        console.error('Error while updating the client:', error);
      }
    );
  }
}

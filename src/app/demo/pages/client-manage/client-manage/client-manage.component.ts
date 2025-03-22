import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientService } from 'src/app/api';
import { ClientSummaryDto, CreateClientDto } from 'src/app/api';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-client-manage',
  templateUrl: './client-manage.component.html',
  styleUrls: ['./client-manage.component.scss'],
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule],
})

export class ClientManageComponent implements OnInit {
  clients: ClientSummaryDto[] = [];
  searchName: string = '';
  filteredClient: ClientSummaryDto | null = null;
  selectedClient: ClientSummaryDto | null = null;
  clientForm!: FormGroup;

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
      },
      (error) => {
        console.error('Error fetching clients:', error);
      }
    );
  }

  searchByName(): void {
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
        alert('Client ajouté avec succès!');
        this.clientForm.reset();
        this.loadAllClients();
      },
      (error) => {
        console.error('Erreur lors de l’ajout du client:', error);
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
        alert('Client mis à jour avec succès!');
        this.selectedClient = null;
        this.loadAllClients();
      },
      (error) => {
        console.error('Erreur lors de la mise à jour du client:', error);
      }
    );
  }
}

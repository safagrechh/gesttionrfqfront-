import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RoleW, WorkerDto, WorkerService } from 'src/app/api';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-material-leaders',
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule],
  templateUrl: './material-leaders.component.html',
  styleUrl: './material-leaders.component.scss'
})
export class MaterialLeadersComponent implements OnInit {
  allWorkers: WorkerDto[] = [];
  materialLeaders: WorkerDto[] = [];
  testers: WorkerDto[] = [];
  searchName: string = '';
  filteredWorker: WorkerDto | null = null;
  selectedWorker: WorkerDto | null = null;
  workerForm!: FormGroup;
  searchAttempted: boolean = false;

  // Expose RoleW to template
  RoleW = RoleW;

  constructor(private workerService: WorkerService, private router: Router, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.workerForm = this.fb.group({
      nom: ['', Validators.required],
      role: [RoleW.NUMBER_0, Validators.required] // Default to Material Leader
    });

    this.loadAllWorkers();
  }

  loadAllWorkers(): void {
    this.workerService.apiWorkerGet().subscribe(
      (response: any) => {
        this.allWorkers = response.$values;
        this.filterWorkers();
      },
      (error) => {
        console.error('Error fetching workers:', error);
      }
    );
  }

  filterWorkers(): void {
    this.materialLeaders = this.allWorkers.filter(worker => worker.role === RoleW.NUMBER_0);
    this.testers = this.allWorkers.filter(worker => worker.role === RoleW.NUMBER_1);
  }

  searchByName(): void {
    this.searchAttempted = true;
    if (!this.searchName.trim()) {
      this.filteredWorker = null;
      return;
    }

    this.filteredWorker = this.allWorkers.find(worker =>
      worker.nom?.toLowerCase().includes(this.searchName.toLowerCase())
    ) || null;
  }

  trackTable(index: number, item: WorkerDto): number {
    return item.id!;
  }

  editWorker(worker: WorkerDto): void {
    this.selectedWorker = { ...worker };
  }

  cancelEdit(): void {
    this.selectedWorker = null;
  }

  createWorker(): void {
    if (this.workerForm.invalid) return;

    const newWorker: WorkerDto = this.workerForm.value;

    // Choose the right API endpoint based on role
    const apiCall = newWorker.role === RoleW.NUMBER_0
      ? this.workerService.apiWorkerCreateMaterialLeaderPost(newWorker)
      : this.workerService.apiWorkerCreateTestLeaderPost(newWorker);

    apiCall.subscribe(
      () => {
        alert('Worker ajouté avec succès!');
        this.workerForm.reset({ role: RoleW.NUMBER_0 }); // Reset form but keep default role
        this.loadAllWorkers();
      },
      (error) => {
        console.error('Erreur lors de la création du worker:', error);
      }
    );
  }

  deleteWorker(id: number): void {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce worker?")) {
      this.workerService.apiWorkerIdDelete(id).subscribe(() => {
        this.allWorkers = this.allWorkers.filter(worker => worker.id !== id);
        this.filterWorkers();
      });
    }
  }

  saveWorker(): void {
    if (!this.selectedWorker) return;

    this.workerService.apiWorkerIdPut(this.selectedWorker.id!, this.selectedWorker).subscribe(
      () => {
        alert('Worker mis à jour avec succès!');
        this.selectedWorker = null;
        this.loadAllWorkers();
      },
      (error) => {
        console.error('Erreur lors de la mise à jour du worker:', error);
      }
    );
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HistoriqueActionDto, HistoriqueActionService, UserService, UserSummaryDto } from 'src/app/api';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-historique-actions',
  templateUrl: './historique-actions.component.html',
  styleUrls: ['./historique-actions.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SharedModule]
})
export class HistoriqueActionsComponent implements OnInit {
  filterForm!: FormGroup;
  actions: HistoriqueActionDto[] = [];
  users: UserSummaryDto[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private historiqueService: HistoriqueActionService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      cq: [''],
      userId: ['']
    });

    this.loadUsers();
    this.loadAll();
  }

  private toNumberOrUndefined(v: any): number | undefined {
    if (v === null || v === undefined || v === '') return undefined;
    const n = Number(v);
    return isNaN(n) ? undefined : n;
  }

  private toISOOrUndefined(dateStr: string): string | undefined {
    if (!dateStr) return undefined;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? undefined : d.toISOString();
  }

  loadUsers(): void {
    this.userService.apiUserGet('body', false, { httpHeaderAccept: 'application/json' }).subscribe({
      next: (resp: any) => {
        this.users = resp.$values || [];
      },
      error: (err) => {
        console.error('Error loading users', err);
      }
    });
  }

  loadAll(): void {
    this.loading = true;
    this.error = null;
    this.historiqueService.apiHistoriqueActionGet('body', false, { httpHeaderAccept: 'application/json' }).subscribe({
      next: (resp: any) => {
        this.actions = resp.$values || [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Erreur lors du chargement des historiques';
        console.error('Error loading historique actions', err);
      }
    });
  }

  applyFilter(): void {
    const raw = this.filterForm.value;
    const userId = this.toNumberOrUndefined(raw.userId);
    const cq = this.toNumberOrUndefined(raw.cq);
    const startDate = this.toISOOrUndefined(raw.startDate);
    const endDate = this.toISOOrUndefined(raw.endDate);

    this.loading = true;
    this.error = null;
    this.historiqueService.apiHistoriqueActionFilterGet(
      userId,
      startDate,
      endDate,
      cq,
      undefined,
      undefined,
      'body',
      false,
      { httpHeaderAccept: 'application/json' }
    ).subscribe({
      next: (resp: any) => {
        this.actions = resp.$values || [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Erreur lors du filtrage des historiques';
        console.error('Error filtering historique actions', err);
      }
    });
  }

  resetFilters(): void {
    this.filterForm.reset({ startDate: '', endDate: '', cq: '', userId: '' });
    this.loadAll();
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toLocaleString();
  }

  trackById(_index: number, item: HistoriqueActionDto): number | undefined {
    return item.id;
  }
}
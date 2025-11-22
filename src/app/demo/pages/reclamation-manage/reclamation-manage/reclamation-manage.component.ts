import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { ReclamationService } from 'src/app/api/api/reclamation.service';
import { ReclamationDto } from 'src/app/api/model/reclamationDto';
import { ReclamationStatus } from 'src/app/api/model/reclamationStatus';
import { ReclamationType } from 'src/app/api/model/reclamationType';
import { UpdateReclamationStatusDto } from 'src/app/api/model/updateReclamationStatusDto';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ToastNotificationService } from 'src/app/services/toast-notification.service';

@Component({
  selector: 'app-reclamation-manage',
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule, FormsModule, NgbPaginationModule],
  templateUrl: './reclamation-manage.component.html',
  styleUrls: ['./reclamation-manage.component.scss']
})
export class ReclamationManageComponent implements OnInit {
  reclamations: ReclamationDto[] = [];
  searchText: string = '';
  currentFilter: 'pending' | 'confirmed' | 'rejected' | 'all' = 'pending';
  selectedType: 'all' | ReclamationType = 'all';
  pageSize: number = 4;
  pagePending: number = 1;
  pageConfirmed: number = 1;
  pageRejected: number = 1;
  pageAll: number = 1;

  selected: ReclamationDto | null = null;
  updatingId: number | null = null;

  constructor(
    private reclamationService: ReclamationService,
    private toastService: ToastNotificationService
  ) {}

  ngOnInit(): void {
    this.fetchReclamations();
  }

  fetchReclamations(): void {
    this.reclamationService.apiReclamationGet().subscribe(
      (resp: any) => {
        this.reclamations = resp?.$values || [];
      },
      (error) => {
        console.error('Error fetching reclamations:', error);
      }
    );
  }

  setFilter(filter: 'pending' | 'confirmed' | 'rejected' | 'all'): void {
    this.currentFilter = filter;
  }

  private matchesSearch(r: ReclamationDto): boolean {
    const t = (this.searchText || '').trim().toLowerCase();
    if (!t) return true;
    const idMatch = r.id?.toString().includes(t);
    const titleMatch = (r.title || '').toLowerCase().includes(t);
    const msgMatch = (r.message || '').toLowerCase().includes(t);
    return !!(idMatch || titleMatch || msgMatch);
  }

  private statusOf(r: ReclamationDto): ReclamationStatus | undefined {
    return r.status as ReclamationStatus | undefined;
  }

  private filterList(mode: 'pending' | 'confirmed' | 'rejected' | 'all'): ReclamationDto[] {
    return (this.reclamations || [])
      .filter(r => this.matchesSearch(r))
      .filter(r => {
        const s = this.statusOf(r);
        if (mode === 'pending') return s === ReclamationStatus.NUMBER_0 || s === undefined;
        if (mode === 'confirmed') return s === ReclamationStatus.NUMBER_2;
        if (mode === 'rejected') return s === ReclamationStatus.NUMBER_1;
        if (mode === 'all') return true;
        return true;
      })
      .filter(r => this.selectedType === 'all' ? true : r.type === this.selectedType);
  }

  getFilteredPaginated(status: 'pending' | 'confirmed' | 'rejected' | 'all'): ReclamationDto[] {
    const list = this.filterList(status);
    const page = status === 'pending'
      ? this.pagePending
      : status === 'confirmed'
      ? this.pageConfirmed
      : status === 'rejected'
      ? this.pageRejected
      : this.pageAll;
    const start = (page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }

  getCount(status: 'pending' | 'confirmed' | 'rejected' | 'all'): number {
    return this.filterList(status).length;
  }

  getCurrentPage(): number {
    return this.currentFilter === 'pending'
      ? this.pagePending
      : this.currentFilter === 'confirmed'
      ? this.pageConfirmed
      : this.currentFilter === 'rejected'
      ? this.pageRejected
      : this.pageAll;
  }

  setCurrentPage(page: number): void {
    if (this.currentFilter === 'pending') this.pagePending = page;
    else if (this.currentFilter === 'confirmed') this.pageConfirmed = page;
    else if (this.currentFilter === 'rejected') this.pageRejected = page;
    else this.pageAll = page;
  }

  getTotalPages(): number {
    const count = this.getCount(this.currentFilter);
    const pages = Math.ceil(count / this.pageSize);
    return pages || 1;
  }

  getAlertClass(r: ReclamationDto): string {
    const s = this.statusOf(r);
    if (s === ReclamationStatus.NUMBER_2) return 'alert-success';
    if (s === ReclamationStatus.NUMBER_1) return 'alert-danger';
    if (s === ReclamationStatus.NUMBER_3) return 'alert-secondary';
    return 'alert-warning';
  }

  getStatusText(r: ReclamationDto): string {
    const s = this.statusOf(r);
    if (s === ReclamationStatus.NUMBER_2) return 'Confirmed';
    if (s === ReclamationStatus.NUMBER_1) return 'Rejected';
    if (s === ReclamationStatus.NUMBER_3) return 'Deleted';
    return 'Pending';
  }

  getBadgeLabel(r: ReclamationDto): string {
    const s = this.statusOf(r);
    if (s === ReclamationStatus.NUMBER_2) return 'Confirmed';
    if (s === ReclamationStatus.NUMBER_1) return 'Rejected';
    if (s === ReclamationStatus.NUMBER_3) return 'Deleted';
    return 'Pending';
  }

  getBadgeClass(r: ReclamationDto): string {
    const s = this.statusOf(r);
    if (s === ReclamationStatus.NUMBER_2) return 'badge bg-success';
    if (s === ReclamationStatus.NUMBER_1) return 'badge bg-danger';
    if (s === ReclamationStatus.NUMBER_3) return 'badge bg-secondary';
    return 'badge bg-warning text-dark';
  }

  isPending(r: ReclamationDto | null | undefined): boolean {
    if (!r) return false;
    const s = this.statusOf(r);
    return s === undefined || s === ReclamationStatus.NUMBER_0;
  }

  setTypeFilter(t: 'all' | ReclamationType): void {
    this.selectedType = t;
  }

  getTypeLabel(t: 'all' | ReclamationType): string {
    if (t === 'all') return 'All Types';
    if (t === ReclamationType.NUMBER_0) return 'System';
    if (t === ReclamationType.NUMBER_1) return 'General';
    return 'Password Reset';
  }

  getTypeBadgeClass(t: 'all' | ReclamationType): string {
    if (t === 'all') return 'badge bg-dark';
    if (t === ReclamationType.NUMBER_0) return 'badge bg-info';
    if (t === ReclamationType.NUMBER_1) return 'badge bg-secondary';
    return 'badge bg-warning text-dark';
  }

  getTypeCount(t: 'all' | ReclamationType): number {
    if (t === 'all') return (this.reclamations || []).length;
    return (this.reclamations || []).filter(r => r.type === t).length;
  }

  getAccentClass(r: ReclamationDto): string {
    const s = this.statusOf(r);
    if (s === ReclamationStatus.NUMBER_2) return 'accent-success';
    if (s === ReclamationStatus.NUMBER_1) return 'accent-danger';
    if (s === ReclamationStatus.NUMBER_3) return 'accent-muted';
    return 'accent-warning';
  }

  updateStatus(r: ReclamationDto, status: ReclamationStatus, successMsg: string): void {
    if (!r.id && r.id !== 0) return;
    this.updatingId = r.id!;
    const payload: UpdateReclamationStatusDto = { status };
    this.reclamationService.apiReclamationIdStatusPut(r.id!, payload).subscribe(
      () => {
        this.toastService.showToast({
          message: successMsg,
          type: 'success',
          duration: 6000
        });
        this.updatingId = null;
        this.fetchReclamations();
      },
      (error) => {
        console.error('Error updating status:', error);
        this.toastService.showToast({
          message: 'There was an error performing the action.',
          type: 'error',
          duration: 7000
        });
        this.updatingId = null;
      }
    );
  }

  confirm(r: ReclamationDto): void {
    if (!this.isPending(r)) {
      this.toastService.showToast({ message: 'Only pending reclamations can be confirmed', type: 'info', duration: 5000 });
      return;
    }
    this.updateStatus(r, ReclamationStatus.NUMBER_2, 'Reclamation confirmed');
  }

  reject(r: ReclamationDto): void {
    if (!this.isPending(r)) {
      this.toastService.showToast({ message: 'Only pending reclamations can be rejected', type: 'info', duration: 5000 });
      return;
    }
    this.updateStatus(r, ReclamationStatus.NUMBER_1, 'Reclamation rejected');
  }

  delete(r: ReclamationDto): void {
    this.updateStatus(r, ReclamationStatus.NUMBER_3, 'Reclamation deleted');
  }

  trackRow(index: number, r: ReclamationDto): number {
    return r.id!;
  }

  select(r: ReclamationDto): void {
    this.selected = r;
  }
}
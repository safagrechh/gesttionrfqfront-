import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RFQService, UserService } from 'src/app/api';  // Adjust the path if necessary
import { RFQDetailsDto } from 'src/app/api';  // Adjust the path if necessary
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { interval } from 'rxjs';
import { RouterModule } from '@angular/router';
import { VersionRFQService } from 'src/app/api/api/versionRFQ.service';
import { VersionRFQDetailsDto } from 'src/app/api/model/versionRFQDetailsDto';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastNotificationService } from 'src/app/services/toast-notification.service';

@Component({
  selector: 'app-consulter-rfq',
  templateUrl: './consulter-rfq.component.html',
  styleUrls: ['./consulter-rfq.component.scss'],
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule, NgbPaginationModule],
})
export class ConsulterRFQComponent implements OnInit {
  rfqs: Array<RFQDetailsDto> = [];
  currentFilter: 'pending' | 'validated' | 'brouillon' = 'pending';
  isAdmin: boolean = false;
  isEngineer: boolean = false;
  isValidator: boolean = false;
  versionsByRFQ: { [rfqId: number]: VersionRFQDetailsDto[] } = {};
  // Modern browse helpers
  searchText: string = '';
  sortKey: 'date' | 'quoteName' | 'rfqId' = 'date';
  sortDir: 'asc' | 'desc' = 'desc';
  // Optional day filter when sorting by creation date
  filterDate: string | null = null; // yyyy-MM-dd
  // Pagination state
  pageSize: number = 10;
  pagePending: number = 1;
  pageValidated: number = 1;
  pageDraft: number = 1;

  constructor(
    private rfqService: RFQService,
    private userService: UserService,
    private versionService: VersionRFQService,
    private toastService: ToastNotificationService
  ) {}

  checkUserRole() {
    this.userService.apiUserMeGet().subscribe(user => {
      console.log('Authenticated User:', user);
      this.isAdmin = user.role === 2;
      this.isEngineer = user.role === 1;
      this.isValidator = user.role === 0;
    });
  }

  ngOnInit(): void {
    this.fetchRFQDetails();
    interval(60000).subscribe(() => {
      this.rfqs = [...this.rfqs];
    });
    this.checkUserRole();
  }

  fetchRFQDetails(): void {
    this.rfqService.apiRFQGet().subscribe(
      (response: any) => {
        this.rfqs = response.$values;
        // Load versions for each RFQ to render accurate status dots
        this.loadVersionsForRFQs(this.rfqs);
      },
      (error) => {
        console.error('Erreur lors de la récupération des RFQ:', error);
      }
    );
  }

  // --- Version-aware classification helpers ---
  private hasAnyPendingVersion(rfqId?: number): boolean {
    if (!rfqId) return false;
    const versions = this.versionsByRFQ[rfqId];
    if (!versions || versions.length === 0) return false;
    return versions.some(v => !v.valide && !v.rejete);
  }

  private areAllVersionsValidated(rfqId?: number): boolean {
    if (!rfqId) return false;
    const versions = this.versionsByRFQ[rfqId];
    if (!versions || versions.length === 0) return false;
    return versions.every(v => v.valide === true);
  }

  private isValidated(rfq: RFQDetailsDto): boolean {
    if (rfq.brouillon === true || rfq.rejete === true) return false;
    if (rfq.valide !== true) return false;
    // If RFQ has versions, only consider validated if all versions are validated.
    if (rfq.versionsCount && rfq.versionsCount > 0) {
      const versions = this.versionsByRFQ[rfq.id!];
      // If versions not yet loaded, keep RFQ's validated status; once loaded it will reclassify.
      if (!versions || versions.length === 0) return true;
      return this.areAllVersionsValidated(rfq.id);
    }
    // No versions: keep RFQ validated status
    return true;
  }

  private isPending(rfq: RFQDetailsDto): boolean {
    if (rfq.brouillon === true || rfq.rejete === true) return false;
    // Pending if RFQ not validated OR it has any pending version.
    return (rfq.valide !== true) || this.hasAnyPendingVersion(rfq.id);
  }

  getRFQsByStatus(status: string): RFQDetailsDto[] {
    if (status === 'validated') {
      return this.rfqs.filter(rfq => this.isValidated(rfq));
    } else if (status === 'rejected') {
      return this.rfqs.filter(rfq => rfq.rejete === true && rfq.brouillon !== true);
    } else if (status === 'pending') {
      return this.rfqs.filter(rfq => this.isPending(rfq));
    } else {
      // Drafts only visible on this page to validators; engineers see drafts on Assigned page.
      if (!this.isValidator) return [];
      return this.rfqs.filter(rfq => rfq.brouillon === true);
    }
  }

  // Paginated view of RFQs by status (10 per page)
  getRFQsByStatusPaginated(status: 'pending' | 'validated' | 'brouillon'): RFQDetailsDto[] {
    const list = this.getRFQsByStatus(status);
    const page = status === 'pending' ? this.pagePending : status === 'validated' ? this.pageValidated : this.pageDraft;
    const start = (page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }

  onPageChange(status: 'pending' | 'validated' | 'brouillon', page: number): void {
    if (status === 'pending') this.pagePending = page;
    else if (status === 'validated') this.pageValidated = page;
    else this.pageDraft = page;
  }

  // Modern browse: unified filter switch
  setFilter(status: 'pending' | 'validated' | 'brouillon'): void {
    // Prevent engineers from switching to drafts here
    if (status === 'brouillon' && !this.isValidator) return;
    this.currentFilter = status;
  }

  // Modern browse: text search across common fields
  private rfqMatchesSearch(rfq: RFQDetailsDto): boolean {
    const t = (this.searchText || '').trim().toLowerCase();
    if (!t) return true;
    const idMatch = rfq.id?.toString().includes(t);
    const cqMatch = rfq.cq?.toString().includes(t);
    const quoteMatch = (rfq.quoteName || '').toLowerCase().includes(t);
    const clientMatch = (rfq.client || '').toLowerCase().includes(t);
    return !!(idMatch || cqMatch || quoteMatch || clientMatch);
  }

  // Optional: matches selected day (yyyy-MM-dd) against rfq.dateCreation
  private rfqMatchesDay(rfq: RFQDetailsDto): boolean {
    if (!this.filterDate) return true;
    if (!rfq.dateCreation) return false;
    try {
      const day = new Date(rfq.dateCreation).toISOString().slice(0, 10);
      return day === this.filterDate;
    } catch {
      return false;
    }
  }

  // Modern browse: sorting helper
  private sortRFQs(list: RFQDetailsDto[]): RFQDetailsDto[] {
    const key = this.sortKey;
    const dir = this.sortDir === 'asc' ? 1 : -1;
    const sorted = [...list].sort((a, b) => {
      let va: any = 0;
      let vb: any = 0;
      if (key === 'date') {
        va = a.dateCreation ? new Date(a.dateCreation).getTime() : 0;
        vb = b.dateCreation ? new Date(b.dateCreation).getTime() : 0;
      } else if (key === 'quoteName') {
        va = (a.quoteName || '').toLowerCase();
        vb = (b.quoteName || '').toLowerCase();
      } else {
        va = a.id || 0;
        vb = b.id || 0;
      }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return sorted;
  }

  // Modern browse: filtered + sorted list by status
  getFilteredRFQsByStatus(status: 'pending' | 'validated' | 'brouillon'): RFQDetailsDto[] {
    const base = this.getRFQsByStatus(status)
      .filter(r => this.rfqMatchesSearch(r))
      .filter(r => this.rfqMatchesDay(r));
    return this.sortRFQs(base);
  }

  // Modern browse: paginated filtered list by status
  getFilteredRFQsByStatusPaginated(status: 'pending' | 'validated' | 'brouillon'): RFQDetailsDto[] {
    const list = this.getFilteredRFQsByStatus(status);
    const page = status === 'pending' ? this.pagePending : status === 'validated' ? this.pageValidated : this.pageDraft;
    const start = (page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }

  // Modern browse: helper to bind pagination to current filter
  getCurrentPage(): number {
    return this.currentFilter === 'pending' ? this.pagePending : this.currentFilter === 'validated' ? this.pageValidated : this.pageDraft;
  }

  setCurrentPage(page: number): void {
    this.onPageChange(this.currentFilter, page);
  }

  trackTable(index: number, rfq: RFQDetailsDto): number {
    return rfq.id!;
  }

  getFormattedDate(date: string | null): string {
    if (!date) return 'Date inconnue';
    return format(new Date(date), "dd MMMM yyyy HH:mm", { locale: fr });
  }

  /** Helper: create array for version dots (fallback) */
  getVersionDots(count?: number | null): number[] {
    const c = typeof count === 'number' && count > 0 ? count : 0;
    return Array(c).fill(0);
  }

  /** Helper: dot color class based on RFQ status (fallback) */
  getVersionDotClass(rfq: RFQDetailsDto): string {
    if (rfq.valide) return 'dot-green';
    if (rfq.rejete) return 'dot-red';
    return 'dot-yellow';
  }

  /** New: load versions per RFQ to render accurate dots */
  private loadVersionsForRFQs(rfqs: RFQDetailsDto[]): void {
    rfqs.forEach(rfq => {
      const id = rfq.id;
      if (id && rfq.versionsCount && rfq.versionsCount > 0) {
        this.versionService.apiVersionRFQByRfqRfqIdGet(id).subscribe(
          (response: any) => {
            this.versionsByRFQ[id] = response.$values || [];
          },
          (error) => {
            console.error(`Erreur lors de la récupération des versions pour RFQ ${id}:`, error);
          }
        );
      }
    });
  }

  /** Helper: dot color based on actual version status */
  getVersionDotClassForVersion(version: VersionRFQDetailsDto): string {
    if (version.valide) return 'dot-green';
    if (version.rejete) return 'dot-red';
    return 'dot-yellow'; // en attente
  }

  // Legacy CQ-only search removed; unified search via searchText in rfqMatchesSearch

  delete(id: number) {
    if (confirm('Are you sure you want to delete this RFQ?')) {
      this.rfqService.apiRFQIdDelete(id).subscribe(
        () => {
          this.toastService.showToast({
            message: 'RFQ deleted successfully',
            type: 'success',
            duration: 6000,
            rfqId: id?.toString()
          });
          this.fetchRFQDetails(); // Refresh the list
        },
        (error) => {
          console.error('Erreur lors de la suppression de RFQ:', error);
          this.toastService.showToast({
            message: 'There was an error deleting the RFQ.',
            type: 'error',
            duration: 7000
          });
        }
      );
    }
  }

  deletedraft(id: number) {
    if (confirm('Are you sure you want to delete this draftRFQ?')) {
      this.rfqService.apiRFQIdDelete(id).subscribe(
        () => {
          this.toastService.showToast({
            message: 'Draft RFQ deleted successfully',
            type: 'success',
            duration: 6000,
            rfqId: id?.toString()
          });
          this.fetchRFQDetails();
        },
        (error) => {
          console.error('Erreur lors de la suppression de draftRFQ:', error);
          this.toastService.showToast({
            message: 'There was an error deleting the draft RFQ.',
            type: 'error',
            duration: 7000
          });
        }
      );
    }
  }
}



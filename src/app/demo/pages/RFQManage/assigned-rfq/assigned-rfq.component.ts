import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { RFQService, RFQDetailsDto, UserService } from 'src/app/api';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ToastNotificationService } from 'src/app/services/toast-notification.service';

@Component({
  selector: 'app-assigned-rfq',
  templateUrl: './assigned-rfq.component.html',
  styleUrls: ['./assigned-rfq.component.scss'],
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule, NgbPaginationModule, FormsModule]
})
export class AssignedRFQComponent implements OnInit {
  rfqs: Array<RFQDetailsDto> = [];
  filtered: Array<RFQDetailsDto> = [];
  searchText: string = '';
  page: number = 1;
  pageSize: number = 8;
  isAdmin: boolean = false;
  isEngineer: boolean = false;
  isValidator: boolean = false;
  filterStatus: 'all' | 'pending' | 'validated' | 'draft' = 'all';

  constructor(
    private rfqService: RFQService,
    private userService: UserService,
    private toastService: ToastNotificationService
  ) {}

  ngOnInit(): void {
    this.userService.apiUserMeGet().subscribe(user => {
      this.isAdmin = user.role === 2;
      this.isEngineer = user.role === 1;
      this.isValidator = user.role === 0;
    });
    this.loadAssignedRFQs();
  }

  loadAssignedRFQs(): void {
    this.rfqService.apiRFQMyAssignedGet().subscribe({
      next: (response: any) => {
        const list = Array.isArray(response) ? response : response?.$values || [];
        this.rfqs = list;
        this.applyFilter();
      },
      error: (err) => {
        console.error('Failed to load assigned RFQs', err);
        this.toastService.showToast({
          message: 'Failed to load assigned RFQs.',
          type: 'error',
          duration: 6000
        });
      }
    });
  }

  applyFilter(): void {
    const term = (this.searchText || '').toLowerCase().trim();
    // Base text filter
    const textFiltered = (!term)
      ? [...this.rfqs]
      : this.rfqs.filter(r => {
          const quote = (r.quoteName || '').toLowerCase();
          const client = (r.client || '').toLowerCase();
          const cq = (r.cq ?? '').toString().toLowerCase();
          return quote.includes(term) || client.includes(term) || cq.includes(term);
        });

    // Status filter
    if (this.filterStatus === 'pending') {
      this.filtered = textFiltered.filter(r => this.isPending(r));
    } else if (this.filterStatus === 'validated') {
      this.filtered = textFiltered.filter(r => this.isValidated(r));
    } else if (this.filterStatus === 'draft') {
      // Drafts are shown here only for engineers
      if (this.isEngineer) {
        this.filtered = textFiltered.filter(r => r.brouillon === true);
      } else {
        this.filtered = textFiltered.filter(r => r.brouillon !== true);
      }
    } else {
      // "All" should exclude drafts
      this.filtered = textFiltered.filter(r => r.brouillon !== true);
    }
    this.page = 1;
  }

  get paged(): Array<RFQDetailsDto> {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  // Helpers for status
  private isPending(r: RFQDetailsDto): boolean {
    return !r.valide && !r.rejete;
  }

  private isValidated(r: RFQDetailsDto): boolean {
    return !!r.valide && !r.rejete;
  }

  get countAll(): number { return this.rfqs.filter(r => r.brouillon !== true).length; }
  get countPending(): number { return this.rfqs.filter(r => this.isPending(r)).length; }
  get countValidated(): number { return this.rfqs.filter(r => this.isValidated(r)).length; }
  get countDraft(): number { return this.rfqs.filter(r => r.brouillon === true).length; }
}
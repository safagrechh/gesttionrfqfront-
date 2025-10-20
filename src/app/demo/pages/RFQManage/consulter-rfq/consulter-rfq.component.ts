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

@Component({
  selector: 'app-consulter-rfq',
  templateUrl: './consulter-rfq.component.html',
  styleUrls: ['./consulter-rfq.component.scss'],
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule],
})
export class ConsulterRFQComponent implements OnInit {
  rfqs: Array<RFQDetailsDto> = [];
  currentFilter: string = 'pending';
  searchCQ: number | null = null; // Stores the CQ entered in the search bar
  filteredRFQ: RFQDetailsDto | null = null; // Stores the searched RFQ
  isAdmin: boolean = false;
  searchAttempted: boolean = false; // Track whether a search has been performed
  versionsByRFQ: { [rfqId: number]: VersionRFQDetailsDto[] } = {};

  constructor(private rfqService: RFQService , private userService : UserService, private versionService: VersionRFQService) {}

  checkUserRole() {
    this.userService.apiUserMeGet().subscribe(user => {
      console.log('Authenticated User:', user);
      this.isAdmin = user.role === 2;
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
      return this.rfqs.filter(rfq => rfq.brouillon === true);
    }
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

  /** Search RFQ by CQ (Quote Code) */
  searchByCQ(): void {
    if (!this.searchCQ) {
      this.searchAttempted = false;
      this.filteredRFQ = null;
      return;
    }
    console.log("search :", this.searchCQ);

    this.searchAttempted = true;
    this.filteredRFQ = this.rfqs.find(rfq => rfq.cq === this.searchCQ && rfq.brouillon !== true) || null;
    if (this.filteredRFQ?.id && this.filteredRFQ.versionsCount && this.filteredRFQ.versionsCount > 0 && !this.versionsByRFQ[this.filteredRFQ.id]) {
      // Ensure versions for filtered RFQ are loaded
      this.versionService.apiVersionRFQByRfqRfqIdGet(this.filteredRFQ.id).subscribe((response: any) => {
        this.versionsByRFQ[this.filteredRFQ!.id!] = response.$values || [];
      });
    }
    console.log("filtred", this.filteredRFQ);
  }

  delete(id: number) {
    if (confirm('Are you sure you want to delete this RFQ?')) {
      this.rfqService.apiRFQIdDelete(id).subscribe(
        () => {
          alert("RFQ deleted successfully");
          this.fetchRFQDetails(); // Refresh the list
        },
        (error) => {
          console.error('Erreur lors de la suppression de RFQ:', error);
        }
      );
    }
  }

  deletedraft(id: number) {
    if (confirm('Are you sure you want to delete this draftRFQ?')) {
      this.rfqService.apiRFQIdDelete(id).subscribe(
        () => {
          alert("Draft deleted successfully");
          this.fetchRFQDetails();
        },
        (error) => {
          console.error('Erreur lors de la suppression de draftRFQ:', error);
        }
      );
    }
  }
}



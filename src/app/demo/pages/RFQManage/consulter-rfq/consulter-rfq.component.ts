import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RFQService } from 'src/app/api';  // Adjust the path if necessary
import { RFQDetailsDto } from 'src/app/api';  // Adjust the path if necessary
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { interval } from 'rxjs';
import { RouterModule } from '@angular/router';

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

  constructor(private rfqService: RFQService) {}

  ngOnInit(): void {
    this.fetchRFQDetails();
    interval(60000).subscribe(() => {
      this.rfqs = [...this.rfqs];
    });


  }

  fetchRFQDetails(): void {
    this.rfqService.apiRFQGet().subscribe(
      (response: any) => {
        this.rfqs = response.$values;
      },
      (error) => {
        console.error('Erreur lors de la récupération des RFQ:', error);
      }
    );
  }

  getRFQsByStatus(status: string): RFQDetailsDto[] {
    if (status === 'validated') {
      return this.rfqs.filter(rfq => rfq.valide === true && rfq.brouillon !==true);
    } else if (status === 'rejected') {
      return this.rfqs.filter(rfq => rfq.rejete === true && rfq.brouillon !==true);
    } else if (status === 'pending') { // pending
      return this.rfqs.filter(rfq => rfq.valide !== true && rfq.rejete !== true && rfq.brouillon !==true);
    }else{
      return this.rfqs.filter(rfq => rfq.brouillon == true);
    }
  }

  trackTable(index: number, rfq: RFQDetailsDto): number {
    return rfq.id;
  }

  getFormattedDate(date: string | null): string {
    if (!date) return 'Date inconnue';
    return format(new Date(date), "dd MMMM yyyy HH:mm", { locale: fr });
  }

  /** Search RFQ by CQ (Quote Code) */
  searchByCQ(): void {
    if (!this.searchCQ) {
      this.filteredRFQ = null;
      return;
    }
    console.log("search :", this.searchCQ)

    this.filteredRFQ = this.rfqs.find(rfq => rfq.cq === this.searchCQ && rfq.brouillon !==true ) || null;
    console.log("filtred", this.filteredRFQ)
  }
}



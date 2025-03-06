import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RFQService } from 'src/app/api';  // Ajustez le chemin si nécessaire
import { RFQDetailsDto } from 'src/app/api';  // Ajustez le chemin si nécessaire
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { interval } from 'rxjs';
import { NavSearchComponent } from 'src/app/theme/layout/admin/nav-bar/nav-left/nav-search/nav-search.component';

@Component({
  selector: 'app-consulter-rfq',
  templateUrl: './consulter-rfq.component.html',
  styleUrls: ['./consulter-rfq.component.scss'],
  standalone: true,
  imports: [CommonModule, SharedModule , NavSearchComponent],
})
export class ConsulterRFQComponent implements OnInit {
  rfqs: Array<RFQDetailsDto> = [];
  currentFilter: string = 'pending'; // Valeurs possibles : 'validated', 'rejected', 'pending'

  constructor(private rfqService: RFQService) {}

  ngOnInit(): void {
    this.fetchRFQDetails();
    // Rafraîchir les données toutes les 60 secondes (vous pouvez adapter si nécessaire)
    interval(60000).subscribe(() => {
      this.rfqs = [...this.rfqs];
    });
  }

  fetchRFQDetails(): void {
    this.rfqService.apiRFQGet().subscribe(
      (response: any) => {
        // Récupère tous les RFQ sans filtrage ici
        this.rfqs = response.$values;
      },
      (error) => {
        console.error('Erreur lors de la récupération des RFQ:', error);
      }
    );
  }

  // Change le filtre actuel selon le bouton cliqué
  setFilter(filter: string): void {
    this.currentFilter = filter;
  }

  // Renvoie la liste des RFQ filtrée en fonction du filtre sélectionné
  getRFQsByStatus(status: string): RFQDetailsDto[] {
    if (status === 'validated') {
      return this.rfqs.filter(rfq => rfq.valide === true);
    } else if (status === 'rejected') {
      return this.rfqs.filter(rfq => rfq.rejete === true);
    } else { // pending
      return this.rfqs.filter(rfq => rfq.valide !== true && rfq.rejete !== true);
    }
  }

  trackTable(index: number, rfq: RFQDetailsDto): number {
    return rfq.id;
  }

  getFormattedDate(date: string | null): string {
    if (!date) return 'Date inconnue';
    return format(new Date(date), "dd MMMM yyyy HH:mm", { locale: fr });
  }





}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RFQService } from 'src/app/api';  // Adjust the path if necessary
import { RFQDetailsDto } from 'src/app/api';  // Adjust the path if necessary
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { formatDistanceToNow, parseISO } from 'date-fns';  // Import parseISO for date conversion
import { fr } from 'date-fns/locale';
import { interval } from 'rxjs';

@Component({
  selector: 'app-brouillons',
  templateUrl: './brouillons.component.html',
  styleUrls: ['./brouillons.component.scss'],
  standalone: true,
  imports: [CommonModule, SharedModule],
})
export class BrouillonsComponent implements OnInit {
  rfqs: Array<RFQDetailsDto> = [];

  constructor(private rfqService: RFQService) {}

  ngOnInit(): void {
    this.fetchRFQDetails();
    interval(60000).subscribe(() => this.rfqs = [...this.rfqs]);  // Refresh rfqs every 60 seconds
  }

  fetchRFQDetails(): void {
    this.rfqService.apiRFQGet().subscribe(
      (response: any) => {
        // Filter RFQs where brouillon is true
        this.rfqs = response.$values.filter((rfq: RFQDetailsDto) => rfq.brouillon);
      },
      (error) => {
        console.error('Error fetching RFQ details:', error);
      }
    );
  }

  trackTable(index: number, table: any): number {
    return index; // Track table rows using the index
  }

  // Function to return the time ago
  getTimeAgo(date: string | null): string {
    if (!date) return 'Date inconnue';  // If date is null or undefined, return a default message

    // Parse the date string into Date object, handle different date formats
    const parsedDate = parseISO(date);

    // Calculate and return the time ago in a human-readable format
    return formatDistanceToNow(parsedDate, { addSuffix: true, locale: fr });
  }
}

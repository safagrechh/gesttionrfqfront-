import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RFQService } from 'src/app/api';  // Adjust the path if needed
import { RFQDetailsDto } from 'src/app/api';  // Adjust the path if needed
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-consulter-rfq',
  templateUrl: './consulter-rfq.component.html',
  styleUrls: ['./consulter-rfq.component.scss'],
  standalone: true,
    imports: [CommonModule,SharedModule],
})
export class ConsulterRFQComponent implements OnInit {
  rfqs: Array<RFQDetailsDto> = [];  // Array to hold the RFQ details

  constructor(private rfqService: RFQService) {}

  ngOnInit(): void {
    this.fetchRFQDetails();
  }

  fetchRFQDetails(): void {
    this.rfqService.apiRFQGet().subscribe(
      (response: any) => {
        this.rfqs = response.$values;  // Extract the array from the response and assign it
      },
      (error) => {
        console.error('Error fetching RFQ details:', error);
      }
    );
  }
  trackTable(index: number, table: any): number {
    return index; // Use index to track the rows for performance
  }
}


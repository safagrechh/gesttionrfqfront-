import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MarketSegmentDto, MarketSegmentService } from 'src/app/api';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-marketsegment',
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule],
  templateUrl: './marketsegment.component.html',
  styleUrl: './marketsegment.component.scss'
})
export class MarketsegmentComponent implements OnInit {
  marketSegments: MarketSegmentDto[] = [];
  searchName: string = '';
  filteredSegment: MarketSegmentDto | null = null;
  selectedSegment: MarketSegmentDto | null = null;
  segmentForm!: FormGroup;
  searchAttempted: boolean = false;

  constructor(
    private marketSegmentService: MarketSegmentService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.segmentForm = this.fb.group({
      nom: ['', Validators.required]
    });

    this.loadMarketSegments();
  }

  loadMarketSegments(): void {
    this.marketSegmentService.apiMarketSegmentGet().subscribe(
      (response: any) => {
        this.marketSegments = response.$values;
      },
      (error) => {
        console.error('Error fetching market segments:', error);
      }
    );
  }

  searchByName(): void {
    this.searchAttempted = true;
    if (!this.searchName.trim()) {
      this.filteredSegment = null;
      return;
    }

    this.filteredSegment = this.marketSegments.find(segment =>
      segment.nom?.toLowerCase().includes(this.searchName.toLowerCase())
    ) || null;
  }

  trackTable(index: number, item: MarketSegmentDto): number {
    return item.id!;
  }

  editSegment(segment: MarketSegmentDto): void {
    this.selectedSegment = { ...segment };
  }

  cancelEdit(): void {
    this.selectedSegment = null;
  }

  createSegment(): void {
    if (this.segmentForm.invalid) return;

    const newSegment: MarketSegmentDto = this.segmentForm.value;

    this.marketSegmentService.apiMarketSegmentPost(newSegment).subscribe(
      () => {
        alert('Market Segment ajouté avec succès!');
        this.segmentForm.reset();
        this.loadMarketSegments();
      },
      (error) => {
        console.error('Erreur lors de la création du segment:', error);
      }
    );
  }

  deleteSegment(id: number): void {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce segment?")) {
      this.marketSegmentService.apiMarketSegmentIdDelete(id).subscribe(() => {
        this.marketSegments = this.marketSegments.filter(segment => segment.id !== id);
      });
    }
  }

  saveSegment(): void {
    if (!this.selectedSegment) return;

    this.marketSegmentService.apiMarketSegmentIdPut(this.selectedSegment.id!, this.selectedSegment).subscribe(
      () => {
        alert('Market Segment mis à jour avec succès!');
        this.selectedSegment = null;
        this.loadMarketSegments();
      },
      (error) => {
        console.error('Erreur lors de la mise à jour du segment:', error);
      }
    );
  }
}

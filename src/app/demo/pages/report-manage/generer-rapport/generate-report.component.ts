import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientService, ClientSummaryDto, MarketSegmentService, MarketSegmentDto, RapportService, GenerateReportRequest } from 'src/app/api';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastNotificationService } from 'src/app/services/toast-notification.service';

@Component({
  selector: 'app-generate-report',
  templateUrl: './generate-report.component.html',
  styleUrls: ['./generate-report.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class GenerateReportComponent implements OnInit {
  reportForm!: FormGroup;
  clients: ClientSummaryDto[] = [];
  marketSegments: MarketSegmentDto[] = [];
  isSubmitting = false;

  // State for centered alert modal
  showAlert = false;
  alertMessage = '';
   showDetails = false;
   formatOptions = [
     { value: 'pdf', label: 'PDF' },
     { value: 'csv', label: 'CSV' }
   ];

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private marketSegmentService: MarketSegmentService,
    private rapportService: RapportService,
    private http: HttpClient,
    private toastService: ToastNotificationService
  ) {}

  ngOnInit(): void {
    this.reportForm = this.fb.group({
      // Bascules pour activer/désactiver les filtres
      useDate: [false],
      useSegments: [false],
      useClients: [false],
      useStatuts: [false],

      // Champs des filtres
      startDate: [null],
      endDate: [null],
      marketSegmentIds: [[]],
      clientIds: [[]],
      statuts: [[]],
      format: ['pdf', Validators.required]
    });

    // Gestion dynamique des validateurs pour dates
    this.reportForm.get('useDate')!.valueChanges.subscribe((enabled: boolean) => {
      const start = this.reportForm.get('startDate')!;
      const end = this.reportForm.get('endDate')!;
      if (enabled) {
        start.addValidators([Validators.required]);
        end.addValidators([Validators.required]);
      } else {
        start.clearValidators();
        end.clearValidators();
        start.setValue(null);
        end.setValue(null);
      }
      start.updateValueAndValidity();
      end.updateValueAndValidity();
    });

    this.loadClients();
    this.loadMarketSegments();
  }

  // Actions de sélection globale
  selectAllSegments(selectAll: boolean) {
    const ids = selectAll ? this.marketSegments.map(s => s.id!).filter(id => id !== undefined) : [];
    this.reportForm.get('marketSegmentIds')!.setValue(ids);
  }

  selectAllClients(selectAll: boolean) {
    const ids = selectAll ? this.clients.map(c => c.id!).filter(id => id !== undefined) : [];
    this.reportForm.get('clientIds')!.setValue(ids);
  }

  loadClients(): void {
    this.clientService.apiClientGet('body', false, { httpHeaderAccept: 'application/json' }).subscribe({
      next: (data: any) => {
        const list = (data?.$values ?? data ?? []) as ClientSummaryDto[];
        this.clients = list;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des clients', err);
      }
    });
  }

  loadMarketSegments(): void {
    this.marketSegmentService.apiMarketSegmentGet('body', false, { httpHeaderAccept: 'application/json' }).subscribe({
      next: (data: any) => {
        const list = (data?.$values ?? data ?? []) as MarketSegmentDto[];
        this.marketSegments = list;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des segments de marché', err);
      }
    });
  }

  onWinLossChange(event: Event, status: 'win' | 'loss') {
    const checkbox = event.target as HTMLInputElement;
    const current: string[] = this.reportForm.get('statuts')!.value || [];
    if (checkbox.checked) {
      if (!current.includes(status)) current.push(status);
    } else {
      const idx = current.indexOf(status);
      if (idx >= 0) current.splice(idx, 1);
    }
    this.reportForm.get('statuts')!.setValue(current);
  }

  onSubmit(): void {
    if (this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;

    const value = this.reportForm.value;
    const toNumberArray = (arr: any[]) => Array.isArray(arr) ? arr.map((v) => Number(v)).filter((n) => !isNaN(n)) : [];

    const includeDate = !!value.useDate;
    const includeSegments = !!value.useSegments;
    const includeClients = !!value.useClients;
    const includeStatuts = !!value.useStatuts;

    const payload: GenerateReportRequest = {
      startDate: includeDate && value.startDate ? new Date(value.startDate).toISOString() : null,
      endDate: includeDate && value.endDate ? new Date(value.endDate).toISOString() : null,
      marketSegmentIds: includeSegments ? (() => { const a = toNumberArray(value.marketSegmentIds || []); return a.length ? a : null; })() : null,
      clientIds: includeClients ? (() => { const a = toNumberArray(value.clientIds || []); return a.length ? a : null; })() : null,
      statuts: includeStatuts ? (() => { const arr = Array.isArray(value.statuts) ? value.statuts : []; const mapped = arr.map((s: string) => s === 'win' ? '0' : s === 'loss' ? '1' : s); return mapped.length ? mapped : null; })() : null,
      format: value.format
    };

    const { accept, defaultFilename } = this.getAcceptAndFilename(payload.format || 'pdf');

    const basePath = this.rapportService.configuration.basePath || 'http://localhost';
    const url = `${basePath}/api/Rapport/generate`;

    const bearer = this.rapportService.configuration.lookupCredential('Bearer');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': accept });
    if (bearer) headers = headers.set('Authorization', bearer);

    this.http.post(url, payload, { headers, responseType: 'blob', observe: 'response' }).subscribe({
      next: (resp) => {
        this.isSubmitting = false;
        const contentType = resp.headers.get('content-type') || accept;

        const bodyBlob = resp.body as Blob | null;
        if (!bodyBlob || bodyBlob.size === 0) {
          this.showCenteredAlert('No report generated: no data for selected filters.');
          return;
        }

        if (contentType && (contentType.includes('application/json') || contentType.startsWith('text'))) {
          bodyBlob.text().then((txt) => {
            const msg = (txt || '').trim();
            this.showCenteredAlert(msg || 'No report generated: no data for selected filters.');
          }).catch(() => {
            this.showCenteredAlert('No report generated: no data for selected filters.');
          });
          return;
        }

        const disposition = resp.headers.get('content-disposition');
        let filename = defaultFilename;
        if (disposition) {
          const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(disposition);
          const found = match?.[1] || match?.[2];
          if (found) filename = decodeURIComponent(found);
        }
        const blob = new Blob([bodyBlob], { type: contentType });
        const link = document.createElement('a');
        const urlObj = URL.createObjectURL(blob);
        link.href = urlObj;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(urlObj);
      },
      error: (err) => {
        this.isSubmitting = false;

        if (err && err.status === 400) {
          const defaultMsg = 'No report generated: no data for selected filters.';
          const maybeBlob = err.error as Blob | undefined;
          if (maybeBlob && typeof maybeBlob.text === 'function') {
            maybeBlob.text().then((txt) => {
              const msg = (txt || '').trim();
              this.showCenteredAlert(msg || defaultMsg);
            }).catch(() => this.showCenteredAlert(defaultMsg));
          } else if (typeof err.error === 'string') {
            const msg = (err.error || '').trim();
            this.showCenteredAlert(msg || defaultMsg);
          } else {
            this.showCenteredAlert(defaultMsg);
          }
          return;
        }

        console.error('Error generating report', err);
        this.toastService.showToast({
          message: 'Error generating report.',
          type: 'error',
          duration: 7000
        });
      }
    });
  }


  // Replace duplicate ESC handler and alert method, and add getAcceptAndFilename inside the class
  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.showAlert) {
      this.closeAlert();
    }
  }

  showCenteredAlert(message: string) {
    this.alertMessage = message;
    this.showAlert = true;
    this.showDetails = false;
    setTimeout(() => {
      const el = document.querySelector('.center-alert-modal') as HTMLElement | null;
      el?.focus();
    }, 0);
  }

  closeAlert() {
    this.showAlert = false;
    this.showDetails = false;
  }

  getAlertDetails(): string {
    const v = this.reportForm?.value || {};
    const lines: string[] = [];
    // Date range
    if (v.useDate) {
      const sd = v.startDate ? new Date(v.startDate) : null;
      const ed = v.endDate ? new Date(v.endDate) : null;
      lines.push(`Date Range: ${sd ? sd.toLocaleDateString() : '—'} → ${ed ? ed.toLocaleDateString() : '—'}`);
    }
    // Status
    if (v.useStatuts) {
      const arr: string[] = Array.isArray(v.statuts) ? v.statuts : [];
      const labels = arr.map(s => s === 'win' ? 'Won' : s === 'loss' ? 'Lost' : s);
      lines.push(`Status: ${labels.length ? labels.join(', ') : '—'}`);
    }
    // Segments
    if (v.useSegments) {
      const ids: number[] = Array.isArray(v.marketSegmentIds) ? v.marketSegmentIds.map(Number).filter(n => !isNaN(n)) : [];
      const names = this.marketSegments.filter(s => ids.includes(Number(s.id))).map(s => s.nom || `Segment #${s.id}`);
      lines.push(`Segments: ${names.length ? names.join(', ') : '—'}`);
    }
    // Clients
    if (v.useClients) {
      const ids: number[] = Array.isArray(v.clientIds) ? v.clientIds.map(Number).filter(n => !isNaN(n)) : [];
      const names = this.clients.filter(c => ids.includes(Number(c.id))).map(c => c.nom || `Client #${c.id}`);
      lines.push(`Clients: ${names.length ? names.join(', ') : '—'}`);
    }
    // Format
    if (v.format) {
      lines.push(`Format: ${(v.format || '').toUpperCase()}`);
    }
    return lines.join('\n');
  }

  private getAcceptAndFilename(format: string): { accept: string; defaultFilename: string } {
    switch ((format || '').toLowerCase()) {
      case 'csv':
        return { accept: 'text/csv', defaultFilename: 'report.csv' };
      case 'pdf':
      default:
        return { accept: 'application/pdf', defaultFilename: 'report.pdf' };
    }
  }
  // Toggle helpers for single-button select/deselect
  isAllSegmentsSelected(): boolean {
    const enabled = !!this.reportForm?.value?.useSegments;
    if (!enabled) return false;
    const selected: any[] = this.reportForm?.value?.marketSegmentIds || [];
    const total = this.marketSegments.length;
    return total > 0 && selected.length === total;
  }

  toggleAllSegments(): void {
    const all = this.isAllSegmentsSelected();
    this.selectAllSegments(!all);
  }

  isAllClientsSelected(): boolean {
    const enabled = !!this.reportForm?.value?.useClients;
    if (!enabled) return false;
    const selected: any[] = this.reportForm?.value?.clientIds || [];
    const total = this.clients.length;
    return total > 0 && selected.length === total;
  }

  toggleAllClients(): void {
    const all = this.isAllClientsSelected();
    this.selectAllClients(!all);
  }
}

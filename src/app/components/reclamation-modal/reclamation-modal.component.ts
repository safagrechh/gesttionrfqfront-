import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReclamationModalService } from 'src/app/services/reclamation-modal.service';
import { ReclamationService } from 'src/app/api/api/reclamation.service';
import { ToastNotificationService } from 'src/app/services/toast-notification.service';
import { CreateReclamationDto } from 'src/app/api/model/createReclamationDto';

@Component({
  selector: 'app-reclamation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reclamation-modal.component.html',
  styleUrls: ['./reclamation-modal.component.scss']
})
export class ReclamationModalComponent implements OnInit, OnDestroy {
  private modal = inject(ReclamationModalService);
  private api = inject(ReclamationService);
  private toast = inject(ToastNotificationService);

  open = false;
  recTitle = '';
  recType: 0 | 1 | 2 = 1;
  recMessage = '';
  submitting = false;

  ngOnInit(): void {
    this.modal.open$.subscribe(v => { this.open = v; });
  }

  ngOnDestroy(): void {
    this.open = false;
  }

  close() {
    this.modal.close();
    this.submitting = false;
  }

  submit() {
    if (this.submitting || !this.recMessage.trim()) return;
    const payload: CreateReclamationDto = {
      title: this.recTitle || null,
      message: this.recMessage || null,
      type: this.recType
    };
    this.submitting = true;
    this.api.apiReclamationPost(payload).subscribe(
      () => {
        this.toast.showToast({ message: 'Reclamation submitted', type: 'success', duration: 6000 });
        this.recTitle = '';
        this.recMessage = '';
        this.recType = 1;
        this.submitting = false;
        this.close();
      },
      (err) => {
        console.error('Reclamation submit error:', err);
        this.toast.showToast({ message: 'Failed to submit reclamation', type: 'error', duration: 7000 });
        this.submitting = false;
      }
    );
  }
}
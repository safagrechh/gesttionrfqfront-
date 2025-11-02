import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommentaireDto, CommentaireService, RFQService, Statut, UpdateStatutDto, UserService , VersionRFQService, VersionRFQSummaryDto } from 'src/app/api';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CreateCommentaireDto } from 'src/app/api';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastNotificationService } from 'src/app/services/toast-notification.service';


@Component({
  selector: 'app-rfq',
  templateUrl: './rfq.component.html',
  styleUrls: ['./rfq.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule , RouterModule],
})
export class RFQComponent implements OnInit, OnDestroy {
  rfqForm!: FormGroup;
  rfq: any ;
  rfqinitial : any  ;
  selectedVersion: any = null;
  comments: Array<CommentaireDto> = []; // Stocke les commentaires de la RFQ
  idrfq!: number;
  isValidateur: boolean = false;
  showRejectForm = false; // Contrôle l'affichage du formulaire de rejet
  rejectForm!: FormGroup;
  rejectionComment: string = '';// Pour stocker le commentaire de rejet
  isBrouillon: boolean = false;
  versions: Array<VersionRFQSummaryDto> = [];
  isAdmin: boolean = false;
  selectedVersionIndex: number | null = null;
  private routeSubscription!: Subscription;




  constructor(
    private fb: FormBuilder,
    private rfqService: RFQService,
    private route: ActivatedRoute,
    private userService: UserService,
    private commentService: CommentaireService ,
    private VersionRFQService: VersionRFQService ,
        private router: Router,
        private toastService: ToastNotificationService,


  ) {}

  ngOnInit(): void {
    this.rfqForm = this.fb.group({
      quoteName: [{ value: '', disabled: true }],
      cq: [{ value: '', disabled: true }],
      numRefQuoted: [{ value: '', disabled: true }],
      client: [{ value: '', disabled: true }],
      statut: [{ value: '', disabled: true }],
      materialLeader: [{ value: '', disabled: true }],
      testLeader: [{ value: '', disabled: true }],
      marketSegment: [{ value: '', disabled: true }],
      ingenieurRFQ: [{ value: '', disabled: true }],
      vaLeader: [{ value: '', disabled: true }],
      dateCreation: [{ value: '', disabled: true }],
      sopDate: [{ value: '', disabled: true }],
      koDate: [{ value: '', disabled: true }],
      customerDataDate: [{ value: '', disabled: true }],
      mdDate: [{ value: '', disabled: true }],
      mrDate: [{ value: '', disabled: true }],
      tdDate: [{ value: '', disabled: true }],
      trDate: [{ value: '', disabled: true }],
      ldDate: [{ value: '', disabled: true }],
      lrDate: [{ value: '', disabled: true }],
      cdDate: [{ value: '', disabled: true }],
      approvalDate: [{ value: '', disabled: true }]
    });

    this.rejectForm = this.fb.group({
      comment: ['']
    });

    // Subscribe to route parameter changes to handle navigation between different RFQs
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.idrfq = +id;
        this.loadRFQDetails(this.idrfq);
        this.loadComments(this.idrfq);
        this.loadVersions(this.idrfq);
        // Reset component state when switching RFQs
        this.selectedVersion = null;
        this.selectedVersionIndex = null;
        this.showRejectForm = false;
      }
    });

    this.checkUserRole();
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  checkUserRole() {
    this.userService.apiUserMeGet().subscribe(user => {
      this.isValidateur = user.role === 0;
      this.isAdmin = user.role === 2;
    });
  }

  loadRFQDetails(id: number) {
    this.rfqService.apiRFQIdGet(id).subscribe(data => {
      this.rfqinitial = data;
      this.rfq = data; // Set rfq to display the form
      this.rfqForm.patchValue(data);
      this.isBrouillon = data.brouillon ;
    });


  }

  onRFQClick() {
    this.rfq = this.rfqinitial;
    this.selectedVersion = null;
    this.loadComments(this.idrfq);
  }

  onVersionClick(versionId: number) {
    this.selectedVersionIndex = this.versions.findIndex(v => v.id === versionId);

    this.loadVersionDetails(versionId);
    this.rfq = null;
    this.loadCommentsV(versionId);
  }


  areAllVersionsValid(): boolean {
    // Use rfqinitial instead of rfq since rfq might be null when a version is selected
    if (!this.rfqinitial?.valide) return false;
    // If RFQ is valid and has no versions, return true
    if (this.versions.length === 0) return true;
    // If RFQ has versions, check if all are valid
    return this.versions.every(version => version.valide === true);
  }

  loadVersionDetails(id: number) {
    this.VersionRFQService.apiVersionRFQIdGet(id).subscribe(data => {
      // Check and set default dates to null
      const dateFields = ['sopDate', 'koDate', 'customerDataDate', 'mdDate',
                         'mrDate', 'tdDate', 'trDate', 'ldDate', 'lrDate',
                         'cdDate', 'approvalDate'];

      dateFields.forEach(field => {
        if (data[field]?.startsWith('0001-01-01')) {
          data[field] = null;
        }
      });

      this.selectedVersion = data;
      this.loadCommentsV(this.selectedVersion.id);
    });
  }

  loadVersions(id: number) {
    this.VersionRFQService.apiVersionRFQByRfqRfqIdGet(id).subscribe(
      (response: any) => {
        this.versions = response.$values;
        console.log("versions" , this.versions )
      },
      (error) => {
        console.error('Erreur lors de la récupération des RFQ:', error);
      });
  }

  downloadFile(id: number) {
    this.rfqService.apiRFQIdFileGet(
      this.idrfq,
      'body',
      false,
      {
        httpHeaderAccept: 'application/octet-stream' as any
      } as any // 👈 override the type system
    ).subscribe(
      (data: Blob) => {
        const url = window.URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.download = this.rfq?.fileName || 'RFQ_Document.zip';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        console.error('Error downloading file:', error);
      }
    );

  }

  downloadFileV(id: number) {
    this.VersionRFQService.apiVersionRFQIdFileGet(
      this.selectedVersion?.id,
      'body',
      false,
      {
        httpHeaderAccept: 'application/octet-stream' as any
      } as any // 👈 override the type system
    ).subscribe(
      (data: Blob) => {
        const url = window.URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.download = this.selectedVersion?.fileName || 'RFQ_Document.zip';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        console.error('Error downloading file:', error);
      }
    );

  }
  updateRFQStatus(status: 'win' | 'lose') {
    const updateDto: UpdateStatutDto = {
      statut: status === 'win' ? Statut.NUMBER_0 : Statut.NUMBER_1  // Using enum values
    };

    this.rfqService.apiRFQIdUpdateStatutPut(this.idrfq, updateDto).subscribe({
      next: () => {
        this.toastService.showToast({
          message: `RFQ status updated to ${status} successfully`,
          type: 'success',
          duration: 6000
        });
        this.loadRFQDetails(this.idrfq);
      },
      error: (error) => {
        console.error('Error updating RFQ status:', error);
        this.toastService.showToast({
          message: 'Failed to update RFQ status',
          type: 'error',
          duration: 7000
        });
      }
    });
  }

  loadComments(id: number) {
    this.comments = null;
    this.commentService.apiCommentaireByrfqRfqIdGet(id).subscribe(
      (response: any) => {
        this.comments = response.$values;
      },
      (error) => {
        console.error('Erreur lors de la récupération des RFQ:', error);
      }
    );
  }
  loadCommentsV(id: number) {
    this.comments = null;
    this.commentService.apiCommentaireByversionrfqVersionRfqIdGet(id).subscribe(
      (response: any) => {
        this.comments = response.$values;
        console.log("comments",this.comments)
      },
      (error) => {
        console.error('Erreur lors de la récupération des RFQ:', error);
      }
    );
  }

  // Affiche ou masque le formulaire de rejet
  toggleRejectForm() {
    this.showRejectForm = !this.showRejectForm;
  }

  // Bouton "Rejeter" : affiche le formulaire de rejet
  onSubmitRejeter() {
    this.toggleRejectForm();
  }

  // Bouton "Rejeter avec commentaire" : enregistre le commentaire et rejette la RFQ
  submitRejection() {
    const commentText = this.rejectForm.value.comment;
    console.log("comment" , commentText);
    if (commentText && commentText.trim() !== '') {
      this.saveComment(commentText);
    }

  }
  submitRejectionV() {
    const commentText = this.rejectForm.value.comment;
    console.log("comment" , commentText);
    if (commentText && commentText.trim() !== '') {
      this.saveCommentV(commentText);
    }
  }
  saveComment(commentText: string) {
    console.log("saveComment() a été appelé avec:", commentText);
    const newComment: CreateCommentaireDto = {
      contenu: commentText,
      rfqId: this.idrfq,
      versionRFQId: null
    };
    console.log('Commentaire à envoyer:', newComment);

    this.commentService.apiCommentairePost(newComment).subscribe({
      next: () => {
        console.log("Commentaire ajouté avec succès");
        this.loadComments(this.idrfq);
      },
      error: (err) => {
        console.error("Erreur lors de l'ajout du commentaire:", err);
      }
    });
  }
  saveCommentV(commentText: string) {
    console.log("saveComment() a été appelé avec:", commentText);
    const newComment: CreateCommentaireDto = {
      contenu: commentText,
      rfqId: null,
      versionRFQId: this.selectedVersion.id
    };
    console.log('Commentaire à envoyer:', newComment);

    this.commentService.apiCommentairePost(newComment).subscribe({
      next: (response) => {
        console.log("Commentaire ajouté avec succès");
        this.loadCommentsV(this.selectedVersion.id);
        // Clear the form after successful submission
        this.rejectForm.reset();
        // Optional: Show success message
        this.toastService.showToast({
          message: 'Commentaire ajouté avec succès',
          type: 'success',
          duration: 6000
        });
      },
      error: (error) => {
        console.error("Erreur lors de l'ajout du commentaire:", error);
        // Show error message to user
        this.toastService.showToast({
          message: "Erreur lors de l'ajout du commentaire. Veuillez réessayer.",
          type: 'error',
          duration: 7000
        });
      }
    });
  }


  onSubmitValider() {
    if (this.isValidateur && this.rfq?.valide === false && this.rfq?.rejete === false) {
      this.rfqService.apiRFQIdValiderPut(this.idrfq).subscribe(() => {
        this.toastService.showToast({
          message: 'RFQ validée avec succès',
          type: 'success',
          duration: 6000
        });
        this.loadRFQDetails(this.idrfq);
        window.location.reload();
        this.router.navigate(['/rfq-manage/get-rfq/'+this.rfq.id]);

      });
    }
  }

  onSubmitValiderV() {
    if (this.isValidateur && this.selectedVersion?.valide === false && this.selectedVersion?.rejete === false) {
      this.VersionRFQService.apiVersionRFQIdValiderPost(this.selectedVersion.id).subscribe({
        next: () => {
          this.toastService.showToast({
            message: 'Version RFQ validée avec succès',
            type: 'success',
            duration: 6000
          });
          this.loadVersionDetails(this.selectedVersion.id);
          // Reload the page after a short delay to ensure data is updated
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        },
        error: (error) => {
          console.error('Erreur lors de la validation:', error);
          this.toastService.showToast({
            message: 'Erreur lors de la validation de la version RFQ',
            type: 'error',
            duration: 7000
          });
        }
      });
    }
  }



  delete(id: number) {
    if (confirm('Are you sure you want to delete this RFQ?')) {
      this.rfqService.apiRFQIdDelete(id).subscribe(
        () => {
          this.toastService.showToast({
            message: 'RFQ deleted successfully',
            type: 'success',
            duration: 6000
          });
          this.router.navigate(['/rfq-manage/get-rfqs/']);
        },
        (error) => {
          console.error('Erreur lors de la suppression de RFQ:', error);
        }
      );
    }
  }
  onSubmitEditer() {

  }

  // Rejette la RFQ (après enregistrement du commentaire si nécessaire)
  rejectRFQ() {
    if (this.isValidateur && this.rfq?.valide === false && this.rfq?.rejete === false) {
      this.rfqService.apiRFQIdRejeterPut(this.idrfq).subscribe(() => {
        this.toastService.showToast({
          message: 'RFQ rejetée avec succès',
          type: 'success',
          duration: 6000
        });
        this.loadRFQDetails(this.idrfq);
      });
    }
  }

  rejectVRFQ() {
    if (this.isValidateur && this.selectedVersion?.valide === false && this.selectedVersion?.rejete === false) {
      this.VersionRFQService.apiVersionRFQIdRejeterPost(this.selectedVersion.id).subscribe({
        next: () => {
          this.toastService.showToast({
            message: 'Version RFQ rejetée avec succès',
            type: 'success',
            duration: 6000
          });
          this.loadVersionDetails(this.selectedVersion.id);
        },
        error: (err) => {
          console.error('Erreur lors du rejet de la version RFQ:', err);
        }
      });

    }
  }
}

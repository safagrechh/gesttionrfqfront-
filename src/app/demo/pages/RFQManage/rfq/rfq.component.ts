import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommentaireDto, CommentaireService, RFQService, UserService } from 'src/app/api';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CreateCommentaireDto } from 'src/app/api';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-rfq',
  templateUrl: './rfq.component.html',
  styleUrls: ['./rfq.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule , RouterModule],
})
export class RFQComponent implements OnInit {
  rfqForm!: FormGroup;
  rfq: any;
  comments: Array<CommentaireDto> = []; // Stocke les commentaires de la RFQ
  idrfq!: number;
  isValidateur: boolean = false;
  showRejectForm = false; // Contrôle l'affichage du formulaire de rejet
  rejectForm!: FormGroup;
  rejectionComment: string = ''; // Pour stocker le commentaire de rejet

  constructor(
    private fb: FormBuilder,
    private rfqService: RFQService,
    private route: ActivatedRoute,
    private userService: UserService,
    private commentService: CommentaireService
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

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.idrfq = +id;
      this.loadRFQDetails(this.idrfq);
      this.loadComments(this.idrfq);
    }

    this.checkUserRole();
  }

  checkUserRole() {
    this.userService.apiUserMeGet().subscribe(user => {
      // On suppose que le rôle 0 correspond au validateur
      this.isValidateur = user.role === 0;
    });
  }

  loadRFQDetails(id: number) {
    this.rfqService.apiRFQIdGet(id).subscribe(data => {
      this.rfq = data;
      this.rfqForm.patchValue(data);
    });
  }

  loadComments(id: number) {
    this.commentService.apiCommentaireByrfqRfqIdGet(id).subscribe(
      (response: any) => {
        this.comments = response.$values;
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
    this.rejectRFQ();
    this.showRejectForm = false;
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



  onSubmitValider() {
    if (this.isValidateur && this.rfq?.valide === false && this.rfq?.rejete === false) {
      this.rfqService.apiRFQIdValiderPost(this.idrfq).subscribe(() => {
        alert('RFQ validée avec succès');
        this.loadRFQDetails(this.idrfq);
      });
    }
  }

  onSubmitEditer() {

  }

  // Rejette la RFQ (après enregistrement du commentaire si nécessaire)
  rejectRFQ() {
    if (this.isValidateur && this.rfq?.valide === false && this.rfq?.rejete === false) {
      this.rfqService.apiRFQIdRejeterPost(this.idrfq).subscribe(() => {
        alert('RFQ rejetée avec succès');
        this.loadRFQDetails(this.idrfq);
      });
    }
  }
}

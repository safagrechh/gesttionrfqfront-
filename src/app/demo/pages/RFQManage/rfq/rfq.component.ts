import { Component, OnInit } from '@angular/core';
import { RFQService } from 'src/app/api';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-rfq',
  imports: [CommonModule , SharedModule],
  templateUrl: './rfq.component.html',
  styleUrl: './rfq.component.scss',
  standalone: true,
})
export class RFQComponent implements OnInit {
  rfq: any;

  constructor(private rfqService: RFQService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Récupérer l'ID du RFQ à partir de l'URL
    const id = this.route.snapshot.paramMap.get('id');

    // Si l'ID est trouvé et est un nombre valide
    if (id) {
      const rfqId = Number(id); // Conversion de l'ID en nombre
      if (!isNaN(rfqId)) { // Vérifier si l'ID est un nombre valide
        this.rfqService.apiRFQIdGet(rfqId).subscribe(data => {
          console.log(data);
          this.rfq = data; // Assignation des données du RFQ à la variable 'rfq'
        });
      } else {
        console.error('Invalid RFQ ID');
      }
    } else {
      console.error('RFQ ID not found in URL');
    }
  }
}

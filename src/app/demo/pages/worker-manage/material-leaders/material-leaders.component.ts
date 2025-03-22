import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-material-leaders',
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule],
  templateUrl: './material-leaders.component.html',
  styleUrl: './material-leaders.component.scss'
})
export class MaterialLeadersComponent {

}

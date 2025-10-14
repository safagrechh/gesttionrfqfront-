// angular import
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';

declare const AmCharts;

import '../../../assets/charts/amchart/amcharts.js';
import '../../../assets/charts/amchart/gauge.js';
import '../../../assets/charts/amchart/serial.js';
import '../../../assets/charts/amchart/light.js';
import '../../../assets/charts/amchart/pie.min.js';
import '../../../assets/charts/amchart/ammap.min.js';
import '../../../assets/charts/amchart/usaLow.js';
import '../../../assets/charts/amchart/radar.js';
import '../../../assets/charts/amchart/worldLow.js';

import { RFQService, RFQDetailsDto } from 'src/app/api';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, SharedModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  rfqs: Array<RFQDetailsDto> = [];
  wonCount = 0;
  lostCount = 0;
  pendingCount = 0;
  winRate = 0;

  constructor(private rfqService: RFQService) {}

  // life cycle event
  ngOnInit() {
    this.rfqService.apiRFQGet().subscribe({
      next: (response: any) => {
        this.rfqs = response?.$values ?? response ?? [];
        this.updateMetricsAndCharts();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des RFQ pour le tableau de bord:', error);
        this.rfqs = [];
        this.updateMetricsAndCharts();
      }
    });
  }

  private updateMetricsAndCharts() {
    const hasStatut = (s: any): s is 0 | 1 => s === 0 || s === 1;
    this.wonCount = this.rfqs.filter((rfq) => hasStatut(rfq.statut) && rfq.statut === 0).length;
    this.lostCount = this.rfqs.filter((rfq) => hasStatut(rfq.statut) && rfq.statut === 1).length;
    this.pendingCount = this.rfqs.filter((rfq) => !hasStatut(rfq.statut)).length;

    const decisions = this.wonCount + this.lostCount;
    this.winRate = decisions ? Math.round((this.wonCount / decisions) * 100) : 0;
    const lossRate = decisions ? Math.round((this.lostCount / decisions) * 100) : 0;
    const pendingRate = this.rfqs.length ? Math.round((this.pendingCount / this.rfqs.length) * 100) : 0;

    // Update KPI cards with RFQ metrics
    this.sales = [
      {
        title: 'RFQ Gagnés',
        icon: 'icon-check text-c-green',
        amount: String(this.wonCount),
        percentage: `${this.winRate}%`,
        progress: this.winRate,
        design: 'col-md-6',
        progress_bg: 'progress-c-theme'
      },
      {
        title: 'RFQ Perdus',
        icon: 'icon-x text-c-red',
        amount: String(this.lostCount),
        percentage: `${lossRate}%`,
        progress: lossRate,
        design: 'col-md-6',
        progress_bg: 'progress-c-theme2'
      },
      {
        title: 'RFQ En attente',
        icon: 'icon-clock text-c-yellow',
        amount: String(this.pendingCount),
        percentage: `${pendingRate}%`,
        progress: pendingRate,
        design: 'col-md-12',
        progress_bg: 'progress-c-theme'
      }
    ];

    this.renderWinLossPie();
    this.renderMonthlyTrend();
  }

  private renderWinLossPie() {
    AmCharts.makeChart('rfq-win-lose-pie', {
      type: 'pie',
      theme: 'light',
      dataProvider: [
        { status: 'Gagnés', value: this.wonCount, color: '#4caf50' },
        { status: 'Perdus', value: this.lostCount, color: '#f44336' },
        { status: 'En attente', value: this.pendingCount, color: '#FFB020' }
      ],
      titleField: 'status',
      valueField: 'value',
      colorField: 'color',
      balloonText: '[[title]]: [[value]] ([[percents]]%)',
      labelsEnabled: true,
      innerRadius: '40%',
      legend: { position: 'right', align: 'center' },
      export: { enabled: true }
    });
  }

  private renderMonthlyTrend() {
    const monthMap: { [key: string]: { won: number; lost: number } } = {};
    for (const rfq of this.rfqs) {
      if (!rfq.dateCreation) continue;
      const d = new Date(rfq.dateCreation);
      if (isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthMap[key]) monthMap[key] = { won: 0, lost: 0 };
      if (rfq.statut === 0) monthMap[key].won++;
      else if (rfq.statut === 1) monthMap[key].lost++;
    }
    const chartData = Object.keys(monthMap)
      .sort()
      .map((k) => ({ month: k, won: monthMap[k].won, lost: monthMap[k].lost }));

    AmCharts.makeChart('rfq-monthly-serial', {
      type: 'serial',
      theme: 'light',
      addClassNames: true,
      dataProvider: chartData,
      autoMarginOffset: 0,
      marginRight: 0,
      categoryField: 'month',
      categoryAxis: {
        color: '#666',
        gridAlpha: 0,
        axisAlpha: 0.2,
        lineAlpha: 0.2,
        inside: false
      },
      valueAxes: [
        {
          fontSize: 12,
          inside: true,
          gridAlpha: 0,
          axisAlpha: 0,
          lineAlpha: 0,
          minimum: 0
        }
      ],
      chartCursor: {
        valueLineEnabled: true,
        valueLineBalloonEnabled: true,
        cursorAlpha: 0.2,
        zoomable: false,
        valueZoomable: false,
        cursorColor: '#999',
        categoryBalloonColor: '#51b4e6',
        valueLineAlpha: 0.3
      },
      graphs: [
        {
          id: 'gWon',
          type: 'line',
          valueField: 'won',
          lineColor: '#4caf50',
          lineAlpha: 1,
          lineThickness: 3,
          fillAlphas: 0.1,
          showBalloon: true,
          balloonText: '<span style="font-size:14px;">Gagnés: [[value]]</span>'
        },
        {
          id: 'gLost',
          type: 'line',
          valueField: 'lost',
          lineColor: '#f44336',
          lineAlpha: 1,
          lineThickness: 3,
          fillAlphas: 0.1,
          showBalloon: true,
          balloonText: '<span style="font-size:14px;">Perdus: [[value]]</span>'
        }
      ],
      legend: { useGraphSettings: true },
      export: { enabled: true }
    });
  }

  // public method
  sales = [] as any[];

  card = [
    {
      design: 'border-bottom',
      number: '235',
      text: 'TOTAL IDEAS',
      icon: 'icon-zap text-c-green'
    },
    {
      number: '26',
      text: 'TOTAL LOCATIONS',
      icon: 'icon-map-pin text-c-blue'
    }
  ];

  social_card = [
    {
      design: 'col-md-12',
      icon: 'fab fa-facebook-f text-primary',
      amount: '12,281',
      percentage: '+7.2%',
      color: 'text-c-green',
      target: '35,098',
      progress: 60,
      duration: '3,539',
      progress2: 45,
      progress_bg: 'progress-c-theme',
      progress_bg_2: 'progress-c-theme2'
    },
    {
      design: 'col-md-6',
      icon: 'fab fa-twitter text-c-blue',
      amount: '11,200',
      percentage: '+6.2%',
      color: 'text-c-purple',
      target: '34,185',
      progress: 40,
      duration: '4,567',
      progress2: 70,
      progress_bg: 'progress-c-theme',
      progress_bg_2: 'progress-c-theme2'
    },
    {
      design: 'col-md-6',
      icon: 'fab fa-google-plus-g text-c-red',
      amount: '10,500',
      percentage: '+5.9%',
      color: 'text-c-blue',
      target: '25,998',
      progress: 80,
      duration: '7,753',
      progress2: 50,
      progress_bg: 'progress-c-theme',
      progress_bg_2: 'progress-c-theme2'
    }
  ];

  progressing = [
    {
      number: '5',
      amount: '384',
      progress: 70,
      progress_bg: 'progress-c-theme'
    },
    {
      number: '4',
      amount: '145',
      progress: 35,
      progress_bg: 'progress-c-theme'
    },
    {
      number: '3',
      amount: '24',
      progress: 25,
      progress_bg: 'progress-c-theme'
    },
    {
      number: '2',
      amount: '1',
      progress: 10,
      progress_bg: 'progress-c-theme'
    },
    {
      number: '1',
      amount: '0',
      progress: 0,
      progress_bg: 'progress-c-theme'
    }
  ];

  tables = [
    {
      src: 'assets/images/user/avatar-1.jpg',
      title: 'Isabella Christensen',
      text: 'Requested account activation',
      time: '11 MAY 12:56',
      color: 'text-c-green'
    },
    {
      src: 'assets/images/user/avatar-2.jpg',
      title: 'Ida Jorgensen',
      text: 'Pending document verification',
      time: '11 MAY 10:35',
      color: 'text-c-red'
    },
    {
      src: 'assets/images/user/avatar-3.jpg',
      title: 'Mathilda Andersen',
      text: 'Completed profile setup',
      time: '9 MAY 17:38',
      color: 'text-c-green'
    },
    {
      src: 'assets/images/user/avatar-1.jpg',
      title: 'Karla Soreness',
      text: 'Requires additional information',
      time: '19 MAY 12:56',
      color: 'text-c-red'
    },
    {
      src: 'assets/images/user/avatar-2.jpg',
      title: 'Albert Andersen',
      text: 'Approved and verified account',
      time: '21 July 12:56',
      color: 'text-c-green'
    }
  ];
}

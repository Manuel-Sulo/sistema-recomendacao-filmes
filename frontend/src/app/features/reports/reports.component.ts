import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="page container">
      <div class="page-header animate-fade-up">
        <span class="section-label">{{ 'export.title' | translate }}</span>
        <h1 class="text-h1">{{ 'export.reportsTitle' | translate }}</h1>
        <p class="text-muted mt-2">{{ 'export.subtitle' | translate }}</p>
      </div>

      <div class="export-grid mt-8">
        <div class="export-card card-glass animate-fade-up" (click)="exportData('favorites', 'csv')">
          <span class="export-icon">♥</span>
          <h3 class="text-h4 mt-3">{{ 'nav.favorites' | translate }} CSV</h3>
          <p class="text-muted mt-1" style="font-size:13px">{{ 'export.exportList' | translate }} {{ 'nav.favorites' | translate | lowercase }}</p>
        </div>
        <div class="export-card card-glass animate-fade-up" style="animation-delay:0.05s" (click)="exportData('favorites', 'pdf')">
          <span class="export-icon">♥</span>
          <h3 class="text-h4 mt-3">{{ 'nav.favorites' | translate }} PDF</h3>
          <p class="text-muted mt-1" style="font-size:13px">{{ 'export.reportOf' | translate }} {{ 'nav.favorites' | translate | lowercase }}</p>
        </div>
        <div class="export-card card-glass animate-fade-up" style="animation-delay:0.1s" (click)="exportData('ratings', 'csv')">
          <span class="export-icon">⭐</span>
          <h3 class="text-h4 mt-3">{{ 'nav.ratings' | translate }} CSV</h3>
          <p class="text-muted mt-1" style="font-size:13px">{{ 'export.exportAll' | translate }} {{ 'nav.ratings' | translate | lowercase }}</p>
        </div>
        <div class="export-card card-glass animate-fade-up" style="animation-delay:0.15s" (click)="exportData('ratings', 'pdf')">
          <span class="export-icon">⭐</span>
          <h3 class="text-h4 mt-3">{{ 'nav.ratings' | translate }} PDF</h3>
          <p class="text-muted mt-1" style="font-size:13px">{{ 'export.reportOf' | translate }} {{ 'nav.ratings' | translate | lowercase }}</p>
        </div>
        <div class="export-card card-glass animate-fade-up" style="animation-delay:0.2s" (click)="exportData('watchlist', 'csv')">
          <span class="export-icon">📋</span>
          <h3 class="text-h4 mt-3">{{ 'nav.watchlist' | translate }} CSV</h3>
          <p class="text-muted mt-1" style="font-size:13px">{{ 'export.exportList' | translate }} {{ 'nav.watchlist' | translate | lowercase }}</p>
        </div>
        <div class="export-card card-glass animate-fade-up" style="animation-delay:0.25s" (click)="exportData('history', 'csv')">
          <span class="export-icon">🎬</span>
          <h3 class="text-h4 mt-3">{{ 'nav.history' | translate }} CSV</h3>
          <p class="text-muted mt-1" style="font-size:13px">{{ 'export.exportList' | translate }} {{ 'nav.history' | translate | lowercase }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding-top: var(--space-10); padding-bottom: var(--space-10); }
    .section-label { font-size: 12px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.1em; }
    .export-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--space-4); }
    .export-card {
      padding: var(--space-6); text-align: center; cursor: pointer;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .export-card:hover {
      transform: translateY(-6px);
      border-color: var(--accent) !important;
      box-shadow: 0 12px 40px rgba(0,0,0,0.3), 0 0 20px rgba(249,115,22,0.1);
    }
    .export-icon { font-size: 32px; }
  `],
})
export class ReportsComponent {
  constructor(private api: ApiService, private toast: ToastService, private t: TranslateService) {}

  exportData(type: string, format: string): void {
    this.toast.info(this.t.instant('export.preparing'));
    this.api.exportData(type, format);
  }
}

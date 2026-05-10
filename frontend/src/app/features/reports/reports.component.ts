import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="page container">
      <div class="page-header animate-fade-up">
        <span class="section-label">📊 {{ 'export.title' | translate }}</span>
        <h1 class="text-h1">RELATÓRIOS & EXPORTAÇÃO</h1>
        <p class="text-muted mt-2">Exporte os seus dados em diferentes formatos</p>
      </div>

      <div class="export-grid mt-8">
        <div class="export-card card-glass animate-fade-up" (click)="exportData('favorites', 'csv')">
          <span class="export-icon">♥</span>
          <h3 class="text-h4 mt-3">Favoritos CSV</h3>
          <p class="text-muted mt-1" style="font-size:13px">Exportar lista de favoritos</p>
        </div>
        <div class="export-card card-glass animate-fade-up" style="animation-delay:0.05s" (click)="exportData('favorites', 'pdf')">
          <span class="export-icon">♥</span>
          <h3 class="text-h4 mt-3">Favoritos PDF</h3>
          <p class="text-muted mt-1" style="font-size:13px">Relatório de favoritos em PDF</p>
        </div>
        <div class="export-card card-glass animate-fade-up" style="animation-delay:0.1s" (click)="exportData('ratings', 'csv')">
          <span class="export-icon">⭐</span>
          <h3 class="text-h4 mt-3">Avaliações CSV</h3>
          <p class="text-muted mt-1" style="font-size:13px">Exportar todas as avaliações</p>
        </div>
        <div class="export-card card-glass animate-fade-up" style="animation-delay:0.15s" (click)="exportData('ratings', 'pdf')">
          <span class="export-icon">⭐</span>
          <h3 class="text-h4 mt-3">Avaliações PDF</h3>
          <p class="text-muted mt-1" style="font-size:13px">Relatório de avaliações em PDF</p>
        </div>
        <div class="export-card card-glass animate-fade-up" style="animation-delay:0.2s" (click)="exportData('watchlist', 'csv')">
          <span class="export-icon">📋</span>
          <h3 class="text-h4 mt-3">Watchlist CSV</h3>
          <p class="text-muted mt-1" style="font-size:13px">Exportar watchlist</p>
        </div>
        <div class="export-card card-glass animate-fade-up" style="animation-delay:0.25s" (click)="exportData('history', 'csv')">
          <span class="export-icon">🎬</span>
          <h3 class="text-h4 mt-3">Histórico CSV</h3>
          <p class="text-muted mt-1" style="font-size:13px">Exportar histórico de visualização</p>
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
  constructor(private api: ApiService, private toast: ToastService) {}

  exportData(type: string, format: string): void {
    this.toast.info('A preparar exportação...');
    this.api.exportData(type, format);
  }
}

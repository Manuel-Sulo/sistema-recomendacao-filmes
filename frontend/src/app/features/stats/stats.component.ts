import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-page container">
      <div class="stats-header animate-fade-up">
        <span class="section-label">O TEU ANO EM FILMES</span>
        <h1 class="text-display">Estatísticas Pessoais</h1>
        <p class="text-muted mt-2">Um resumo da tua vida cinematográfica connosco.</p>
      </div>

      <div *ngIf="loading" class="skeleton-wrapper mt-8">
        <div class="skeleton" style="height: 300px; border-radius: var(--radius-xl);"></div>
      </div>

      <div *ngIf="!loading && stats" class="stats-grid mt-10 animate-fade-up" style="animation-delay: 0.1s;">
        
        <!-- Total Movies -->
        <div class="stat-card card-glass glow-border primary">
          <span class="stat-icon">🍿</span>
          <h3 class="text-h3 mt-4">Filmes Assistidos</h3>
          <div class="stat-number">{{ stats.total_movies }}</div>
          <p class="text-caption mt-2">Dá-te o título de "{{ stats.vibe }}"!</p>
        </div>

        <!-- Total Hours -->
        <div class="stat-card card-glass glow-border secondary">
          <span class="stat-icon">⏱️</span>
          <h3 class="text-h3 mt-4">Tempo Gasto</h3>
          <div class="stat-number">{{ stats.total_hours }}<span class="text-h3">h</span></div>
          <p class="text-caption mt-2">Aproximadamente.</p>
        </div>

        <!-- Ratings Given -->
        <div class="stat-card card-glass glow-border tertiary">
          <span class="stat-icon">⭐</span>
          <h3 class="text-h3 mt-4">Avaliações Dadas</h3>
          <div class="stat-number">{{ stats.ratings_given }}</div>
          <p class="text-caption mt-2">Obrigado por ajudares a comunidade!</p>
        </div>

        <!-- Top Genres -->
        <div class="stat-card card-glass glow-border accent full-width">
          <span class="stat-icon">🎬</span>
          <h3 class="text-h3 mt-4">Os Teus Géneros Favoritos</h3>
          <div class="genres-wrapper mt-6">
            <div *ngFor="let genre of stats.top_genres; let i = index" class="genre-pod">
              <span class="pod-rank">#{{ i + 1 }}</span>
              <span class="pod-name">{{ genre }}</span>
            </div>
            <div *ngIf="!stats.top_genres || stats.top_genres.length === 0" class="text-muted">
              Ainda não definiste géneros favoritos no teu perfil.
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-page { padding-top: var(--space-10); padding-bottom: var(--space-16); }
    .section-label { font-size: 12px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.2em; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-6); }
    .full-width { grid-column: 1 / -1; }
    
    .stat-card {
      padding: var(--space-8); border-radius: var(--radius-xl);
      display: flex; flex-direction: column; align-items: center; text-align: center;
      position: relative; overflow: hidden; background: var(--surface-opacity);
      transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s;
    }
    .stat-card:hover { transform: translateY(-8px); box-shadow: 0 16px 40px rgba(0,0,0,0.15); }
    
    .stat-card::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.05) 100%); pointer-events: none; }
    .stat-card.primary { border-top: 4px solid var(--accent); }
    .stat-card.secondary { border-top: 4px solid #3b82f6; }
    .stat-card.tertiary { border-top: 4px solid #10b981; }
    .stat-card.accent { border-top: 4px solid #8b5cf6; }
    
    .stat-icon { font-size: 40px; }
    .stat-number { font-size: 64px; font-weight: 800; line-height: 1; margin-top: var(--space-4); background: linear-gradient(135deg, var(--text-primary), var(--text-secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    
    .genres-wrapper { display: flex; gap: var(--space-4); justify-content: center; flex-wrap: wrap; }
    .genre-pod { background: var(--bg-primary); border: 1px solid var(--border); padding: 16px 24px; border-radius: var(--radius-lg); display: flex; flex-direction: column; align-items: center; gap: 8px; min-width: 140px; }
    .pod-rank { font-size: 14px; color: var(--accent); font-weight: 700; }
    .pod-name { font-size: 18px; font-weight: 600; color: var(--text-primary); }
  `]
})
export class StatsComponent implements OnInit {
  stats: any = null;
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getStats().subscribe({
      next: (res: any) => {
        this.stats = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}

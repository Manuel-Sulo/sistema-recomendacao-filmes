import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <div class="page container">
      <div class="page-header animate-fade-up">
        <span class="section-label">🎬 {{ 'nav.history' | translate }}</span>
        <h1 class="text-h1">HISTÓRICO DE VISUALIZAÇÃO</h1>
        <p class="text-muted mt-2">{{ items.length }} filmes assistidos</p>
      </div>
      <div class="history-list mt-8" *ngIf="items.length">
        <div *ngFor="let h of items; let i = index" class="history-card card-glass animate-fade-up" [style.animation-delay]="(i * 0.04) + 's'">
          <a [routerLink]="['/movie', h.tmdb_id]" class="history-poster">
            <img *ngIf="h.poster_path" [src]="imgUrl + '/w154' + h.poster_path" [alt]="h.movie_title">
            <div *ngIf="!h.poster_path" class="poster-placeholder">🎬</div>
          </a>
          <div class="history-info">
            <a [routerLink]="['/movie', h.tmdb_id]" class="history-title">{{ h.movie_title }}</a>
            <span class="history-year" *ngIf="h.release_year">{{ h.release_year }}</span>
            <p class="history-date mt-1" *ngIf="h.watched_at">Visto em {{ h.watched_at | slice:0:10 }}</p>
          </div>
          <button class="delete-btn btn-icon" (click)="remove(h)" title="Remover">✕</button>
        </div>
      </div>
      <div *ngIf="!items.length && !loading" class="empty-state text-center mt-16 animate-fade-up">
        <p style="font-size:56px">🎬</p>
        <p class="text-h3 mt-4">Histórico vazio</p>
        <p class="text-muted mt-2">Marque filmes como vistos para registar aqui</p>
      </div>
      <div *ngIf="loading" class="history-list mt-8">
        <div *ngFor="let i of [1,2,3]" class="skeleton" style="height:80px;border-radius:var(--radius-lg)"></div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding-top: var(--space-10); padding-bottom: var(--space-10); }
    .section-label { font-size: 12px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.1em; }
    .history-list { display: flex; flex-direction: column; gap: var(--space-3); }
    .history-card {
      display: flex; align-items: center; gap: var(--space-4); padding: var(--space-3) var(--space-4);
      transition: transform 0.3s ease;
    }
    .history-card:hover { transform: translateX(4px); }
    .history-poster { flex-shrink: 0; width: 52px; height: 78px; border-radius: var(--radius-md); overflow: hidden; }
    .history-poster img { width: 100%; height: 100%; object-fit: cover; }
    .poster-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--bg-surface); font-size: 20px; }
    .history-info { flex: 1; min-width: 0; }
    .history-title { font-size: 14px; font-weight: 600; text-decoration: none; color: var(--text-primary); }
    .history-title:hover { color: var(--accent); }
    .history-year { font-size: 13px; color: var(--text-muted); margin-left: 8px; }
    .history-date { font-size: 12px; color: var(--text-muted); }
    .delete-btn { flex-shrink: 0; opacity: 0; transition: opacity 0.3s ease; }
    .history-card:hover .delete-btn { opacity: 1; }
    .empty-state { padding: var(--space-16) 0; }
  `],
})
export class HistoryComponent implements OnInit {
  imgUrl = environment.tmdbImageUrl;
  items: any[] = [];
  loading = true;

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.api.getHistory().subscribe({
      next: (res: any) => { this.items = res?.data || []; this.loading = false; },
      error: () => { this.loading = false; this.toast.error('Erro ao carregar histórico'); },
    });
  }

  remove(h: any): void {
    this.api.removeFromHistory(h.tmdb_id).subscribe({
      next: () => {
        this.items = this.items.filter(x => x.tmdb_id !== h.tmdb_id);
        this.toast.success('Removido do histórico');
      },
      error: () => this.toast.error('Erro ao remover'),
    });
  }
}

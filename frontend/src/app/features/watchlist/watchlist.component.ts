import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [CommonModule, TranslateModule, MovieCardComponent],
  template: `
    <div class="page container">
      <div class="page-header animate-fade-up">
        <span class="section-label">📋 {{ 'nav.watchlist' | translate }}</span>
        <h1 class="text-h1">{{ 'watchlistPage.toWatch' | translate }}</h1>
        <p class="text-muted mt-2">{{ items.length }} {{ 'watchlistPage.moviesInList' | translate }}</p>
      </div>
      <div class="movie-grid mt-8" *ngIf="items.length">
        <div *ngFor="let w of items" class="watch-item animate-fade-up">
          <app-movie-card [movie]="w"></app-movie-card>
          <button class="remove-btn btn-icon" (click)="remove(w)" [title]="'actions.remove' | translate">✕</button>
        </div>
      </div>
      <div *ngIf="!items.length && !loading" class="empty-state text-center mt-16 animate-fade-up">
        <p style="font-size:56px">📋</p>
        <p class="text-h3 mt-4">{{ 'watchlistPage.emptyWatchlist' | translate }}</p>
        <p class="text-muted mt-2">{{ 'watchlistPage.addMovies' | translate }}</p>
      </div>
      <div *ngIf="loading" class="movie-grid mt-8">
        <div *ngFor="let i of [1,2,3,4,5,6]" class="skeleton" style="aspect-ratio:2/3;border-radius:var(--radius-xl)"></div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding-top: var(--space-10); padding-bottom: var(--space-10); }
    .section-label { font-size: 12px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.1em; }
    .movie-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: var(--space-5); }
    .watch-item { position: relative; }
    .remove-btn {
      position: absolute; top: 8px; right: 8px; z-index: 10;
      width: 32px; height: 32px; font-size: 14px;
      background: rgba(0,0,0,0.7); color: white; border-radius: var(--radius-full);
      opacity: 0; transition: opacity 0.3s ease;
    }
    .watch-item:hover .remove-btn { opacity: 1; }
    .empty-state { padding: var(--space-16) 0; }
    @media (max-width: 767px) { .movie-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); } }
  `],
})
export class WatchlistComponent implements OnInit {
  items: any[] = [];
  loading = true;

  constructor(private api: ApiService, private toast: ToastService, private t: TranslateService) {}

  ngOnInit(): void {
    this.api.getWatchlist().subscribe({
      next: (res: any) => { this.items = res?.data || []; this.loading = false; },
      error: () => { this.loading = false; this.toast.error(this.t.instant('feedback.errorLoad')); },
    });
  }

  remove(w: any): void {
    const id = w.tmdb_id || w.id;
    this.api.removeFromWatchlist(id).subscribe({
      next: () => {
        this.items = this.items.filter(x => (x.tmdb_id || x.id) !== id);
        this.toast.success(this.t.instant('feedback.removedWatchlist'));
      },
      error: () => this.toast.error(this.t.instant('feedback.errorRemove')),
    });
  }
}

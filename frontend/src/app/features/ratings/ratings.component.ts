import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-ratings',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <div class="page container">
      <div class="page-header animate-fade-up">
        <span class="section-label">{{ 'nav.ratings' | translate }}</span>
        <h1 class="text-h1">{{ 'ratings.myRatings' | translate }}</h1>
        <p class="text-muted mt-2">{{ ratings.length }} {{ 'ratings.moviesRated' | translate }}</p>
      </div>
      <div class="ratings-list mt-8" *ngIf="ratings.length">
        <div *ngFor="let r of ratings; let i = index" class="rating-card card-glass animate-fade-up" [style.animation-delay]="(i * 0.05) + 's'">
          <a [routerLink]="['/movie', r.tmdb_id]" class="rating-poster">
            <img *ngIf="r.poster_path" [src]="imgUrl + '/w154' + r.poster_path" [alt]="r.movie_title">
            <div *ngIf="!r.poster_path" class="poster-placeholder">🎬</div>
          </a>
          <div class="rating-info">
            <a [routerLink]="['/movie', r.tmdb_id]" class="rating-title">{{ r.movie_title }}</a>
            <span class="rating-year" *ngIf="r.release_year">{{ r.release_year }}</span>
            <div class="stars mt-2">
              <span *ngFor="let s of [1,2,3,4,5]" class="star" [class.filled]="s <= r.rating">★</span>
            </div>
            <p class="rating-review mt-2" *ngIf="r.review">{{ r.review }}</p>
          </div>
          <button class="delete-btn btn-icon" (click)="deleteRating(r)" [title]="'actions.delete' | translate">🗑</button>
        </div>
      </div>
      <div *ngIf="!ratings.length && !loading" class="empty-state text-center mt-16 animate-fade-up">
        <p style="font-size:56px">⭐</p>
        <p class="text-h3 mt-4">{{ 'ratings.noRatings' | translate }}</p>
        <p class="text-muted mt-2">{{ 'ratings.rateMovies' | translate }}</p>
      </div>
      <div *ngIf="loading" class="ratings-list mt-8">
        <div *ngFor="let i of [1,2,3]" class="skeleton" style="height:100px;border-radius:var(--radius-lg)"></div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding-top: var(--space-10); padding-bottom: var(--space-10); }
    .section-label { font-size: 12px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.1em; }
    .ratings-list { display: flex; flex-direction: column; gap: var(--space-4); }
    .rating-card {
      display: flex; align-items: center; gap: var(--space-4); padding: var(--space-4);
      transition: transform 0.3s ease;
    }
    .rating-card:hover { transform: translateX(4px); }
    .rating-poster { flex-shrink: 0; width: 64px; height: 96px; border-radius: var(--radius-md); overflow: hidden; }
    .rating-poster img { width: 100%; height: 100%; object-fit: cover; }
    .poster-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--bg-surface); font-size: 24px; }
    .rating-info { flex: 1; min-width: 0; }
    .rating-title { font-size: 15px; font-weight: 600; text-decoration: none; color: var(--text-primary); }
    .rating-title:hover { color: var(--accent); }
    .rating-year { font-size: 13px; color: var(--text-muted); margin-left: 8px; }
    .stars { display: flex; gap: 2px; }
    .star { font-size: 18px; color: var(--border); }
    .star.filled { color: var(--accent); }
    .rating-review { font-size: 13px; color: var(--text-secondary); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .delete-btn { flex-shrink: 0; opacity: 0; transition: opacity 0.3s ease; }
    .rating-card:hover .delete-btn { opacity: 1; }
    .empty-state { padding: var(--space-16) 0; }
  `],
})
export class RatingsComponent implements OnInit {
  imgUrl = environment.tmdbImageUrl;
  ratings: any[] = [];
  loading = true;

  constructor(private api: ApiService, private toast: ToastService, private t: TranslateService) {}

  ngOnInit(): void {
    this.api.getRatings().subscribe({
      next: (res: any) => { this.ratings = res?.data || []; this.loading = false; },
      error: () => { this.loading = false; this.toast.error(this.t.instant('ratings.errorLoad')); },
    });
  }

  deleteRating(r: any): void {
    this.api.deleteRating(r.tmdb_id).subscribe({
      next: () => {
        this.ratings = this.ratings.filter(x => x.tmdb_id !== r.tmdb_id);
        this.toast.success(this.t.instant('ratings.deleted'));
      },
      error: () => this.toast.error(this.t.instant('feedback.errorRemove')),
    });
  }
}

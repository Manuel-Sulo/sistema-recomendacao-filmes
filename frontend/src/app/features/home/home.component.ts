import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, MovieCardComponent],
  template: `
    <div class="home-page">
      <!-- Hero Banner -->
      <section class="hero" *ngIf="heroMovie" [style.backgroundImage]="'url(' + imgUrl + '/w1280' + heroMovie.backdrop_path + ')'">
        <div class="hero-overlay">
          <div class="container hero-content animate-fade-up">
            <div class="hero-badge">
              <span class="badge-icon">🔥</span>
              <span class="badge-text">{{ 'movies.trending' | translate }}</span>
            </div>
            <div class="hero-genres">
              <span class="genre-tag" *ngFor="let gid of heroMovie.genre_ids?.slice(0,3)">{{ getGenreName(gid) }}</span>
            </div>
            <h1 class="text-display">{{ heroMovie.title }}</h1>
            <p class="hero-overview">{{ heroMovie.overview | slice:0:220 }}{{ heroMovie.overview?.length > 220 ? '...' : '' }}</p>
            <div class="hero-meta">
              <span class="rating-hero">★ {{ heroMovie.vote_average | number:'1.1-1' }}</span>
              <span class="meta-divider">|</span>
              <span>{{ heroMovie.release_date | slice:0:4 }}</span>
            </div>
            <div class="hero-actions mt-6">
              <a [routerLink]="['/movie', heroMovie.id]" class="btn btn-primary hero-btn">
                ▶ {{ 'movies.details' | translate }}
              </a>
              <button class="btn btn-secondary hero-btn" (click)="addToWatchlist(heroMovie)">
                📋 {{ 'actions.addWatchlist' | translate }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Hero Skeleton -->
      <section class="hero-skeleton" *ngIf="!heroMovie && !loadError">
        <div class="skeleton" style="height: 100%;"></div>
      </section>

      <div class="container">
        <!-- Error state -->
        <div *ngIf="loadError" class="error-state card-glass p-8 mt-8 text-center animate-fade-up">
          <p class="text-h3 mb-4">⚠️ {{ 'common.error' | translate }}</p>
          <p class="text-muted mb-4">{{ loadError }}</p>
          <button class="btn btn-primary" (click)="retryLoad()">{{ 'actions.retry' | translate }}</button>
        </div>

        <!-- Recommendations Row -->
        <section class="movie-section" *ngIf="recommendations.length">
          <div class="section-header">
            <div>
              <span class="section-label">{{ 'movies.recommended' | translate }}</span>
              <h2 class="text-h2">{{ 'home.madeForYou' | translate }}</h2>
            </div>
          </div>
          <div class="movie-grid">
            <app-movie-card *ngFor="let m of recommendations" [movie]="m"></app-movie-card>
          </div>
        </section>

        <!-- Trending Row -->
        <section class="movie-section">
          <div class="section-header">
            <div>
              <span class="section-label">{{ 'movies.trending' | translate }}</span>
              <h2 class="text-h2">{{ 'home.trendingTitle' | translate }}</h2>
            </div>
          </div>
          <div class="movie-grid" *ngIf="trending.length; else skeleton">
            <app-movie-card *ngFor="let m of trending" [movie]="m"></app-movie-card>
          </div>
        </section>

        <!-- Popular Row -->
        <section class="movie-section">
          <div class="section-header">
            <div>
              <span class="section-label">{{ 'movies.popular' | translate }}</span>
              <h2 class="text-h2">{{ 'home.popularTitle' | translate }}</h2>
            </div>
          </div>
          <div class="movie-grid" *ngIf="popular.length; else skeleton">
            <app-movie-card *ngFor="let m of popular" [movie]="m"></app-movie-card>
          </div>
        </section>

        <!-- Top Rated Row -->
        <section class="movie-section mb-16">
          <div class="section-header">
            <div>
              <span class="section-label">{{ 'movies.topRated' | translate }}</span>
              <h2 class="text-h2">{{ 'home.topRatedTitle' | translate }}</h2>
            </div>
          </div>
          <div class="movie-grid" *ngIf="topRated.length; else skeleton">
            <app-movie-card *ngFor="let m of topRated" [movie]="m"></app-movie-card>
          </div>
        </section>
      </div>

      <ng-template #skeleton>
        <div class="movie-grid">
          <div *ngFor="let i of [1,2,3,4,5]" class="skeleton-card skeleton"></div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .hero {
      width: 100%; min-height: 560px; background-size: cover; background-position: center top;
      position: relative; margin-bottom: var(--space-12);
    }
    .hero-overlay {
      position: absolute; inset: 0;
      background:
        linear-gradient(to right, var(--bg-primary) 0%, rgba(var(--bg-primary-rgb), 0.7) 50%, rgba(var(--bg-primary-rgb), 0.2) 100%),
        linear-gradient(to top, var(--bg-primary) 0%, transparent 35%);
      display: flex; align-items: flex-end; padding-bottom: var(--space-16);
    }
    .hero-content { max-width: 620px; }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 6px 16px; border-radius: var(--radius-full);
      background: rgba(249, 115, 22, 0.15); border: 0.8px solid rgba(249, 115, 22, 0.3);
      margin-bottom: var(--space-4);
    }
    .badge-icon { font-size: 14px; }
    .badge-text {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.12em; color: var(--accent);
    }
    .hero-genres { display: flex; gap: var(--space-2); margin-bottom: var(--space-3); flex-wrap: wrap; }
    .genre-tag {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.05em; padding: 4px 12px;
      border-radius: var(--radius-full);
      background: rgba(249, 115, 22, 0.12); color: var(--accent);
      border: 0.8px solid rgba(249, 115, 22, 0.2);
    }
    .hero-overview { color: var(--text-secondary); font-size: 15px; line-height: 1.7; margin-top: var(--space-4); }
    .hero-meta {
      display: flex; align-items: center; gap: var(--space-3);
      margin-top: var(--space-4); color: var(--text-secondary); font-size: 14px; font-weight: 500;
    }
    .rating-hero { color: var(--accent); font-weight: 700; font-size: 16px; }
    .meta-divider { color: var(--border); }
    .hero-actions { display: flex; gap: var(--space-3); flex-wrap: wrap; }
    .hero-btn { padding: 14px 28px; font-size: 15px; font-weight: 700; }
    .hero-skeleton { width: 100%; height: 560px; margin-bottom: var(--space-12); }

    .error-state { max-width: 500px; margin: 0 auto; }

    .movie-section { margin-bottom: var(--space-12); }
    .section-header { margin-bottom: var(--space-6); }
    .section-label {
      font-size: 12px; font-weight: 700; color: var(--accent);
      text-transform: uppercase; letter-spacing: 0.1em; display: block;
      margin-bottom: var(--space-1);
    }
    .movie-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: var(--space-5);
    }
    .skeleton-card { aspect-ratio: 2/3; border-radius: var(--radius-xl); }

    @media (max-width: 767px) {
      .hero { min-height: 440px; }
      .hero-overlay { padding-bottom: var(--space-10); }
      .hero-btn { padding: 12px 20px; font-size: 14px; }
      .movie-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: var(--space-3); }
    }
  `],
})
export class HomeComponent implements OnInit {
  imgUrl = environment.tmdbImageUrl;
  heroMovie: any = null;
  trending: any[] = [];
  popular: any[] = [];
  topRated: any[] = [];
  recommendations: any[] = [];
  genreMap: { [id: number]: string } = {};
  loadError = '';

  constructor(private api: ApiService, private toast: ToastService, private translate: TranslateService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loadError = '';

    this.api.getGenres().subscribe({
      next: (res: any) => {
        const genres = res?.data?.genres || [];
        genres.forEach((g: any) => this.genreMap[g.id] = g.name);
      },
    });

    this.api.getTrending().subscribe({
      next: (res: any) => {
        const results = res?.data?.results || [];
        this.trending = results.slice(0, 10);
        this.heroMovie = results[0] || null;
      },
      error: (err) => {
        this.loadError = err.error?.message || 'Não foi possível carregar os filmes. Verifique a ligação ao servidor.';
        this.toast.error(this.getTranslation('feedback.errorLoadMovies'));
      },
    });

    this.api.getPopular().subscribe({
      next: (res: any) => { this.popular = (res?.data?.results || []).slice(0, 10); },
      error: () => {},
    });

    this.api.getTopRated().subscribe({
      next: (res: any) => { this.topRated = (res?.data?.results || []).slice(0, 10); },
      error: () => {},
    });

    this.api.getRecommendations().subscribe({
      next: (res: any) => { this.recommendations = (res?.data || []).slice(0, 10); },
      error: () => {},
    });
  }

  retryLoad(): void {
    this.loadData();
    this.toast.info(this.getTranslation('feedback.reloading'));
  }

  getGenreName(id: number): string { return this.genreMap[id] || ''; }

  private getTranslation(key: string): string {
    return this.translate.instant(key);
  }

  addToWatchlist(movie: any): void {
    this.api.addToWatchlist({
      tmdb_id: movie.id, movie_title: movie.title,
      poster_path: movie.poster_path, release_year: movie.release_date?.slice(0, 4),
    }).subscribe({
      next: () => this.toast.success(this.getTranslation('feedback.addedWatchlist')),
      error: () => this.toast.error(this.getTranslation('feedback.errorLoad')),
    });
  }
}

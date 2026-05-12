import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, MovieCardComponent],
  template: `
    <div class="home-page">
      <!-- Hero Banner Accordion -->
      <section class="hero-accordion" *ngIf="heroMovies.length">
        <div class="accordion-panel" *ngFor="let movie of heroMovies; let i = index" 
             [routerLink]="['/movie', movie.id]"
             (mouseenter)="hoveredMovie = i" (mouseleave)="hoveredMovie = null">
          <div class="panel-bg" [style.backgroundImage]="'url(' + imgUrl + '/w1280' + movie.backdrop_path + ')'"></div>
          
          <!-- Background Trailer -->
          <iframe *ngIf="hoveredMovie === i && getTrailerKey(movie)"
                  [src]="getSafeUrl(getTrailerKey(movie)!)"
                  class="panel-video"
                  frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>
          </iframe>

          <div class="panel-overlay">
            <h2 class="panel-title-vertical">{{ movie.title }}</h2>
            <div class="panel-content">
              <div class="hero-badge mb-2">
                <span class="badge-icon">🔥</span>
                <span class="badge-text">{{ 'movies.trending' | translate }}</span>
              </div>
              <h1 class="text-h2" style="color:white">{{ movie.title }}</h1>
              <p class="hero-overview" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">{{ movie.overview }}</p>
              <div class="hero-actions mt-4">
                <button class="btn btn-primary hero-btn">
                  ▶ {{ 'movies.details' | translate }}
                </button>
                <button class="btn btn-secondary hero-btn" (click)="$event.stopPropagation(); addToWatchlist(movie)">
                  📋 {{ 'actions.addWatchlist' | translate }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Hero Skeleton -->
      <section class="hero-skeleton hero-accordion" *ngIf="!heroMovies.length && !loadError">
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
    .hero-accordion { display: flex; height: 60vh; min-height: 500px; width: 100vw; max-width: 100%; margin-left: calc(-50vw + 50%); margin-right: calc(-50vw + 50%); overflow: hidden; background: #000; position: relative; margin-bottom: var(--space-12); }
    .accordion-panel { flex: 1; position: relative; overflow: hidden; transition: flex 0.6s cubic-bezier(0.25, 1, 0.5, 1); cursor: pointer; border-right: 1px solid rgba(255,255,255,0.1); }
    .accordion-panel:last-child { border-right: none; }
    .accordion-panel:hover { flex: 3; }
    .panel-bg { position: absolute; inset: 0; background-size: cover; background-position: center; transition: transform 6s ease; opacity: 0.6; }
    .accordion-panel:hover .panel-bg { transform: scale(1.05); opacity: 0.9; }
    .panel-video { position: absolute; inset: -50px; width: calc(100% + 100px); height: calc(100% + 100px); pointer-events: none; opacity: 0; animation: fadeIn 1s ease 1s forwards; object-fit: cover; }
    @keyframes fadeIn { to { opacity: 1; } }
    .panel-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(17,17,17,0.95) 0%, rgba(17,17,17,0.3) 50%, transparent 100%); display: flex; flex-direction: column; justify-content: flex-end; padding: var(--space-8); }
    .panel-content { opacity: 0; transform: translateY(20px); transition: all 0.4s ease 0.1s; pointer-events: none; }
    .accordion-panel:hover .panel-content { opacity: 1; transform: translateY(0); pointer-events: auto; }
    .panel-title-vertical { position: absolute; bottom: var(--space-8); left: 50%; font-size: 20px; font-weight: 700; white-space: nowrap; transition: opacity 0.3s ease; writing-mode: vertical-rl; text-orientation: mixed; transform: translateX(-50%) rotate(180deg); color: #fff; text-shadow: 0 2px 8px rgba(0,0,0,0.8); }
    .accordion-panel:hover .panel-title-vertical { opacity: 0; pointer-events: none; }
    
    .hero-badge {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 6px 16px; border-radius: var(--radius-full);
      background: rgba(249, 115, 22, 0.15); border: 0.8px solid rgba(249, 115, 22, 0.3);
    }
    .badge-icon { font-size: 14px; }
    .badge-text { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--accent); }
    .hero-overview { color: rgba(255,255,255,0.8); font-size: 15px; line-height: 1.7; margin-top: var(--space-3); }
    .hero-actions { display: flex; gap: var(--space-3); flex-wrap: wrap; }
    .hero-btn { padding: 12px 24px; font-size: 14px; font-weight: 700; }
    
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
      .hero-accordion { flex-direction: column; height: 80vh; margin-left: -var(--space-4); margin-right: -var(--space-4); width: calc(100% + var(--space-8)); }
      .accordion-panel { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.1); }
      .panel-title-vertical { writing-mode: horizontal-tb; transform: translateX(-50%); bottom: 20px; }
      .movie-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: var(--space-3); }
    }
  `],
})
export class HomeComponent implements OnInit, OnDestroy {
  imgUrl = environment.tmdbImageUrl;
  heroMovies: any[] = [];
  trending: any[] = [];
  popular: any[] = [];
  topRated: any[] = [];
  recommendations: any[] = [];
  genreMap: { [id: number]: string } = {};
  loadError = '';
  hoveredMovie: number | null = null;

  private langSub!: Subscription;

  constructor(private api: ApiService, private toast: ToastService, private translate: TranslateService, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.loadData();
    this.langSub = this.translate.onLangChange.subscribe(() => this.loadData());
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  getTrailerKey(movie: any): string | null {
    if (!movie?.videos?.results?.length) return null;
    const trailer = movie.videos.results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
    return trailer ? trailer.key : movie.videos.results[0].key;
  }

  getSafeUrl(key: string): SafeResourceUrl {
    const url = `https://www.youtube.com/embed/${key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${key}&rel=0`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  loadData(): void {
    this.loadError = '';
    let trendingFailed = false;
    let popularFailed = false;
    let topRatedFailed = false;

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
        this.heroMovies = results.slice(0, 4);
      },
      error: () => {
        trendingFailed = true;
        this.checkErrorState(trendingFailed, popularFailed, topRatedFailed);
      },
    });

    this.api.getPopular().subscribe({
      next: (res: any) => { this.popular = (res?.data?.results || []).slice(0, 10); },
      error: () => {
        popularFailed = true;
        this.checkErrorState(trendingFailed, popularFailed, topRatedFailed);
      },
    });

    this.api.getTopRated().subscribe({
      next: (res: any) => { this.topRated = (res?.data?.results || []).slice(0, 10); },
      error: () => {
        topRatedFailed = true;
        this.checkErrorState(trendingFailed, popularFailed, topRatedFailed);
      },
    });

    this.api.getRecommendations().subscribe({
      next: (res: any) => { this.recommendations = (res?.data || []).slice(0, 10); },
      error: () => {},
    });
  }

  private checkErrorState(t: boolean, p: boolean, tr: boolean): void {
    // Only show error banner when ALL sources fail (most likely TMDB key issue)
    if (t && p && tr) {
      this.loadError = this.getTranslation('feedback.errorLoadMovies');
    }
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

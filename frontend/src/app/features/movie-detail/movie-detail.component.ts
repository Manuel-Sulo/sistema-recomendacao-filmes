import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule, MovieCardComponent],
  template: `
    <!-- Error state -->
    <div *ngIf="loadError" class="container" style="padding-top: var(--space-16); text-align: center;">
      <div class="card-glass p-8 animate-fade-up" style="max-width: 500px; margin: 0 auto;">
        <p style="font-size:56px">🎬</p>
        <h2 class="text-h2 mt-4">{{ 'feedback.errorLoadDetails' | translate }}</h2>
        <p class="text-muted mt-2">{{ loadError }}</p>
        <button class="btn btn-primary mt-6" (click)="retry()">{{ 'actions.retry' | translate }}</button>
        <a routerLink="/home" class="btn btn-secondary mt-2" style="margin-left:8px;">{{ 'nav.home' | translate }}</a>
      </div>
    </div>

    <div class="detail-page" *ngIf="movie && !loadingLanguage && !loadError">
      <div class="hero-backdrop" [style.backgroundImage]="'url(' + imgUrl + '/w1280' + movie.backdrop_path + ')'">
        <div class="hero-overlay">
          <div class="container hero-grid">
            <img [src]="imgUrl + '/w342' + movie.poster_path" class="poster animate-fade-up" [alt]="movie.title">
            <div class="hero-info animate-fade-up" style="animation-delay: 0.15s;">
              <div class="genres">
                <span class="genre-tag" *ngFor="let g of movie.genres">{{ g.name }}</span>
              </div>
              <h1 class="text-display">{{ movie.title }}</h1>
              <p class="text-caption mt-2" *ngIf="movie.original_title !== movie.title">{{ movie.original_title }}</p>
              <div class="meta mt-3">
                <span class="rating-badge-lg">★ {{ movie.vote_average | number:'1.1-1' }}</span>
                <span>{{ movie.release_date | slice:0:4 }}</span>
                <span *ngIf="movie.runtime">{{ movie.runtime }} min</span>
              </div>
              <p class="overview mt-4">{{ movie.overview }}</p>
              <div class="actions mt-6">
                <button class="btn btn-icon action-btn" [class.active]="movie.is_favorite" (click)="toggleFav()"
                  [title]="movie.is_favorite ? t('actions.removeFavorite') : t('actions.addFavorite')">♥</button>
                <button class="btn btn-icon action-btn" [class.active]="movie.in_watchlist" (click)="toggleWatchlist()"
                  [title]="movie.in_watchlist ? t('actions.removeWatchlist') : t('actions.addWatchlist')">📋</button>
                <button class="btn btn-icon action-btn" [class.active]="movie.is_watched" (click)="toggleWatched()"
                  [title]="movie.is_watched ? t('feedback.removedHistory') : t('actions.markWatched')">✓</button>
                <button class="btn btn-icon action-btn" (click)="shareMovie()" title="Partilhar Filme">📤</button>
                <a *ngIf="trailerKey" [href]="'https://youtube.com/watch?v=' + trailerKey" target="_blank"
                   class="btn btn-primary trailer-btn">▶ Trailer</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="container">
        <!-- Rating form -->
        <section class="card-glass p-6 mt-8 animate-fade-up">
          <h3 class="text-h3 mb-4">{{ 'actions.rate' | translate }}</h3>
          <div class="star-rating">
            <span *ngFor="let s of [1,2,3,4,5]" class="star"
              [class.filled]="s <= (hoverRating || userRating)"
              (click)="setRating(s)"
              (mouseenter)="hoverRating = s"
              (mouseleave)="hoverRating = 0">★</span>
          </div>
          <textarea class="input mt-4" [(ngModel)]="userReview" [placeholder]="'actions.writeReview' | translate" rows="3" style="height:auto"></textarea>
          <button class="btn btn-primary mt-4" (click)="submitRating()">{{ 'actions.save' | translate }}</button>
        </section>

        <!-- Public Ratings -->
        <section class="mt-8" *ngIf="publicRatings.length">
          <h2 class="text-h2 mb-4">{{ 'ratings.communityReviews' | translate }}</h2>
          <div class="public-ratings-list">
            <div *ngFor="let pr of publicRatings" class="public-rating card-glass">
              <div class="pr-header">
                <span class="pr-avatar">{{ pr.user_name?.charAt(0)?.toUpperCase() || '?' }}</span>
                <div class="pr-meta">
                  <span class="pr-name">{{ pr.user_name }}</span>
                  <div class="pr-stars">
                    <span *ngFor="let s of [1,2,3,4,5]" class="star-sm" [class.filled]="s <= pr.rating">★</span>
                  </div>
                </div>
                <span class="pr-date">{{ pr.rated_at | slice:0:10 }}</span>
              </div>
              <p class="pr-review" *ngIf="pr.review">{{ pr.review }}</p>
            </div>
          </div>
        </section>

        <!-- Cast -->
        <section class="mt-8" *ngIf="cast.length">
          <h2 class="text-h2 mb-4">{{ 'movies.cast' | translate }}</h2>
          <div class="cast-row">
            <div *ngFor="let c of cast" class="cast-item" [routerLink]="['/actor', c.id]" style="cursor: pointer;">
              <div class="cast-img-wrapper">
                <img [src]="c.profile_path ? imgUrl + '/w185' + c.profile_path : 'assets/images/logo.png'" [alt]="c.name" class="cast-img">
              </div>
              <p class="cast-name hover-accent" style="transition: color 0.2s;">{{ c.name }}</p>
              <p class="text-caption">{{ c.character }}</p>
            </div>
          </div>
        </section>

        <!-- Similar -->
        <section class="mt-8 mb-8" *ngIf="similar.length">
          <h2 class="text-h2 mb-4">{{ 'movies.similar' | translate }}</h2>
          <div class="movie-row">
            <app-movie-card *ngFor="let m of similar" [movie]="m"></app-movie-card>
          </div>
        </section>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div *ngIf="!movie && !loadError" class="container" style="padding-top: var(--space-10);">
      <div class="skeleton" style="height: 400px; width: 100%; margin-bottom: var(--space-6);"></div>
      <div class="skeleton" style="height: 24px; width: 60%; margin-bottom: var(--space-4);"></div>
      <div class="skeleton" style="height: 16px; width: 40%;"></div>
    </div>
  `,
  styles: [`
    .hero-backdrop { width: 100%; min-height: 520px; background-size: cover; background-position: center top; position: relative; }
    .hero-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to right, var(--bg-primary) 0%, rgba(var(--bg-primary-rgb), 0.75) 50%, rgba(var(--bg-primary-rgb), 0.4) 100%),
                  linear-gradient(to top, var(--bg-primary) 0%, transparent 35%);
      display: flex; align-items: flex-end; padding-bottom: var(--space-12);
    }
    .hero-grid { display: flex; gap: var(--space-8); align-items: flex-end; }
    .poster {
      width: 240px; border-radius: var(--radius-xl);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(249, 115, 22, 0.1);
      flex-shrink: 0; border: 0.8px solid rgba(255, 255, 255, 0.1);
    }
    .genres { display: flex; gap: var(--space-2); flex-wrap: wrap; margin-bottom: var(--space-2); }
    .genre-tag {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      padding: 4px 12px; border-radius: var(--radius-full);
      background: rgba(249, 115, 22, 0.15); color: var(--accent);
      border: 0.8px solid rgba(249, 115, 22, 0.25);
      letter-spacing: 0.05em;
    }
    .meta { display: flex; gap: var(--space-4); color: var(--text-secondary); font-size: 14px; align-items: center; }
    .rating-badge-lg {
      color: var(--accent); font-weight: 700; font-size: 16px;
      display: flex; align-items: center; gap: 4px;
    }
    .overview { color: var(--text-secondary); line-height: 1.8; max-width: 600px; font-size: 14px; }
    .actions { display: flex; gap: var(--space-3); align-items: center; }
    .action-btn { font-size: 18px; }
    .trailer-btn { padding: 10px 24px; font-size: 14px; }
    .star-rating { display: flex; gap: 6px; }
    .star {
      font-size: 32px; cursor: pointer; color: var(--border);
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .star.filled { color: var(--accent); }
    .star:hover { color: var(--accent); transform: scale(1.25) rotate(5deg); }

    /* Public Ratings */
    .public-ratings-list { display: flex; flex-direction: column; gap: var(--space-3); }
    .public-rating { padding: var(--space-4); }
    .pr-header { display: flex; align-items: center; gap: var(--space-3); }
    .pr-avatar {
      width: 36px; height: 36px; border-radius: var(--radius-full);
      background: linear-gradient(135deg, var(--accent), #fb923c);
      color: white; font-weight: 700; font-size: 14px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .pr-meta { flex: 1; }
    .pr-name { font-size: 14px; font-weight: 600; color: var(--text-primary); display: block; }
    .pr-stars { display: flex; gap: 1px; margin-top: 2px; }
    .star-sm { font-size: 14px; color: var(--border); }
    .star-sm.filled { color: var(--accent); }
    .pr-date { font-size: 12px; color: var(--text-muted); }
    .pr-review { font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin-top: var(--space-2); }

    .cast-row { display: flex; gap: var(--space-4); overflow-x: auto; padding-bottom: var(--space-4); margin: 0 calc(-1 * var(--space-4)); padding-inline: var(--space-4); }
    .cast-item { width: 140px; flex-shrink: 0; text-align: center; }
    .cast-img-wrapper { width: 100px; height: 100px; margin: 0 auto var(--space-2); border-radius: 50%; overflow: hidden; background: var(--bg-secondary); border: 2px solid var(--border); transition: border-color 0.2s; }
    .cast-item:hover .cast-img-wrapper { border-color: var(--accent); }
    .cast-item:hover .hover-accent { color: var(--accent) !important; }
    .cast-img { width: 100%; height: 100%; object-fit: cover; }
    .cast-name { font-size: 13px; font-weight: 600; }
    .movie-row { display: flex; gap: var(--space-4); overflow-x: auto; padding-bottom: var(--space-4); }
    .movie-row app-movie-card { min-width: 160px; flex-shrink: 0; }
    @media (max-width: 767px) {
      .hero-grid { flex-direction: column; align-items: center; text-align: center; }
      .poster { width: 180px; }
      .overview { max-width: 100%; }
      .genres, .actions { justify-content: center; }
    }
  `],
})
export class MovieDetailComponent implements OnInit, OnDestroy {
  imgUrl = environment.tmdbImageUrl;
  movie: any = null;
  cast: any[] = [];
  similar: any[] = [];
  publicRatings: any[] = [];
  trailerKey = '';
  userRating = 0;
  hoverRating = 0;
  userReview = '';
  loadingLanguage = false;
  loadError = '';
  private routeSub!: Subscription;
  private langSub!: Subscription;
  private currentId = 0;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private toast: ToastService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) { this.currentId = id; this.loadMovie(id); }
    });
    this.langSub = this.translate.onLangChange.subscribe(() => {
      if (this.currentId) {
        this.loadingLanguage = true;
        this.loadMovie(this.currentId);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.langSub?.unsubscribe();
  }

  t(key: string): string { return this.translate.instant(key); }

  private loadMovie(id: number): void {
    this.movie = null;
    this.userRating = 0;
    this.userReview = '';
    this.publicRatings = [];
    this.loadError = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.api.getMovieDetails(id).subscribe({
      next: (res: any) => {
        const data = res?.data || res;
        if (!data || !data.id) {
          this.loadError = this.t('feedback.errorLoadDetails');
          return;
        }
        this.movie = data;
        this.loadingLanguage = false;
        this.cast = (this.movie.credits?.cast || []).slice(0, 12);
        this.similar = (this.movie.similar?.results || []).slice(0, 10);
        const videos = this.movie.videos?.results || [];
        const trailer = videos.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
        this.trailerKey = trailer?.key || '';
        if (this.movie.user_rating) {
          this.userRating = this.movie.user_rating.rating;
          this.userReview = this.movie.user_rating.review || '';
        }
      },
      error: (err) => {
        this.loadingLanguage = false;
        const msg = err?.error?.message || this.t('feedback.errorLoadDetails');
        this.loadError = msg;
        this.toast.error(msg);
      }
    });

    this.api.getMovieRatings(id).subscribe({
      next: (res: any) => { this.publicRatings = res?.data || []; },
      error: () => {}
    });
  }

  retry(): void {
    if (this.currentId) {
      this.loadError = '';
      this.loadMovie(this.currentId);
    }
  }

  shareMovie() {
    if (navigator.share) {
      navigator.share({
        title: this.movie?.title || 'Sulo Movies',
        text: `Vê este filme fantástico: ${this.movie?.title}`,
        url: window.location.href
      }).catch(err => console.log('Partilha cancelada ou falhou', err));
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        this.toast.success('Link do filme copiado para a área de transferência!');
      });
    }
  }

  setRating(val: number): void { this.userRating = val; }

  submitRating(): void {
    if (!this.userRating) { this.toast.warning(this.t('ratings.selectRating')); return; }
    const data = { tmdb_id: this.movie.id, movie_title: this.movie.title, poster_path: this.movie.poster_path, release_year: this.movie.release_date?.slice(0,4), rating: this.userRating, review: this.userReview };
    if (this.movie.user_rating) {
      this.api.updateRating(this.movie.id, { rating: this.userRating, review: this.userReview }).subscribe({
        next: () => {
          this.toast.success(this.t('ratings.updated'));
          this.api.getMovieRatings(this.movie.id).subscribe({ next: (res: any) => { this.publicRatings = res?.data || []; } });
        },
        error: () => this.toast.error(this.t('ratings.errorUpdate')),
      });
    } else {
      this.api.addRating(data).subscribe({
        next: () => {
          this.movie.user_rating = data;
          this.toast.success(this.t('ratings.saved'));
          this.api.getMovieRatings(this.movie.id).subscribe({ next: (res: any) => { this.publicRatings = res?.data || []; } });
        },
        error: () => this.toast.error(this.t('ratings.errorSave')),
      });
    }
  }

  toggleFav(): void {
    if (this.movie.is_favorite) {
      this.api.removeFavorite(this.movie.id).subscribe({
        next: () => { this.movie.is_favorite = false; this.toast.info(this.t('feedback.removedFavorite')); },
        error: () => this.toast.error(this.t('feedback.errorRemove')),
      });
    } else {
      this.api.addFavorite({ tmdb_id: this.movie.id, movie_title: this.movie.title, poster_path: this.movie.poster_path, release_year: this.movie.release_date?.slice(0,4) }).subscribe({
        next: () => { this.movie.is_favorite = true; this.toast.success(this.t('feedback.addedFavorite')); },
        error: () => this.toast.error(this.t('feedback.errorAdd')),
      });
    }
  }

  toggleWatchlist(): void {
    if (this.movie.in_watchlist) {
      this.api.removeFromWatchlist(this.movie.id).subscribe({
        next: () => { this.movie.in_watchlist = false; this.toast.info(this.t('feedback.removedWatchlist')); },
        error: () => this.toast.error(this.t('feedback.errorRemove')),
      });
    } else {
      this.api.addToWatchlist({ tmdb_id: this.movie.id, movie_title: this.movie.title, poster_path: this.movie.poster_path, release_year: this.movie.release_date?.slice(0,4) }).subscribe({
        next: () => { this.movie.in_watchlist = true; this.toast.success(this.t('feedback.addedWatchlist')); },
        error: () => this.toast.error(this.t('feedback.errorAdd')),
      });
    }
  }

  toggleWatched(): void {
    if (this.movie.is_watched) {
      this.api.removeFromHistory(this.movie.id).subscribe({
        next: () => { this.movie.is_watched = false; this.toast.info(this.t('feedback.removedHistory')); },
        error: () => this.toast.error(this.t('feedback.errorRemove')),
      });
    } else {
      this.api.addToHistory({ tmdb_id: this.movie.id, movie_title: this.movie.title, poster_path: this.movie.poster_path, release_year: this.movie.release_date?.slice(0,4) }).subscribe({
        next: () => { this.movie.is_watched = true; this.toast.success(this.t('feedback.markedWatched')); },
        error: () => this.toast.error(this.t('feedback.errorAdd')),
      });
    }
  }
}

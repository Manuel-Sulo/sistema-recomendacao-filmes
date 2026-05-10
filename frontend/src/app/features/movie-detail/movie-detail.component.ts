import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule, MovieCardComponent],
  template: `
    <div class="detail-page" *ngIf="movie">
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
                  [title]="movie.is_favorite ? 'Remover favorito' : 'Adicionar favorito'">♥</button>
                <button class="btn btn-icon action-btn" [class.active]="movie.in_watchlist" (click)="toggleWatchlist()"
                  [title]="movie.in_watchlist ? 'Remover watchlist' : 'Adicionar watchlist'">📋</button>
                <button class="btn btn-icon action-btn" [class.active]="movie.is_watched" (click)="toggleWatched()"
                  [title]="movie.is_watched ? 'Não visto' : 'Marcar como visto'">✓</button>
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

        <!-- Cast -->
        <section class="mt-8" *ngIf="cast.length">
          <h2 class="text-h2 mb-4">{{ 'movies.cast' | translate }}</h2>
          <div class="cast-row">
            <div *ngFor="let c of cast" class="cast-item">
              <div class="cast-img-wrapper">
                <img [src]="c.profile_path ? imgUrl + '/w185' + c.profile_path : 'assets/images/logo.png'" [alt]="c.name" class="cast-img">
              </div>
              <p class="cast-name">{{ c.name }}</p>
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
    <div *ngIf="!movie" class="container" style="padding-top: var(--space-10);">
      <div class="skeleton" style="height: 400px; width: 100%; margin-bottom: var(--space-6);"></div>
      <div class="skeleton" style="height: 24px; width: 60%; margin-bottom: var(--space-4);"></div>
      <div class="skeleton" style="height: 16px; width: 40%;"></div>
    </div>
  `,
  styles: [`
    .hero-backdrop { width: 100%; min-height: 520px; background-size: cover; background-position: center top; position: relative; }
    .hero-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to right, rgba(28, 17, 11, 0.97), rgba(28, 17, 11, 0.75) 50%, rgba(28, 17, 11, 0.4));
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
    .trailer-btn {
      padding: 10px 24px; font-size: 14px;
    }
    .star-rating { display: flex; gap: 6px; }
    .star {
      font-size: 32px; cursor: pointer; color: var(--border);
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .star.filled { color: var(--accent); }
    .star:hover { color: var(--accent); transform: scale(1.25) rotate(5deg); }
    .cast-row { display: flex; gap: var(--space-5); overflow-x: auto; padding-bottom: var(--space-4); }
    .cast-item { text-align: center; min-width: 100px; flex-shrink: 0; }
    .cast-img-wrapper {
      width: 88px; height: 88px; border-radius: var(--radius-full);
      overflow: hidden; margin: 0 auto var(--space-2);
      border: 2px solid var(--border);
      transition: border-color 0.3s ease;
    }
    .cast-item:hover .cast-img-wrapper { border-color: var(--accent); }
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
export class MovieDetailComponent implements OnInit {
  imgUrl = environment.tmdbImageUrl;
  movie: any = null;
  cast: any[] = [];
  similar: any[] = [];
  trailerKey = '';
  userRating = 0;
  hoverRating = 0;
  userReview = '';

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private toast: ToastService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getMovieDetails(id).subscribe({
      next: (res: any) => {
        this.movie = res?.data || res;
        this.cast = (this.movie.credits?.cast || []).slice(0, 10);
        this.similar = (this.movie.similar?.results || []).slice(0, 10);
        const videos = this.movie.videos?.results || [];
        const trailer = videos.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
        this.trailerKey = trailer?.key || '';
        if (this.movie.user_rating) {
          this.userRating = this.movie.user_rating.rating;
          this.userReview = this.movie.user_rating.review || '';
        }
      },
      error: () => {
        this.toast.error('Erro ao carregar detalhes do filme');
      }
    });
  }

  setRating(val: number): void { this.userRating = val; }

  submitRating(): void {
    if (!this.userRating) { this.toast.warning('Selecione uma avaliação'); return; }
    const data = { tmdb_id: this.movie.id, movie_title: this.movie.title, poster_path: this.movie.poster_path, release_year: this.movie.release_date?.slice(0,4), rating: this.userRating, review: this.userReview };
    if (this.movie.user_rating) {
      this.api.updateRating(this.movie.id, { rating: this.userRating, review: this.userReview }).subscribe({
        next: () => this.toast.success('Avaliação atualizada! ⭐'),
        error: () => this.toast.error('Erro ao atualizar avaliação'),
      });
    } else {
      this.api.addRating(data).subscribe({
        next: () => { this.movie.user_rating = data; this.toast.success('Avaliação guardada! ⭐'); },
        error: () => this.toast.error('Erro ao guardar avaliação'),
      });
    }
  }

  toggleFav(): void {
    if (this.movie.is_favorite) {
      this.api.removeFavorite(this.movie.id).subscribe({
        next: () => { this.movie.is_favorite = false; this.toast.info('Removido dos favoritos'); },
        error: () => this.toast.error('Erro ao remover favorito'),
      });
    } else {
      this.api.addFavorite({ tmdb_id: this.movie.id, movie_title: this.movie.title, poster_path: this.movie.poster_path, release_year: this.movie.release_date?.slice(0,4) }).subscribe({
        next: () => { this.movie.is_favorite = true; this.toast.success('Adicionado aos favoritos! ♥'); },
        error: () => this.toast.error('Erro ao adicionar favorito'),
      });
    }
  }

  toggleWatchlist(): void {
    if (this.movie.in_watchlist) {
      this.api.removeFromWatchlist(this.movie.id).subscribe({
        next: () => { this.movie.in_watchlist = false; this.toast.info('Removido da watchlist'); },
        error: () => this.toast.error('Erro ao remover da watchlist'),
      });
    } else {
      this.api.addToWatchlist({ tmdb_id: this.movie.id, movie_title: this.movie.title, poster_path: this.movie.poster_path, release_year: this.movie.release_date?.slice(0,4) }).subscribe({
        next: () => { this.movie.in_watchlist = true; this.toast.success('Adicionado à watchlist! 📋'); },
        error: () => this.toast.error('Erro ao adicionar à watchlist'),
      });
    }
  }

  toggleWatched(): void {
    if (this.movie.is_watched) {
      this.api.removeFromHistory(this.movie.id).subscribe({
        next: () => { this.movie.is_watched = false; this.toast.info('Removido do histórico'); },
        error: () => this.toast.error('Erro ao remover do histórico'),
      });
    } else {
      this.api.addToHistory({ tmdb_id: this.movie.id, movie_title: this.movie.title, poster_path: this.movie.poster_path, release_year: this.movie.release_date?.slice(0,4) }).subscribe({
        next: () => { this.movie.is_watched = true; this.toast.success('Marcado como visto! ✓'); },
        error: () => this.toast.error('Erro ao marcar como visto'),
      });
    }
  }
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <a [routerLink]="['/movie', movie.id || movie.tmdb_id]" class="movie-card">
      <div class="card-poster">
        <img
          *ngIf="movie.poster_path"
          [src]="imgUrl + '/w342' + movie.poster_path"
          [alt]="movie.title || movie.movie_title"
          class="poster-img"
          loading="lazy">
        <div *ngIf="!movie.poster_path" class="poster-placeholder">🎬</div>

        <!-- Overlay on hover -->
        <div class="card-overlay">
          <div class="overlay-content">
            <span class="play-icon">▶</span>
          </div>
        </div>

        <!-- Rating Badge -->
        <div *ngIf="movie.vote_average" class="rating-badge">
          <span class="rating-star">★</span>
          <span class="rating-value">{{ movie.vote_average | number:'1.1-1' }}</span>
        </div>
      </div>

      <div class="card-info">
        <h3 class="card-title">{{ movie.title || movie.movie_title }}</h3>
        <span class="card-year" *ngIf="getYear()">{{ getYear() }}</span>
      </div>
    </a>
  `,
  styles: [`
    :host { display: block; }
    .movie-card {
      display: block; text-decoration: none; color: var(--text-primary);
      transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      &:hover { transform: translateY(-8px); opacity: 1; }
    }
    .card-poster {
      position: relative; aspect-ratio: 2/3; border-radius: var(--radius-xl);
      overflow: hidden; background: var(--bg-surface);
      border: 0.8px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      transition: all 0.4s ease;
    }
    .movie-card:hover .card-poster {
      border-color: rgba(249, 115, 22, 0.3);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(249, 115, 22, 0.1);
    }
    .poster-img {
      width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.6s ease;
    }
    .movie-card:hover .poster-img { transform: scale(1.08); }
    .poster-placeholder {
      width: 100%; height: 100%; display: flex; align-items: center;
      justify-content: center; font-size: 48px;
      background: linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%);
    }
    .card-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(28, 17, 11, 0.9) 0%, transparent 50%);
      opacity: 0; transition: opacity 0.4s ease;
      display: flex; align-items: center; justify-content: center;
    }
    .movie-card:hover .card-overlay { opacity: 1; }
    .overlay-content {
      display: flex; align-items: center; justify-content: center;
    }
    .play-icon {
      width: 48px; height: 48px; border-radius: var(--radius-full);
      background: var(--accent); color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; transition: all 0.3s ease;
      box-shadow: 0 0 25px rgba(249, 115, 22, 0.4);
      transform: scale(0.8); opacity: 0;
    }
    .movie-card:hover .play-icon { transform: scale(1); opacity: 1; }
    .rating-badge {
      position: absolute; top: 10px; left: 10px;
      display: flex; align-items: center; gap: 3px;
      padding: 4px 10px; border-radius: var(--radius-full);
      background: rgba(0, 0, 0, 0.65); backdrop-filter: blur(10px);
      border: 0.8px solid rgba(255, 255, 255, 0.15);
      font-size: 12px; font-weight: 700;
    }
    .rating-star { color: var(--accent); }
    .rating-value { color: white; }
    .card-info { padding: 10px 4px 0; }
    .card-title {
      font-size: 13px; font-weight: 600; line-height: 1.3;
      display: -webkit-box; -webkit-line-clamp: 2;
      -webkit-box-orient: vertical; overflow: hidden;
      transition: color 0.2s ease;
    }
    .movie-card:hover .card-title { color: var(--accent); }
    .card-year {
      font-size: 12px; color: var(--text-muted); margin-top: 3px; display: block;
    }
  `],
})
export class MovieCardComponent {
  @Input() movie: any = {};
  imgUrl = environment.tmdbImageUrl;

  getYear(): string {
    const date = this.movie.release_date || this.movie.release_year;
    if (!date) return '';
    return String(date).slice(0, 4);
  }
}

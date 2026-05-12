import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../core/services/api.service';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, MovieCardComponent],
  template: `
    <div class="search-page container">
      <div class="search-header animate-fade-up">
        <span class="section-label">🔍 {{ 'nav.search' | translate }}</span>
        <h1 class="text-h1">{{ 'search.exploreMovies' | translate }}</h1>
        <div class="search-bar mt-4">
          <span class="search-icon">🔍</span>
          <input type="text" class="input search-input" [(ngModel)]="query"
                 (ngModelChange)="onSearch()" [placeholder]="'search.placeholder' | translate">
          <input type="number" class="input year-input" [(ngModel)]="searchYear"
                 (ngModelChange)="onSearch()" [placeholder]="'search.yearPlaceholder' | translate">
        </div>
        <p class="text-caption mt-2" style="color: var(--text-muted);">
          {{ 'search.bilingualHint' | translate }}
        </p>
      </div>

      <!-- Genre Chips -->
      <div class="genre-chips mt-6 animate-fade-up" style="animation-delay:0.1s" *ngIf="genres.length">
        <button class="genre-chip" [class.active]="!selectedGenre" (click)="selectGenre(null)">{{ 'common.all' | translate }}</button>
        <button class="genre-chip" *ngFor="let g of genres" [class.active]="selectedGenre === g.id"
                (click)="selectGenre(g.id)">{{ g.name }}</button>
      </div>

      <!-- Loading -->
      <div class="results-grid mt-8" *ngIf="loading">
        <div *ngFor="let i of [1,2,3,4,5,6,7,8]" class="skeleton" style="aspect-ratio:2/3;border-radius:var(--radius-xl)"></div>
      </div>

      <!-- Results -->
      <div class="results-grid mt-8" *ngIf="results.length && !loading">
        <app-movie-card *ngFor="let m of results" [movie]="m"></app-movie-card>
      </div>

      <!-- Pagination -->
      <div class="pagination mt-8" *ngIf="totalPages > 1 && results.length">
        <button class="btn btn-secondary" [disabled]="page <= 1" (click)="changePage(page-1)">← {{ 'search.previous' | translate }}</button>
        <span class="page-info">{{ page }} / {{ totalPages }}</span>
        <button class="btn btn-secondary" [disabled]="page >= totalPages" (click)="changePage(page+1)">{{ 'search.next' | translate }} →</button>
      </div>

      <!-- Empty state -->
      <div *ngIf="searched && !results.length && !loading" class="empty-state text-center mt-16 animate-fade-up">
        <p style="font-size:48px">🎬</p>
        <p class="text-h3 mt-4">{{ 'movies.noResults' | translate }}</p>
        <p class="text-muted mt-2">{{ 'search.tryAnother' | translate }}</p>
      </div>
    </div>
  `,
  styles: [`
    .search-page { padding-top: var(--space-10); padding-bottom: var(--space-10); }
    .section-label { font-size: 12px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.1em; }
    .search-bar { display: flex; gap: 12px; max-width: 640px; position: relative; }
    .search-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); font-size: 16px; z-index: 1; }
    .search-input { flex: 1; padding-left: 48px; border-radius: var(--radius-full); height: 52px; font-size: 15px; min-width: 200px; }
    .year-input { width: 180px; border-radius: var(--radius-full); height: 52px; font-size: 15px; text-align: center; }
    .genre-chips { display: flex; gap: 8px; flex-wrap: wrap; }
    .genre-chip {
      padding: 6px 16px; border-radius: var(--radius-full); font-size: 13px; font-weight: 600;
      background: var(--glass-bg); border: 0.8px solid var(--glass-border); color: var(--text-secondary);
      cursor: pointer; transition: all 0.25s ease; font-family: var(--font-primary);
    }
    .genre-chip:hover { border-color: var(--accent); color: var(--accent); }
    .genre-chip.active { background: var(--accent); color: white; border-color: var(--accent); }
    .results-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: var(--space-5); }
    .pagination { display: flex; justify-content: center; align-items: center; gap: var(--space-4); }
    .page-info { font-size: 14px; font-weight: 600; color: var(--text-secondary); }
    .empty-state { padding: var(--space-16) 0; }
    @media (max-width: 767px) { .results-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); } }
  `],
})
export class SearchComponent implements OnInit {
  query = '';
  searchYear: string = '';
  results: any[] = [];
  genres: any[] = [];
  selectedGenre: number | null = null;
  loading = false;
  searched = false;
  page = 1;
  totalPages = 1;
  private searchSubject = new Subject<void>();

  constructor(private api: ApiService, private route: ActivatedRoute) {
    this.searchSubject.pipe(debounceTime(400)).subscribe(() => this.doSearch());
  }

  ngOnInit(): void {
    this.api.getGenres().subscribe({
      next: (res: any) => {
        this.genres = res?.data?.genres || this.getFallbackGenres();
      },
      error: () => {
        // Fallback para quando a API TMDB falhar
        this.genres = this.getFallbackGenres();
      }
    });
    const q = this.route.snapshot.queryParamMap.get('q');
    if (q) { this.query = q; this.doSearch(); }
  }

  private getFallbackGenres(): any[] {
    return [
      { id: 28, name: "Ação" }, { id: 12, name: "Aventura" }, { id: 16, name: "Animação" },
      { id: 35, name: "Comédia" }, { id: 80, name: "Crime" }, { id: 99, name: "Documentário" },
      { id: 18, name: "Drama" }, { id: 10751, name: "Família" }, { id: 14, name: "Fantasia" },
      { id: 36, name: "História" }, { id: 27, name: "Terror" }, { id: 10402, name: "Música" },
      { id: 9648, name: "Mistério" }, { id: 10749, name: "Romance" }, { id: 878, name: "Ficção Científica" },
      { id: 10770, name: "Cinema TV" }, { id: 53, name: "Thriller" }, { id: 10752, name: "Guerra" },
      { id: 37, name: "Faroeste" }
    ];
  }

  onSearch(): void { this.page = 1; this.searchSubject.next(); }

  selectGenre(id: number | null): void {
    this.selectedGenre = id;
    this.page = 1;
    if (this.query || this.searchYear) {
      this.doSearch();
    } else if (id) {
      this.discoverByGenre();
    } else {
      // "Todos" sem termo de pesquisa: mostrar filmes populares por defeito
      this.loadPopular();
    }
  }

  changePage(p: number): void {
    this.page = p;
    if (this.query || this.searchYear) this.doSearch();
    else if (this.selectedGenre) this.discoverByGenre();
    else this.loadPopular();
  }

  private doSearch(): void {
    if (!this.query || this.query.length < 2) {
      this.results = [];
      return;
    }
    this.loading = true; this.searched = true;
    this.api.searchMovies(this.query, this.searchYear, this.page, 'multi').subscribe({
      next: (res: any) => {
        let movies = (res?.data?.results || [])
          .filter((m: any) => (m.media_type ? m.media_type !== 'person' : true));
        this.totalPages = res?.data?.total_pages || 1;
        if (this.selectedGenre) {
          movies = movies.filter((m: any) => m.genre_ids?.includes(this.selectedGenre));
        }
        // Normalize so movie-card renders titles whether it's a movie or a series
        this.results = movies.map((m: any) => ({
          ...m,
          title: m.title || m.name,
          release_date: m.release_date || m.first_air_date,
        }));
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  private discoverByGenre(): void {
    this.loading = true; this.searched = true;
    this.api.discoverMovies(this.selectedGenre!, this.page).subscribe({
      next: (res: any) => {
        this.results = res?.data?.results || [];
        this.totalPages = res?.data?.total_pages || 1;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  private loadPopular(): void {
    this.loading = true; this.searched = true;
    this.api.getPopular(this.page).subscribe({
      next: (res: any) => {
        this.results = res?.data?.results || [];
        this.totalPages = res?.data?.total_pages || 1;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }
}

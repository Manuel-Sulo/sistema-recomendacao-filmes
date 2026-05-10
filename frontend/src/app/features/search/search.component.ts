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
                 (ngModelChange)="onSearch($event)" [placeholder]="'movies.search' | translate">
        </div>
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
    .search-bar { position: relative; max-width: 560px; }
    .search-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); font-size: 16px; z-index: 1; }
    .search-input { padding-left: 48px; border-radius: var(--radius-full); height: 52px; font-size: 15px; }
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
  results: any[] = [];
  genres: any[] = [];
  selectedGenre: number | null = null;
  loading = false;
  searched = false;
  page = 1;
  totalPages = 1;
  private searchSubject = new Subject<string>();

  constructor(private api: ApiService, private route: ActivatedRoute) {
    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe(q => this.doSearch(q));
  }

  ngOnInit(): void {
    this.api.getGenres().subscribe((res: any) => {
      this.genres = res?.data?.genres || [];
    });
    const q = this.route.snapshot.queryParamMap.get('q');
    if (q) { this.query = q; this.doSearch(q); }
  }

  onSearch(q: string): void { this.page = 1; this.searchSubject.next(q); }

  selectGenre(id: number | null): void {
    this.selectedGenre = id;
    this.page = 1;
    if (this.query) { this.doSearch(this.query); }
    else if (id) { this.discoverByGenre(); }
    else { this.results = []; this.searched = false; }
  }

  changePage(p: number): void {
    this.page = p;
    if (this.query) this.doSearch(this.query);
    else if (this.selectedGenre) this.discoverByGenre();
  }

  private doSearch(q: string): void {
    if (!q || q.length < 2) { this.results = []; return; }
    this.loading = true; this.searched = true;
    this.api.searchMovies(q, this.page).subscribe({
      next: (res: any) => {
        let movies = res?.data?.results || [];
        this.totalPages = res?.data?.total_pages || 1;
        if (this.selectedGenre) {
          movies = movies.filter((m: any) => m.genre_ids?.includes(this.selectedGenre));
        }
        this.results = movies;
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
}

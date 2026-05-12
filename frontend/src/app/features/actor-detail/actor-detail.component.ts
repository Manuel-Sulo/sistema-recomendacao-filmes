import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { environment } from '../../../environments/environment';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-actor-detail',
  standalone: true,
  imports: [CommonModule, TranslateModule, MovieCardComponent, RouterLink],
  template: `
    <div class="container actor-page">
      <div *ngIf="loading" class="skeleton" style="height: 400px; width: 100%; border-radius: var(--radius-xl);"></div>

      <div *ngIf="!loading && person" class="actor-header animate-fade-up">
        <div class="actor-poster card-glass">
          <img *ngIf="person.profile_path" [src]="imgUrl + '/w300' + person.profile_path" [alt]="person.name">
          <div *ngIf="!person.profile_path" class="no-photo">🎬</div>
        </div>

        <div class="actor-info">
          <h1 class="text-display">{{ person.name }}</h1>
          <p class="text-caption mt-2" style="color: var(--accent);">
            <span *ngIf="person.known_for_department">{{ person.known_for_department }}</span>
            <span *ngIf="person.birthday"> • {{ formatDate(person.birthday) }}<span *ngIf="getAge() as a"> ({{ a }})</span></span>
            <span *ngIf="person.deathday"> • ✝ {{ formatDate(person.deathday) }}</span>
            <span *ngIf="person.place_of_birth"> • 📍 {{ person.place_of_birth }}</span>
          </p>

          <div class="actor-meta mt-3" *ngIf="person.also_known_as?.length">
            <span class="meta-pill" *ngFor="let aka of person.also_known_as.slice(0, 4)">{{ aka }}</span>
          </div>

          <div class="actor-bio mt-4">
            <h3 class="text-h3 mb-2">{{ 'actor.biography' | translate }}</h3>
            <p *ngIf="person.biography_fallback" class="bio-fallback-note">
              ℹ️ {{ 'actor.biographyFallback' | translate }}
            </p>
            <p [class.expanded]="bioExpanded" class="bio-text">
              {{ person.biography || ('actor.noBiography' | translate) }}
            </p>
            <button *ngIf="person.biography?.length > 300" class="btn btn-secondary mt-2" (click)="bioExpanded = !bioExpanded" style="padding: 4px 12px; font-size: 12px;">
              {{ bioExpanded ? ('actor.readLess' | translate) : ('actor.readMore' | translate) }}
            </button>
          </div>
        </div>
      </div>

      <div class="mt-16 animate-fade-up" style="animation-delay: 0.1s;" *ngIf="!loading && getSortedCast().length">
        <h2 class="text-h2 mb-6">{{ 'actor.filmography' | translate }} ({{ getSortedCast().length }})</h2>
        <div class="movie-grid">
          <app-movie-card *ngFor="let movie of getSortedCast()" [movie]="movie"></app-movie-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .actor-page { padding-top: var(--space-8); padding-bottom: var(--space-16); }
    .actor-header { display: flex; gap: var(--space-8); align-items: flex-start; }

    .actor-poster { width: 300px; flex-shrink: 0; border-radius: var(--radius-xl); overflow: hidden; background: var(--bg-secondary); }
    .actor-poster img { width: 100%; height: auto; display: block; }
    .no-photo { width: 100%; aspect-ratio: 2/3; display: flex; align-items: center; justify-content: center; font-size: 4rem; }

    .actor-info { flex: 1; }
    .actor-meta { display: flex; flex-wrap: wrap; gap: var(--space-2); }
    .meta-pill { font-size: 12px; padding: 4px 10px; border-radius: var(--radius-full); background: var(--glass-bg); border: 1px solid var(--glass-border); color: var(--text-secondary); }
    .bio-fallback-note { font-size: 12px; color: var(--text-muted); margin-bottom: var(--space-2); font-style: italic; }
    .bio-text { color: var(--text-secondary); line-height: 1.6; font-size: 15px; display: -webkit-box; -webkit-line-clamp: 6; -webkit-box-orient: vertical; overflow: hidden; white-space: pre-line; }
    .bio-text.expanded { display: block; -webkit-line-clamp: unset; }

    .movie-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: var(--space-5); }

    @media (max-width: 768px) {
      .actor-header { flex-direction: column; align-items: center; text-align: center; }
      .actor-poster { width: 200px; }
      .movie-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: var(--space-3); }
    }
  `]
})
export class ActorDetailComponent implements OnInit, OnDestroy {
  imgUrl = environment.tmdbImageUrl;
  person: any = null;
  credits: any = null;
  loading = true;
  bioExpanded = false;
  private sub!: Subscription;
  private langSub!: Subscription;
  private currentId!: number;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.sub = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.currentId = +id;
        this.loadData();
      }
    });

    this.langSub = this.translate.onLangChange.subscribe(() => {
      if (this.currentId) this.loadData();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.langSub?.unsubscribe();
  }

  loadData() {
    this.loading = true;
    this.api.getPerson(this.currentId).subscribe({
      next: (res: any) => {
        this.person = res?.data || null;
        this.api.getPersonCredits(this.currentId).subscribe({
          next: (credRes: any) => {
            this.credits = credRes?.data || null;
            this.loading = false;
          },
          error: () => { this.loading = false; }
        });
      },
      error: () => { this.loading = false; }
    });
  }

  getSortedCast() {
    if (!this.credits || !this.credits.cast) return [];
    return this.credits.cast
      .filter((m: any) => m.poster_path)
      .map((m: any) => ({
        ...m,
        title: m.title || m.name,
        release_date: m.release_date || m.first_air_date,
      }))
      .sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 24);
  }

  formatDate(d: string): string {
    if (!d) return '';
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return date.toLocaleDateString(this.translate.currentLang || 'pt');
  }

  getAge(): number | null {
    if (!this.person?.birthday) return null;
    const birth = new Date(this.person.birthday);
    if (isNaN(birth.getTime())) return null;
    const end = this.person.deathday ? new Date(this.person.deathday) : new Date();
    let age = end.getFullYear() - birth.getFullYear();
    const m = end.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) age--;
    return age;
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, TranslateModule, MovieCardComponent],
  template: `
    <div class="page container">
      <div class="page-header animate-fade-up">
        <span class="section-label">♥ {{ 'nav.favorites' | translate }}</span>
        <h1 class="text-h1">MEUS FAVORITOS</h1>
        <p class="text-muted mt-2">{{ favorites.length }} filmes guardados</p>
      </div>
      <div class="movie-grid mt-8" *ngIf="favorites.length">
        <div *ngFor="let f of favorites" class="fav-item animate-fade-up">
          <app-movie-card [movie]="f"></app-movie-card>
          <button class="remove-btn btn-icon" (click)="remove(f)" title="Remover">✕</button>
        </div>
      </div>
      <div *ngIf="!favorites.length && !loading" class="empty-state text-center mt-16 animate-fade-up">
        <p style="font-size:56px">♥</p>
        <p class="text-h3 mt-4">Sem favoritos ainda</p>
        <p class="text-muted mt-2">Adicione filmes aos favoritos para os ver aqui</p>
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
    .fav-item { position: relative; }
    .remove-btn {
      position: absolute; top: 8px; right: 8px; z-index: 10;
      width: 32px; height: 32px; font-size: 14px;
      background: rgba(0,0,0,0.7); color: white; border-radius: var(--radius-full);
      opacity: 0; transition: opacity 0.3s ease;
    }
    .fav-item:hover .remove-btn { opacity: 1; }
    .empty-state { padding: var(--space-16) 0; }
    @media (max-width: 767px) { .movie-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); } }
  `],
})
export class FavoritesComponent implements OnInit {
  favorites: any[] = [];
  loading = true;

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.api.getFavorites().subscribe({
      next: (res: any) => { this.favorites = res?.data || []; this.loading = false; },
      error: () => { this.loading = false; this.toast.error('Erro ao carregar favoritos'); },
    });
  }

  remove(f: any): void {
    const id = f.tmdb_id || f.id;
    this.api.removeFavorite(id).subscribe({
      next: () => {
        this.favorites = this.favorites.filter(x => (x.tmdb_id || x.id) !== id);
        this.toast.success('Removido dos favoritos');
      },
      error: () => this.toast.error('Erro ao remover'),
    });
  }
}

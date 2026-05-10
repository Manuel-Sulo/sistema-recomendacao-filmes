import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="onboarding-page">
      <div class="onboarding-bg"></div>
      <div class="onboarding-content animate-fade-up">
        <div class="onboarding-header text-center">
          <p style="font-size:48px">🎬</p>
          <h1 class="text-display mt-4">{{ 'onboarding.title' | translate }}</h1>
          <p class="text-muted mt-2" style="font-size:15px">{{ 'onboarding.subtitle' | translate }}</p>
        </div>

        <div class="genres-grid mt-8">
          <button *ngFor="let g of genres"
            class="genre-btn"
            [class.selected]="selectedIds.has(g.id)"
            (click)="toggleGenre(g.id)">
            <span class="genre-icon">{{ getIcon(g.id) }}</span>
            <span class="genre-name">{{ g.name }}</span>
            <span class="genre-check" *ngIf="selectedIds.has(g.id)">✓</span>
          </button>
        </div>

        <div class="onboarding-footer mt-8 text-center">
          <p class="text-muted mb-4">{{ selectedIds.size }} / 3 selecionados</p>
          <button class="btn btn-primary btn-continue"
            [disabled]="selectedIds.size < 3 || saving"
            (click)="save()">
            <span *ngIf="!saving">{{ 'onboarding.continue' | translate }} →</span>
            <span *ngIf="saving" class="spinner"></span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .onboarding-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      position: relative; padding: var(--space-6);
    }
    .onboarding-bg {
      position: fixed; inset: 0; z-index: -1; background: var(--bg-primary);
      background-image:
        radial-gradient(ellipse at 20% 30%, rgba(249,115,22,0.1) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 70%, rgba(255,182,144,0.06) 0%, transparent 50%);
    }
    .onboarding-content { max-width: 680px; width: 100%; }
    .genres-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: var(--space-3);
    }
    .genre-btn {
      display: flex; flex-direction: column; align-items: center; gap: var(--space-2);
      padding: var(--space-5) var(--space-3); border-radius: var(--radius-xl);
      background: var(--glass-bg); backdrop-filter: blur(12px);
      border: 1.5px solid var(--glass-border); cursor: pointer;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative; font-family: var(--font-primary); color: var(--text-primary);
    }
    .genre-btn:hover { border-color: var(--accent); transform: translateY(-4px); }
    .genre-btn.selected {
      background: rgba(249,115,22,0.12); border-color: var(--accent);
      box-shadow: 0 0 20px rgba(249,115,22,0.15);
    }
    .genre-icon { font-size: 28px; }
    .genre-name { font-size: 13px; font-weight: 600; }
    .genre-check {
      position: absolute; top: 8px; right: 8px;
      width: 22px; height: 22px; border-radius: var(--radius-full);
      background: var(--accent); color: white; display: flex;
      align-items: center; justify-content: center; font-size: 12px; font-weight: 700;
    }
    .btn-continue { height: 56px; font-size: 16px; font-weight: 800; padding: 0 48px; }
    .spinner { width: 22px; height: 22px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class OnboardingComponent implements OnInit {
  genres: any[] = [];
  selectedIds = new Set<number>();
  saving = false;

  private iconMap: { [id: number]: string } = {
    28: '💥', 12: '🧭', 16: '🎨', 35: '😂', 80: '🔫', 99: '📹',
    18: '🎭', 10751: '👨‍👩‍👧', 14: '🧙', 36: '📜', 27: '👻',
    10402: '🎵', 9648: '🔍', 10749: '❤️', 878: '🚀', 10770: '📺',
    53: '😱', 10752: '⚔️', 37: '🤠',
  };

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.api.getGenres().subscribe({
      next: (res: any) => { this.genres = res?.data?.genres || []; },
      error: () => this.toast.error('Erro ao carregar géneros'),
    });
  }

  getIcon(id: number): string { return this.iconMap[id] || '🎬'; }

  toggleGenre(id: number): void {
    if (this.selectedIds.has(id)) this.selectedIds.delete(id);
    else this.selectedIds.add(id);
  }

  save(): void {
    this.saving = true;
    const genreIds = Array.from(this.selectedIds);
    this.api.setUserGenres(genreIds).subscribe({
      next: () => {
        const user = this.auth.currentUser;
        if (user) { user.onboarded = 1; this.auth.updateUser(user); }
        this.toast.success('Preferências guardadas! 🎬');
        this.router.navigate(['/home']);
      },
      error: () => { this.saving = false; this.toast.error('Erro ao guardar preferências'); },
    });
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <div class="auth-page">
      <div class="auth-bg"></div>
      <div class="auth-content animate-fade-up">
        <div class="auth-branding">
          <img src="assets/images/logo.png" alt="Sulo Movies" class="auth-brand-logo">
          <h1 class="auth-brand-title">SULO MOVIES</h1>
          <p class="auth-brand-subtitle">{{ 'auth.register' | translate }}</p>
        </div>
        <div class="auth-card card-glass">
          <form (ngSubmit)="onSubmit()" class="auth-form">
            <div class="form-group">
              <label class="form-label">{{ 'auth.name' | translate }}</label>
              <input type="text" class="input" [(ngModel)]="name" name="name" required [placeholder]="'auth.namePlaceholder' | translate" autocomplete="name">
            </div>
            <div class="form-group">
              <label class="form-label">{{ 'auth.email' | translate }}</label>
              <input type="email" class="input" [(ngModel)]="email" name="email" required [placeholder]="'auth.emailPlaceholder' | translate" autocomplete="email">
            </div>
            <div class="form-group">
              <label class="form-label">{{ 'auth.password' | translate }}</label>
              <input type="password" class="input" [(ngModel)]="password" name="password" required [placeholder]="'auth.minPassword' | translate" autocomplete="new-password">
            </div>
            <div *ngIf="error" class="error-banner animate-fade-in">
              <span>⚠</span> <span>{{ error }}</span>
            </div>
            <button type="submit" class="btn btn-primary btn-submit" [disabled]="loading">
              <span *ngIf="!loading">{{ 'auth.register' | translate }}</span>
              <span *ngIf="loading" class="spinner"></span>
            </button>
            <p class="auth-footer-text">
              {{ 'auth.hasAccount' | translate }}
              <a routerLink="/auth/login" class="auth-footer-link">{{ 'auth.login' | translate }}</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; padding: var(--space-6); }
    .auth-bg {
      position: fixed; inset: 0; z-index: -1; background: var(--bg-primary);
      background-image: radial-gradient(ellipse at 30% 20%, rgba(249,115,22,0.08) 0%, transparent 50%),
                         radial-gradient(ellipse at 70% 80%, rgba(255,182,144,0.05) 0%, transparent 50%);
    }
    .auth-content { max-width: 440px; width: 100%; }
    .auth-branding { text-align: center; margin-bottom: var(--space-8); }
    .auth-brand-logo {
      height: 220px; width: auto; margin: 0 auto var(--space-5); display: block;
      filter: drop-shadow(0 12px 36px rgba(249, 115, 22, 0.45));
      animation: logoFloat 4s ease-in-out infinite;
    }
    @keyframes logoFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    .auth-brand-title { font-size: 64px; font-weight: 900; letter-spacing: -0.03em; line-height: 1; color: var(--accent); text-shadow: 0 6px 28px rgba(249, 115, 22, 0.35); }
    .auth-brand-subtitle { font-size: 15px; color: var(--text-muted); margin-top: var(--space-3); letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600; }
    @media (max-width: 480px) { .auth-brand-logo { height: 160px; } .auth-brand-title { font-size: 46px; } }
    .auth-card { padding: var(--space-10); border-radius: var(--radius-xl); }
    .auth-form { display: flex; flex-direction: column; gap: var(--space-5); }
    .form-group { display: flex; flex-direction: column; gap: var(--space-2); }
    .form-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; }
    .error-banner { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3) var(--space-4); font-size: 13px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); border-radius: var(--radius-md); color: var(--error); font-weight: 500; }
    .btn-submit { height: 56px; font-size: 16px; font-weight: 800; letter-spacing: 0.03em; margin-top: var(--space-2); }
    .spinner { width: 22px; height: 22px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .auth-footer-text { text-align: center; font-size: 14px; color: var(--text-muted); margin-top: var(--space-2); }
    .auth-footer-link { font-weight: 700; color: var(--accent); }
  `],
})
export class RegisterComponent {
  name = ''; email = ''; password = ''; error = ''; loading = false;

  constructor(private auth: AuthService, private router: Router, private toast: ToastService, private t: TranslateService) {}

  onSubmit(): void {
    if (!this.name || !this.email || !this.password) {
      this.error = this.t.instant('auth.fillAllFields'); this.toast.warning(this.error); return;
    }
    if (this.password.length < 6) {
      this.error = this.t.instant('auth.minPassword'); this.toast.warning(this.error); return;
    }
    this.loading = true; this.error = '';
    this.auth.register(this.name, this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.toast.success(this.t.instant('auth.accountCreated'));
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.message || this.t.instant('auth.errorCreateAccount');
        this.error = msg; this.toast.error(msg);
      },
    });
  }
}

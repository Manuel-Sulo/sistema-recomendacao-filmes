import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <div class="auth-page">
      <div class="auth-bg"></div>
      <div class="auth-content animate-fade-up">
        <div class="auth-branding">
          <img src="assets/images/logo.png" alt="Sulo Movies" class="auth-brand-logo">
          <h1 class="auth-brand-title">SULO MOVIES</h1>
          <p class="auth-brand-subtitle">{{ 'auth.resetPassword' | translate }}</p>
        </div>
        <div class="auth-card card-glass">
          <form (ngSubmit)="onSubmit()" class="auth-form" *ngIf="!sent">
            <p class="text-muted" style="font-size:14px">Introduza o seu email para receber instruções de redefinição.</p>
            <div class="form-group">
              <label class="form-label">{{ 'auth.email' | translate }}</label>
              <input type="email" class="input" [(ngModel)]="email" name="email" required placeholder="email@exemplo.com">
            </div>
            <button type="submit" class="btn btn-primary btn-submit" [disabled]="loading">
              <span *ngIf="!loading">{{ 'auth.resetPassword' | translate }}</span>
              <span *ngIf="loading" class="spinner"></span>
            </button>
            <p class="auth-footer-text"><a routerLink="/auth/login" class="auth-footer-link">← {{ 'actions.back' | translate }}</a></p>
          </form>
          <div *ngIf="sent" class="success-state text-center">
            <p style="font-size:48px">📧</p>
            <p class="text-h3 mt-4">Email enviado!</p>
            <p class="text-muted mt-2">Verifique a sua caixa de entrada</p>
            <a routerLink="/auth/login" class="btn btn-primary mt-6">{{ 'auth.login' | translate }}</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; padding: var(--space-6); }
    .auth-bg { position: fixed; inset: 0; z-index: -1; background: var(--bg-primary); background-image: radial-gradient(ellipse at 30% 20%, rgba(249,115,22,0.08) 0%, transparent 50%); }
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
    .btn-submit { height: 56px; font-size: 16px; font-weight: 800; }
    .spinner { width: 22px; height: 22px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .auth-footer-text { text-align: center; font-size: 14px; color: var(--text-muted); }
    .auth-footer-link { font-weight: 700; color: var(--accent); }
    .success-state { padding: var(--space-4) 0; }
  `],
})
export class ForgotPasswordComponent {
  email = ''; loading = false; sent = false;

  constructor(private auth: AuthService, private toast: ToastService) {}

  onSubmit(): void {
    if (!this.email) { this.toast.warning('Introduza o seu email'); return; }
    this.loading = true;
    this.auth.forgotPassword(this.email).subscribe({
      next: () => { this.loading = false; this.sent = true; this.toast.success('Email de redefinição enviado!'); },
      error: () => { this.loading = false; this.toast.error('Erro ao enviar email'); },
    });
  }
}

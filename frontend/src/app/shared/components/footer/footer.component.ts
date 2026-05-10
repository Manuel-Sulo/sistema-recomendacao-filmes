import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <footer class="app-footer">
      <div class="container footer-grid">
        <div class="footer-brand">
          <h3 class="footer-logo">SULO MOVIES</h3>
          <p class="footer-desc">{{ 'footer.description' | translate }}</p>
        </div>
        <div class="footer-links">
          <h4 class="footer-heading">{{ 'footer.navigation' | translate }}</h4>
          <a routerLink="/home">{{ 'nav.home' | translate }}</a>
          <a routerLink="/search">{{ 'nav.search' | translate }}</a>
          <a routerLink="/favorites">{{ 'nav.favorites' | translate }}</a>
          <a routerLink="/watchlist">{{ 'nav.watchlist' | translate }}</a>
        </div>
        <div class="footer-links">
          <h4 class="footer-heading">{{ 'footer.resources' | translate }}</h4>
          <a routerLink="/ratings">{{ 'nav.ratings' | translate }}</a>
          <a routerLink="/history">{{ 'nav.history' | translate }}</a>
          <a routerLink="/reports">{{ 'nav.reports' | translate }}</a>
          <a routerLink="/settings">{{ 'nav.settings' | translate }}</a>
        </div>
      </div>
      <div class="container footer-bottom">
        <span>© {{ year }} Sulo Movies. {{ 'footer.rights' | translate }}</span>
        <span class="footer-powered">Powered by TMDB & OMDB</span>
      </div>
    </footer>
  `,
  styles: [`
    .app-footer {
      border-top: 0.8px solid var(--glass-border);
      padding: var(--space-12) 0 var(--space-8);
      margin-top: var(--space-16);
      background: var(--bg-surface);
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: var(--space-8);
    }
    .footer-logo {
      font-size: 20px; font-weight: 900;
      color: var(--accent); letter-spacing: -0.02em;
    }
    .footer-desc {
      font-size: 13px; color: var(--text-muted);
      line-height: 1.6; margin-top: var(--space-3);
      max-width: 300px;
    }
    .footer-heading {
      font-size: 11px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.1em;
      color: var(--text-secondary);
      margin-bottom: var(--space-4);
    }
    .footer-links {
      display: flex; flex-direction: column; gap: var(--space-2);
    }
    .footer-links a {
      font-size: 13px; color: var(--text-muted);
      text-decoration: none; transition: color 0.2s ease;
      &:hover { color: var(--accent); }
    }
    .footer-bottom {
      display: flex; justify-content: space-between;
      align-items: center; margin-top: var(--space-10);
      padding-top: var(--space-6);
      border-top: 0.8px solid var(--glass-border);
      font-size: 12px; color: var(--text-muted);
    }
    .footer-powered {
      font-weight: 600; color: var(--text-secondary);
    }
    @media (max-width: 767px) {
      .footer-grid { grid-template-columns: 1fr; gap: var(--space-6); }
      .footer-bottom { flex-direction: column; gap: var(--space-2); text-align: center; }
    }
  `],
})
export class FooterComponent {
  year = new Date().getFullYear();
}

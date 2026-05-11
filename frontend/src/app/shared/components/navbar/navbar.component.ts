import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule, TranslateModule],
  template: `
    <nav class="navbar" [class.scrolled]="scrolled">
      <div class="navbar-inner container">
        <div class="nav-left">
          <a routerLink="/home" class="brand">
            <img src="assets/images/logo.png" alt="Sulo Movies" class="brand-logo">
            <span class="brand-name">SULO</span>
          </a>
          <div class="nav-links">
            <a routerLink="/home" routerLinkActive="active" class="nav-link">{{ 'nav.home' | translate }}</a>
            <a routerLink="/search" routerLinkActive="active" class="nav-link">{{ 'nav.search' | translate }}</a>
            <a routerLink="/favorites" routerLinkActive="active" class="nav-link">{{ 'nav.favorites' | translate }}</a>
            <a routerLink="/watchlist" routerLinkActive="active" class="nav-link">{{ 'nav.watchlist' | translate }}</a>
          </div>
        </div>

        <div class="nav-right">
          <!-- Language Selector -->
          <div class="lang-selector">
            <select class="lang-select" [ngModel]="currentLang" (ngModelChange)="changeLang($event)">
              <option value="pt">🇵🇹 PT</option>
              <option value="en">🇬🇧 EN</option>
              <option value="de">🇩🇪 DE</option>
              <option value="fr">🇫🇷 FR</option>
              <option value="it">🇮🇹 IT</option>
              <option value="ru">🇷🇺 RU</option>
              <option value="ko">🇰🇷 KO</option>
            </select>
          </div>

          <!-- Theme Toggle -->
          <button class="btn-icon theme-toggle" (click)="toggleTheme()" [title]="theme.isDark ? 'Light mode' : 'Dark mode'">
            {{ theme.isDark ? '☀️' : '🌙' }}
          </button>

          <!-- User Menu -->
          <div class="user-menu-wrapper">
            <button class="user-avatar" (click)="showMenu = !showMenu">
              <span class="avatar-initial">{{ userInitial }}</span>
            </button>
            <div class="dropdown-menu" *ngIf="showMenu" (mouseleave)="showMenu = false">
              <div class="dropdown-header">
                <span class="dropdown-name">{{ userName }}</span>
                <span class="dropdown-email">{{ userEmail }}</span>
              </div>
              <div class="dropdown-divider"></div>
              <a routerLink="/history" class="dropdown-item" (click)="showMenu = false">🎬 {{ 'nav.history' | translate }}</a>
              <a routerLink="/ratings" class="dropdown-item" (click)="showMenu = false">⭐ {{ 'nav.ratings' | translate }}</a>
              <a routerLink="/reports" class="dropdown-item" (click)="showMenu = false">📊 {{ 'export.title' | translate }}</a>
              <a routerLink="/settings" class="dropdown-item" (click)="showMenu = false">⚙️ {{ 'nav.settings' | translate }}</a>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item text-error" (click)="logout()">🚪 {{ 'nav.logout' | translate }}</button>
            </div>
          </div>

          <!-- Mobile Menu Toggle -->
          <button class="mobile-menu-btn" (click)="mobileOpen = !mobileOpen">
            {{ mobileOpen ? '✕' : '☰' }}
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <div class="mobile-nav" *ngIf="mobileOpen">
        <a routerLink="/home" routerLinkActive="active" class="mobile-link" (click)="mobileOpen = false">{{ 'nav.home' | translate }}</a>
        <a routerLink="/search" routerLinkActive="active" class="mobile-link" (click)="mobileOpen = false">{{ 'nav.search' | translate }}</a>
        <a routerLink="/favorites" routerLinkActive="active" class="mobile-link" (click)="mobileOpen = false">{{ 'nav.favorites' | translate }}</a>
        <a routerLink="/watchlist" routerLinkActive="active" class="mobile-link" (click)="mobileOpen = false">{{ 'nav.watchlist' | translate }}</a>
        <a routerLink="/history" routerLinkActive="active" class="mobile-link" (click)="mobileOpen = false">{{ 'nav.history' | translate }}</a>
        <a routerLink="/ratings" routerLinkActive="active" class="mobile-link" (click)="mobileOpen = false">{{ 'nav.ratings' | translate }}</a>
        <a routerLink="/settings" routerLinkActive="active" class="mobile-link" (click)="mobileOpen = false">{{ 'nav.settings' | translate }}</a>
        <button class="mobile-link text-error" (click)="logout()">{{ 'nav.logout' | translate }}</button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed; top: 0; left: 0; width: 100%; z-index: 100;
      background: var(--glass-bg);
      backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
      border-bottom: 0.8px solid var(--glass-border);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      height: var(--navbar-height);
      transition: all 0.3s ease;
    }
    .navbar.scrolled {
      background: var(--glass-bg-solid, rgba(28, 17, 11, 0.85));
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    }
    .navbar-inner {
      display: flex; justify-content: space-between; align-items: center; height: 100%;
    }
    .nav-left { display: flex; align-items: center; gap: 32px; }
    .brand {
      display: flex; align-items: center; gap: 10px; text-decoration: none;
      transition: transform 0.3s ease;
      &:hover { transform: scale(1.03); opacity: 1; }
    }
    .brand-logo { height: 44px; }
    .brand-name {
      font-size: 26px; font-weight: 900; letter-spacing: -0.03em;
      color: var(--accent); font-family: var(--font-display);
    }
    .nav-links {
      display: flex; gap: 6px;
      @media (max-width: 1023px) { display: none; }
    }
    .nav-link {
      padding: 8px 14px; font-size: 14px; font-weight: 500;
      color: var(--text-secondary); text-decoration: none; border-radius: var(--radius-full);
      transition: all 0.25s ease; position: relative;
      &:hover { color: var(--text-primary); background: rgba(249, 115, 22, 0.08); opacity: 1; }
      &.active {
        color: var(--accent); font-weight: 600;
        &::after {
          content: ''; position: absolute; bottom: -2px; left: 50%; transform: translateX(-50%);
          width: 20px; height: 2.5px; background: var(--accent); border-radius: 2px;
        }
      }
    }
    .nav-right { display: flex; align-items: center; gap: 8px; }
    .lang-selector { position: relative; }
    .lang-select {
      background: var(--glass-bg); border: 0.8px solid var(--glass-border);
      color: var(--text-primary); padding: 6px 10px; font-size: 12px; font-weight: 600;
      border-radius: var(--radius-full); cursor: pointer; outline: none;
      font-family: var(--font-primary); transition: all 0.25s ease;
      -webkit-appearance: none; appearance: none;
      &:hover { border-color: var(--accent); }
      &:focus { border-color: var(--accent); box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.15); }
      option { background: var(--bg-primary); color: var(--text-primary); }
    }
    .theme-toggle {
      width: 36px; height: 36px; font-size: 16px;
      border-radius: var(--radius-full);
      background: var(--glass-bg);
      border: 0.8px solid var(--glass-border);
      display: flex; align-items: center; justify-content: center;
      transition: all 0.3s ease;
      &:hover { border-color: var(--accent); transform: rotate(30deg) scale(1.1); }
    }
    .user-menu-wrapper { position: relative; }
    .user-avatar {
      width: 38px; height: 38px; border-radius: var(--radius-full);
      background: linear-gradient(135deg, var(--accent), #fb923c);
      border: 2px solid var(--accent);
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 700; font-size: 15px; text-transform: uppercase;
      transition: all 0.3s ease; cursor: pointer;
      &:hover { box-shadow: 0 0 20px rgba(249, 115, 22, 0.35); transform: scale(1.08); }
    }
    .avatar-initial { pointer-events: none; }
    .dropdown-menu {
      position: absolute; top: calc(100% + 10px); right: 0; min-width: 240px;
      background: var(--bg-elevated); border: 0.8px solid var(--glass-border);
      border-radius: var(--radius-lg); box-shadow: var(--shadow-z3);
      animation: scaleIn 0.2s ease forwards; overflow: hidden; z-index: 200;
    }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) translateY(-5px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    .dropdown-header { padding: 14px 16px; }
    .dropdown-name { display: block; font-weight: 600; font-size: 14px; color: var(--text-primary); }
    .dropdown-email { display: block; font-size: 12px; color: var(--text-muted); margin-top: 2px; }
    .dropdown-divider { height: 1px; background: var(--border); margin: 0; }
    .dropdown-item {
      display: flex; align-items: center; gap: 10px; padding: 10px 16px;
      font-size: 14px; font-weight: 500; color: var(--text-secondary);
      text-decoration: none; transition: all 0.2s ease; border: none;
      background: none; width: 100%; cursor: pointer; font-family: var(--font-primary);
      &:hover { background: rgba(249, 115, 22, 0.08); color: var(--text-primary); }
    }
    .text-error { color: var(--error) !important; }
    .mobile-menu-btn {
      display: none; width: 38px; height: 38px; font-size: 20px;
      background: none; border: none; color: var(--text-primary);
      @media (max-width: 1023px) { display: flex; align-items: center; justify-content: center; }
    }
    .mobile-nav {
      display: none; flex-direction: column; padding: 16px 24px;
      background: var(--bg-elevated); border-top: 1px solid var(--border);
      animation: fadeUp 0.3s ease;
      @media (max-width: 1023px) { display: flex; }
    }
    .mobile-link {
      padding: 12px 0; font-size: 16px; font-weight: 500;
      color: var(--text-secondary); text-decoration: none; border: none;
      background: none; text-align: left; font-family: var(--font-primary);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      transition: color 0.2s ease;
      &:hover, &.active { color: var(--accent); }
    }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  `],
})
export class NavbarComponent {
  showMenu = false;
  mobileOpen = false;
  scrolled = false;
  currentLang = 'pt';

  constructor(
    public auth: AuthService,
    public theme: ThemeService,
    private translate: TranslateService,
    private api: ApiService,
    private router: Router
  ) {
    const user = this.auth.currentUser;
    if (user) this.currentLang = user.preferred_language || 'pt';

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.scrolled = window.scrollY > 20;
      });
    }
  }

  get userName(): string { return this.auth.currentUser?.name || 'User'; }
  get userEmail(): string { return this.auth.currentUser?.email || ''; }
  get userInitial(): string { return this.userName.charAt(0).toUpperCase(); }

  changeLang(lang: string): void {
    this.currentLang = lang;
    this.translate.use(lang);
    this.api.updateProfile({ preferred_language: lang }).subscribe();
  }

  toggleTheme(): void {
    this.theme.toggle();
    this.api.updateProfile({ theme: this.theme.currentTheme }).subscribe();
  }

  logout(): void {
    this.showMenu = false;
    this.mobileOpen = false;
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../core/services/api.service';
import { AuthService, User } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="settings-page container">
      <h1 class="text-h1 animate-fade-up">{{ 'nav.settings' | translate }}</h1>

      <!-- Profile -->
      <section class="card-glass p-6 mt-6 animate-fade-up">
        <h2 class="text-h3 mb-4">{{ 'settings.profile' | translate }}</h2>
        <div class="form-group"><label>{{ 'auth.name' | translate }}</label><input class="input" [(ngModel)]="name"></div>
        <button class="btn btn-primary mt-4" (click)="saveProfile()">{{ 'actions.save' | translate }}</button>
      </section>

      <!-- Appearance -->
      <section class="card-glass p-6 mt-4 animate-fade-up" style="animation-delay: 0.1s;">
        <h2 class="text-h3 mb-4">{{ 'settings.appearance' | translate }}</h2>
        <div class="flex gap-4 items-center" style="flex-wrap: wrap;">
          <label>{{ 'settings.theme' | translate }}:</label>
          <span class="theme-current">
            {{ theme.isDark ? ('settings.dark' | translate) : ('settings.light' | translate) }}
            {{ theme.isDark ? '🌙' : '☀️' }}
          </span>
          <button class="btn btn-secondary" (click)="toggleTheme()">
            {{ 'settings.switchTo' | translate }}
            {{ theme.isDark ? ('settings.light' | translate) : ('settings.dark' | translate) }}
          </button>
        </div>
        <div class="flex gap-4 items-center mt-4">
          <label>{{ 'settings.language' | translate }}:</label>
          <select class="input" style="width:auto" [(ngModel)]="lang" (ngModelChange)="changeLang($event)">
            <option value="pt">🇵🇹 Português</option>
            <option value="en">🇬🇧 English</option>
            <option value="de">🇩🇪 Deutsch</option>
            <option value="fr">🇫🇷 Français</option>
            <option value="it">🇮🇹 Italiano</option>
            <option value="ru">🇷🇺 Русский</option>
            <option value="ko">🇰🇷 한국어</option>
          </select>
        </div>
      </section>

      <!-- Password -->
      <section class="card-glass p-6 mt-4 animate-fade-up" style="animation-delay: 0.2s;">
        <h2 class="text-h3 mb-4">{{ 'settings.changePassword' | translate }}</h2>
        <div class="form-group"><label>{{ 'settings.currentPassword' | translate }}</label><input type="password" class="input" [(ngModel)]="currentPass"></div>
        <div class="form-group mt-3"><label>{{ 'settings.newPassword' | translate }}</label><input type="password" class="input" [(ngModel)]="newPass"></div>
        <button class="btn btn-primary mt-4" (click)="changePassword()">{{ 'actions.save' | translate }}</button>
      </section>
    </div>
  `,
  styles: [`
    .settings-page { padding-top: var(--space-10); padding-bottom: var(--space-10); max-width: 600px; }
    .form-group { display: flex; flex-direction: column; gap: var(--space-2); }
    .form-group label { font-size: 13px; font-weight: 500; color: var(--text-secondary); }
    .theme-current { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: var(--radius-full); background: var(--glass-bg); border: 1px solid var(--glass-border); font-size: 13px; font-weight: 600; color: var(--accent); }
  `],
})
export class SettingsComponent implements OnInit {
  name = ''; lang = 'pt'; currentPass = ''; newPass = '';

  constructor(
    private api: ApiService,
    public auth: AuthService,
    public theme: ThemeService,
    private translate: TranslateService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const u = this.auth.currentUser;
    if (u) { this.name = u.name; this.lang = u.preferred_language; }
  }

  saveProfile(): void {
    this.api.updateProfile({ name: this.name }).subscribe({
      next: (r: any) => {
        if (r?.data) this.auth.updateUser(r.data);
        this.toast.success('Perfil guardado com sucesso!');
      },
      error: () => { this.toast.error('Erro ao guardar perfil'); },
    });
  }

  toggleTheme(): void {
    this.theme.toggle();
    this.api.updateProfile({ theme: this.theme.currentTheme }).subscribe();
    const key = this.theme.isDark ? 'feedback.darkEnabled' : 'feedback.lightEnabled';
    this.toast.info(this.translate.instant(key));
  }

  changeLang(lang: string): void {
    this.translate.use(lang);
    this.api.updateProfile({ preferred_language: lang }).subscribe();
    this.toast.success('Idioma alterado!');
  }

  changePassword(): void {
    if (!this.currentPass || !this.newPass) {
      this.toast.warning('Preencha ambos os campos');
      return;
    }
    this.api.updatePassword({ current_password: this.currentPass, new_password: this.newPass }).subscribe({
      next: () => {
        this.toast.success('Password atualizada com sucesso! 🔒');
        this.currentPass = ''; this.newPass = '';
      },
      error: (e) => { this.toast.error(e.error?.message || 'Erro ao alterar password'); },
    });
  }
}

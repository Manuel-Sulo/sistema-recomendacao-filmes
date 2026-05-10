import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from './core/services/theme.service';
import { AuthService } from './core/services/auth.service';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ToastContainerComponent } from './shared/components/toast/toast-container.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent, ToastContainerComponent],
  template: `
    <app-navbar *ngIf="auth.isLoggedIn"></app-navbar>
    <main [class.with-navbar]="auth.isLoggedIn">
      <router-outlet></router-outlet>
    </main>
    <app-footer *ngIf="auth.isLoggedIn"></app-footer>
    <app-toast-container></app-toast-container>
  `,
  styles: [`
    main.with-navbar {
      padding-top: var(--navbar-height);
    }
  `],
})
export class AppComponent implements OnInit {
  constructor(
    private translate: TranslateService,
    private theme: ThemeService,
    public auth: AuthService
  ) {
    this.translate.setDefaultLang('pt');
    const user = this.auth.currentUser;
    if (user) {
      this.translate.use(user.preferred_language || 'pt');
      this.theme.setTheme(user.theme || 'dark');
    }
  }

  ngOnInit(): void {}
}

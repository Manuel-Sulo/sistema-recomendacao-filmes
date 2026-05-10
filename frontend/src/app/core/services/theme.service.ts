import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private themeSubject = new BehaviorSubject<string>('dark');
  public theme$ = this.themeSubject.asObservable();

  constructor() {
    const saved = localStorage.getItem('theme') || 'dark';
    this.setTheme(saved);
  }

  get currentTheme(): string { return this.themeSubject.value; }
  get isDark(): boolean { return this.currentTheme === 'dark'; }

  setTheme(theme: string): void {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    this.themeSubject.next(theme);
  }

  toggle(): void {
    this.setTheme(this.isDark ? 'light' : 'dark');
  }
}

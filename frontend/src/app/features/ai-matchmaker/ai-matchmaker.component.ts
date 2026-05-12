import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../core/services/toast.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-ai-matchmaker',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, MovieCardComponent, RouterLink],
  template: `
    <div class="ai-page container">
      <div class="ai-header animate-fade-up">
        <span class="section-label">🤖 AI Matchmaker</span>
        <h1 class="text-h1">{{ 'ai.title' | translate }}</h1>
        <p class="text-muted mt-2">{{ 'ai.subtitle' | translate }}</p>
      </div>

      <div class="chat-container mt-8 card-glass animate-fade-up" style="animation-delay: 0.1s;">
        <div class="chat-messages" #scrollMe>
          <div *ngFor="let msg of messages" class="message-bubble" [ngClass]="msg.role">
            <div class="message-content">
              <p *ngIf="msg.text" style="white-space: pre-line;">{{ msg.text }}</p>

              <div *ngIf="msg.movies && msg.movies.length" class="mt-4 movie-suggestions">
                <div *ngFor="let m of msg.movies" class="ai-movie-card card-glass">
                  <img *ngIf="m.poster_path" [src]="imgUrl + '/w154' + m.poster_path" [alt]="m.title || m.name" class="ai-poster" [routerLink]="['/movie', m.id]">
                  <div *ngIf="!m.poster_path" class="ai-poster" style="display:flex;align-items:center;justify-content:center;background:var(--bg-secondary);font-size:32px;">🎬</div>
                  <div class="ai-info">
                    <h3 class="text-h3" [routerLink]="['/movie', m.id]" style="cursor: pointer;">{{ m.title || m.name }}</h3>
                    <span class="text-caption mt-1 d-block">
                      {{ (m.release_date || m.first_air_date) | slice:0:4 }}
                      <span *ngIf="m.media_type === 'tv'"> • {{ 'ai.series' | translate }}</span>
                    </span>
                    <p class="mt-2" style="font-size: 13px; color: var(--accent);">✨ {{ m.ai_reason }}</p>
                    <button class="btn btn-secondary mt-3" style="padding: 6px 12px; font-size: 12px;" (click)="addWatchlist(m)">+ {{ 'actions.addWatchlist' | translate }}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="loading" class="message-bubble ai loading-dots">
            <div class="dot"></div><div class="dot"></div><div class="dot"></div>
          </div>
        </div>

        <div class="chat-input-area">
          <input type="text" class="input chat-input" [(ngModel)]="prompt" (keyup.enter)="send()"
                 [placeholder]="'ai.placeholder' | translate" [disabled]="loading">
          <button class="btn btn-primary send-btn" (click)="send()" [disabled]="loading || !prompt">{{ 'ai.send' | translate }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ai-page { padding-top: var(--space-10); padding-bottom: var(--space-10); max-width: 800px; margin: 0 auto; }
    .section-label { font-size: 12px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.1em; }
    
    .chat-container { display: flex; flex-direction: column; height: 65vh; border-radius: var(--radius-xl); overflow: hidden; background: var(--surface-opacity); border: 1px solid var(--border); box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
    .chat-messages { flex: 1; overflow-y: auto; padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-4); }
    
    .message-bubble { max-width: 85%; padding: var(--space-4); border-radius: var(--radius-lg); font-size: 15px; line-height: 1.6; }
    .message-bubble.user { align-self: flex-end; background: var(--accent); color: white; border-bottom-right-radius: 4px; }
    .message-bubble.ai { align-self: flex-start; background: var(--bg-secondary); color: var(--text-primary); border-bottom-left-radius: 4px; border: 1px solid var(--border); }
    
    .movie-suggestions { display: flex; flex-direction: column; gap: var(--space-3); }
    .ai-movie-card { display: flex; gap: var(--space-4); padding: var(--space-3); border-radius: var(--radius-md); background: var(--bg-primary); border: 1px solid var(--border); transition: transform 0.2s; }
    .ai-movie-card:hover { transform: translateY(-2px); border-color: var(--accent); }
    .ai-poster { width: 70px; border-radius: 4px; object-fit: cover; }
    .ai-info { flex: 1; }
    
    .chat-input-area { padding: var(--space-4); background: var(--bg-secondary); border-top: 1px solid var(--border); display: flex; gap: var(--space-3); }
    .chat-input { flex: 1; border-radius: var(--radius-full); }
    .send-btn { border-radius: var(--radius-full); padding: 0 24px; }
    
    .loading-dots { display: flex; gap: 4px; padding: var(--space-4) var(--space-5); align-items: center; justify-content: center; width: 60px; height: 40px; }
    .dot { width: 8px; height: 8px; background: var(--text-muted); border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; }
    .dot:nth-child(1) { animation-delay: -0.32s; }
    .dot:nth-child(2) { animation-delay: -0.16s; }
    @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
  `]
})
export class AiMatchmakerComponent implements AfterViewChecked {
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  prompt = '';
  loading = false;
  imgUrl = environment.tmdbImageUrl;
  messages: { role: 'user' | 'ai', text: string, movies?: any[] }[] = [];

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private translate: TranslateService
  ) {
    this.messages.push({ role: 'ai', text: this.translate.instant('ai.welcome') });
    this.translate.onLangChange.subscribe(() => {
      if (this.messages.length === 1) {
        this.messages = [{ role: 'ai', text: this.translate.instant('ai.welcome') }];
      }
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  send() {
    const userText = this.prompt.trim();
    if (!userText) return;

    this.messages.push({ role: 'user', text: userText });
    this.prompt = '';
    this.loading = true;

    const history = this.messages
      .filter(m => m.text)
      .slice(-12)
      .map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user' as 'user' | 'assistant',
        content: m.text,
      }));
    // Drop the most recent user entry — it's sent separately as the prompt
    history.pop();

    this.api.aiMatch(userText, history).subscribe({
      next: (res: any) => {
        const data = res?.data || {};
        const reply: string = data.reply || '';
        const recommendations: any[] = data.recommendations || [];

        if (reply || recommendations.length) {
          this.messages.push({
            role: 'ai',
            text: reply || this.translate.instant('ai.foundMovies'),
            movies: recommendations,
          });
        } else {
          this.messages.push({
            role: 'ai',
            text: this.translate.instant('ai.notFound'),
          });
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.message || this.translate.instant('ai.connectionError');
        this.messages.push({ role: 'ai', text: msg });
      }
    });
  }

  addWatchlist(movie: any) {
    this.api.addToWatchlist({
      tmdb_id: movie.id,
      movie_title: movie.title || movie.name,
      poster_path: movie.poster_path,
      release_year: (movie.release_date || movie.first_air_date || '').slice(0, 4),
    }).subscribe({
      next: () => this.toast.success(this.translate.instant('feedback.addedWatchlist')),
      error: () => this.toast.error(this.translate.instant('feedback.errorAdd'))
    });
  }
}

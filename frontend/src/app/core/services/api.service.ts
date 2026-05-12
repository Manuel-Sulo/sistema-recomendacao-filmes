import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private translate: TranslateService) {}

  private get langParam(): string {
    return this.translate.currentLang || 'pt';
  }

  // Movies
  getTrending(page = 1): Observable<any> { return this.http.get(`${this.apiUrl}/movies/trending?page=${page}&lang=${this.langParam}`); }
  getPopular(page = 1): Observable<any> { return this.http.get(`${this.apiUrl}/movies/popular?page=${page}&lang=${this.langParam}`); }
  getTopRated(page = 1): Observable<any> { return this.http.get(`${this.apiUrl}/movies/top-rated?page=${page}&lang=${this.langParam}`); }
  searchMovies(q: string, year?: string, page = 1, type: 'movie' | 'multi' = 'multi'): Observable<any> {
    let url = `${this.apiUrl}/movies/search?q=${encodeURIComponent(q)}&page=${page}&lang=${this.langParam}&type=${type}`;
    if (year) url += `&year=${year}`;
    return this.http.get(url);
  }
  getMovieDetails(id: number): Observable<any> { return this.http.get(`${this.apiUrl}/movies/${id}?lang=${this.langParam}`); }
  getSimilarMovies(id: number): Observable<any> { return this.http.get(`${this.apiUrl}/movies/${id}/similar?lang=${this.langParam}`); }
  getGenres(): Observable<any> { return this.http.get(`${this.apiUrl}/movies/genres?lang=${this.langParam}`); }
  discoverMovies(genre: number, page = 1, sort: string = 'popularity.desc'): Observable<any> {
    return this.http.get(`${this.apiUrl}/movies/discover?genre=${genre}&page=${page}&sort=${sort}&lang=${this.langParam}`);
  }

  // Recommendations
  getRecommendations(): Observable<any> { return this.http.get(`${this.apiUrl}/recommendations?lang=${this.langParam}`); }

  // Favorites
  getFavorites(): Observable<any> { return this.http.get(`${this.apiUrl}/favorites`); }
  addFavorite(data: any): Observable<any> { return this.http.post(`${this.apiUrl}/favorites`, data); }
  removeFavorite(tmdbId: number): Observable<any> { return this.http.delete(`${this.apiUrl}/favorites/${tmdbId}`); }

  // Watchlist
  getWatchlist(): Observable<any> { return this.http.get(`${this.apiUrl}/watchlist`); }
  addToWatchlist(data: any): Observable<any> { return this.http.post(`${this.apiUrl}/watchlist`, data); }
  removeFromWatchlist(tmdbId: number): Observable<any> { return this.http.delete(`${this.apiUrl}/watchlist/${tmdbId}`); }

  // Ratings
  getRatings(): Observable<any> { return this.http.get(`${this.apiUrl}/ratings`); }
  getMovieRatings(tmdbId: number): Observable<any> { return this.http.get(`${this.apiUrl}/ratings/movie/${tmdbId}`); }
  addRating(data: any): Observable<any> { return this.http.post(`${this.apiUrl}/ratings`, data); }
  updateRating(tmdbId: number, data: any): Observable<any> { return this.http.put(`${this.apiUrl}/ratings/${tmdbId}`, data); }
  deleteRating(tmdbId: number): Observable<any> { return this.http.delete(`${this.apiUrl}/ratings/${tmdbId}`); }

  // History
  getHistory(): Observable<any> { return this.http.get(`${this.apiUrl}/history`); }
  addToHistory(data: any): Observable<any> { return this.http.post(`${this.apiUrl}/history`, data); }
  removeFromHistory(tmdbId: number): Observable<any> { return this.http.delete(`${this.apiUrl}/history/${tmdbId}`); }

  // User
  getProfile(): Observable<any> { return this.http.get(`${this.apiUrl}/user/profile`); }
  updateProfile(data: any): Observable<any> { return this.http.put(`${this.apiUrl}/user/profile`, data); }
  updatePassword(data: any): Observable<any> { return this.http.put(`${this.apiUrl}/user/password`, data); }
  getUserGenres(): Observable<any> { return this.http.get(`${this.apiUrl}/user/genres`); }
  setUserGenres(genres: any[]): Observable<any> { return this.http.post(`${this.apiUrl}/user/genres`, { genres }); }
  getStats(): Observable<any> { return this.http.get(`${this.apiUrl}/user/stats`); }

  // Person
  getPerson(id: number): Observable<any> { return this.http.get(`${this.apiUrl}/person/${id}?lang=${this.langParam}`); }
  getPersonCredits(id: number): Observable<any> { return this.http.get(`${this.apiUrl}/person/${id}/movie_credits?lang=${this.langParam}`); }

  // AI
  aiMatch(prompt: string, history: { role: 'user' | 'assistant', content: string }[] = []): Observable<any> {
    return this.http.post(`${this.apiUrl}/ai/match?lang=${this.langParam}`, { prompt, history });
  }

  // Export
  exportData(type: string, format = 'csv'): void {
    this.http.get(`${this.apiUrl}/export/${type}?format=${format}`, {
      responseType: 'blob',
      observe: 'response'
    }).subscribe({
      next: (response) => {
        const blob = response.body!;
        const filename = `${type}_${new Date().toISOString().slice(0,10)}.${format === 'csv' ? 'csv' : 'html'}`;
        if (format === 'csv') {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = filename; a.click();
          window.URL.revokeObjectURL(url);
        } else {
          // PDF-like: open HTML in new window and trigger print
          const reader = new FileReader();
          reader.onload = () => {
            const win = window.open('', '_blank');
            if (win) { win.document.write(reader.result as string); win.document.close(); win.print(); }
          };
          reader.readAsText(blob);
        }
      },
      error: () => {}
    });
  }

  // Admin
  getAdminUsers(): Observable<any> { return this.http.get(`${this.apiUrl}/admin/users`); }
  getAdminStats(): Observable<any> { return this.http.get(`${this.apiUrl}/admin/stats`); }
  deleteAdminRating(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/admin/ratings/${id}`); }
}

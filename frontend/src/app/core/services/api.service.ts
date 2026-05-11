import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Movies
  getTrending(page = 1): Observable<any> { return this.http.get(`${this.apiUrl}/movies/trending?page=${page}`); }
  getPopular(page = 1): Observable<any> { return this.http.get(`${this.apiUrl}/movies/popular?page=${page}`); }
  getTopRated(page = 1): Observable<any> { return this.http.get(`${this.apiUrl}/movies/top-rated?page=${page}`); }
  searchMovies(q: string, page = 1): Observable<any> { return this.http.get(`${this.apiUrl}/movies/search?q=${encodeURIComponent(q)}&page=${page}`); }
  getMovieDetails(id: number): Observable<any> { return this.http.get(`${this.apiUrl}/movies/${id}`); }
  getSimilarMovies(id: number): Observable<any> { return this.http.get(`${this.apiUrl}/movies/${id}/similar`); }
  getGenres(): Observable<any> { return this.http.get(`${this.apiUrl}/movies/genres`); }
  discoverMovies(genre: number, page = 1): Observable<any> { return this.http.get(`${this.apiUrl}/movies/discover?genre=${genre}&page=${page}`); }

  // Recommendations
  getRecommendations(): Observable<any> { return this.http.get(`${this.apiUrl}/recommendations`); }

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

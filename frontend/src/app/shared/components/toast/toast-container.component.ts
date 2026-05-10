import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let t of toasts; trackBy: trackById"
        class="toast toast-{{ t.type }}"
        [class.toast-exit]="t.exiting"
        (click)="dismiss(t)">
        <span class="toast-icon">{{ t.icon }}</span>
        <span class="toast-message">{{ t.message }}</span>
        <div class="toast-progress" [style.animation-duration]="t.duration + 'ms'"></div>
      </div>
    </div>
  `,
  styles: [`
    .toast { position: relative; overflow: hidden; }
    .toast-message { flex: 1; }
  `],
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts: (Toast & { exiting?: boolean })[] = [];
  private sub!: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.sub = this.toastService.toasts$.subscribe((toast) => {
      this.toasts.push(toast);
      // Auto-dismiss
      setTimeout(() => this.dismiss(toast), toast.duration);
      // Limit to 5 toasts max
      if (this.toasts.length > 5) {
        this.toasts.shift();
      }
    });
  }

  dismiss(toast: Toast & { exiting?: boolean }): void {
    const idx = this.toasts.findIndex((t) => t.id === toast.id);
    if (idx === -1) return;
    this.toasts[idx].exiting = true;
    setTimeout(() => {
      this.toasts = this.toasts.filter((t) => t.id !== toast.id);
    }, 300);
  }

  trackById(_: number, toast: Toast): number {
    return toast.id;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}

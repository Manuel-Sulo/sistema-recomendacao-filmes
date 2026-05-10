import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  icon: string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  toasts$ = new Subject<Toast>();
  remove$ = new Subject<number>();

  private iconMap = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };

  success(message: string, duration = 3500): void {
    this.show('success', message, duration);
  }

  error(message: string, duration = 4500): void {
    this.show('error', message, duration);
  }

  info(message: string, duration = 3000): void {
    this.show('info', message, duration);
  }

  warning(message: string, duration = 4000): void {
    this.show('warning', message, duration);
  }

  private show(type: Toast['type'], message: string, duration: number): void {
    const toast: Toast = {
      id: ++this.counter,
      type,
      message,
      icon: this.iconMap[type],
      duration,
    };
    this.toasts$.next(toast);
  }
}

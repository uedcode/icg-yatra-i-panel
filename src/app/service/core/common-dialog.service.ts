import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type CommonDialogMode = 'confirm' | 'message';
export type CommonDialogType = 'default' | 'delete' | 'danger' | 'success' | 'warning';

export interface CommonDialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  okText?: string;
  type?: CommonDialogType;
}

export interface CommonDialogState extends CommonDialogOptions {
  mode: CommonDialogMode;
}

interface CommonDialogQueueItem {
  state: CommonDialogState;
  resolve: (value: boolean) => void;
}

@Injectable({
  providedIn: 'root',
})
export class CommonDialogService {
  private readonly stateSubject = new BehaviorSubject<CommonDialogState | null>(null);
  readonly state$ = this.stateSubject.asObservable();

  private queue: CommonDialogQueueItem[] = [];
  private activeItem: CommonDialogQueueItem | null = null;

  confirm(options: CommonDialogOptions): Promise<boolean> {
    return this.enqueue({
      title: options.title || 'Are You Sure?',
      message: options.message,
      confirmText: options.confirmText || 'Yes',
      cancelText: options.cancelText || 'No',
      type: options.type || 'delete',
      mode: 'confirm',
    });
  }

  message(options: CommonDialogOptions): Promise<void> {
    return this.enqueue({
      title: options.title || 'Alert',
      message: options.message,
      okText: options.okText || 'OK',
      type: options.type || 'default',
      mode: 'message',
    }).then(() => undefined);
  }

  resolve(result: boolean): void {
    if (!this.activeItem) {
      return;
    }

    const current = this.activeItem;
    this.activeItem = null;
    this.stateSubject.next(null);
    current.resolve(result);
    this.showNext();
  }

  private enqueue(state: CommonDialogState): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.queue.push({ state, resolve });
      this.showNext();
    });
  }

  private showNext(): void {
    if (this.activeItem || !this.queue.length) {
      return;
    }

    this.activeItem = this.queue.shift() || null;
    if (!this.activeItem) {
      return;
    }
    this.stateSubject.next(this.activeItem.state);
  }
}

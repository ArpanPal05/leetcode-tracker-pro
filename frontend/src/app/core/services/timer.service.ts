import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  readonly secondsElapsed = signal<number>(0);
  readonly isRunning = signal<boolean>(false);
  readonly isPaused = signal<boolean>(false);

  private timerInterval: ReturnType<typeof setInterval> | null = null;

  start(): void {
    if (this.isRunning() && !this.isPaused()) return;

    this.isRunning.set(true);
    this.isPaused.set(false);

    if (!this.timerInterval) {
      this.timerInterval = setInterval(() => {
        this.secondsElapsed.update((prev) => prev + 1);
      }, 1000);
    }
  }

  pause(): void {
    if (!this.isRunning() || this.isPaused()) return;
    this.isPaused.set(true);
    this.clearInterval();
  }

  resume(): void {
    if (this.isPaused()) {
      this.start();
    }
  }

  toggle(): void {
    if (!this.isRunning() || this.isPaused()) {
      this.start();
    } else {
      this.pause();
    }
  }

  stop(): void {
    this.clearInterval();
    this.isRunning.set(false);
    this.isPaused.set(false);
  }

  reset(): void {
    this.stop();
    this.secondsElapsed.set(0);
  }

  setMinutes(minutes: number): void {
    this.secondsElapsed.set(minutes * 60);
  }

  get elapsedMinutes(): number {
    const secs = this.secondsElapsed();
    if (secs === 0) return 0;
    return Math.max(1, Math.round(secs / 60));
  }

  get formattedTime(): string {
    const totalSecs = this.secondsElapsed();
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  }

  private clearInterval(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
}

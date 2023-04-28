import { Injectable } from '@angular/core';

@Injectable()
export class TimerService {
  private _minutes: number = 0;
  private _seconds: number = 0;
  private _totalSeconds: number = 0;
  private _timer;
  get minutes(): string { return this._minutes.toString().padStart(2, '0'); }
  get seconds(): string { return this._seconds.toString().padStart(2, '0'); }

  constructor() { }

  start() {
    this._timer = setInterval(() => {
      this._minutes = Math.floor(++this._totalSeconds / 60);
      this._seconds = this._totalSeconds - this._minutes * 60;
    }, 1000);
  }

  stop() {
    clearInterval(this._timer);
  }
  reset() {
    this._totalSeconds = this._minutes = this._seconds = 0;
  }
}

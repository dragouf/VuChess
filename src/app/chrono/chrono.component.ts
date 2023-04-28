import { Component, OnInit } from '@angular/core';
import { TimerService } from '../services/timer.service'

@Component({
  selector: 'chrono',
  templateUrl: './chrono.component.html',
  styleUrls: ['./chrono.component.css']
})
export class ChronoComponent implements OnInit {
  constructor(private timer: TimerService) { }

  ngOnInit() {
    this.timer.start();
    this.timer.start();
  }
}
